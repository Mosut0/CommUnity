-- Migration: Create moderation tables for pin reporting system
-- This migration adds tables to track user strikes, shadowbans, and pin reports
--
-- CONFIGURATION (defined in config/moderation.ts):
-- - REPORT_THRESHOLD_FOR_PIN_DELETION: 10 reports
-- - STRIKE_THRESHOLD_FOR_SHADOWBAN: 5 strikes
--
-- IMPORTANT: If you change these values in config/moderation.ts, you MUST also
-- update the hardcoded values in the trigger function below (search for >= 10 and >= 5)

-- Table to track user moderation status (strikes and shadowbans)
CREATE TABLE IF NOT EXISTS public.user_moderation (
  id bigserial PRIMARY KEY,
  user_id uuid NOT NULL UNIQUE,
  strike_count integer NOT NULL DEFAULT 0,
  is_shadowbanned boolean NOT NULL DEFAULT false,
  shadowban_reason text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_moderation_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Index for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_moderation_user_id ON public.user_moderation(user_id);
CREATE INDEX IF NOT EXISTS idx_user_moderation_shadowbanned ON public.user_moderation(is_shadowbanned) WHERE is_shadowbanned = true;

-- Table to track individual pin reports
CREATE TABLE IF NOT EXISTS public.pin_reports (
  report_id bigserial PRIMARY KEY,
  pin_id integer NOT NULL,
  reporter_user_id uuid NOT NULL,
  reason text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT pin_reports_pin_id_fkey FOREIGN KEY (pin_id) REFERENCES public.reports(reportid) ON DELETE CASCADE,
  CONSTRAINT pin_reports_reporter_user_id_fkey FOREIGN KEY (reporter_user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  -- Prevent duplicate reports from the same user on the same pin
  CONSTRAINT pin_reports_unique_user_pin UNIQUE (pin_id, reporter_user_id)
);

-- Indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_pin_reports_pin_id ON public.pin_reports(pin_id);
CREATE INDEX IF NOT EXISTS idx_pin_reports_reporter_user_id ON public.pin_reports(reporter_user_id);

-- Function to handle automatic pin deletion and strike assignment
-- Uses row-level locking to prevent race conditions from concurrent reports
CREATE OR REPLACE FUNCTION public.handle_pin_report_threshold()
RETURNS TRIGGER AS $$
DECLARE
  report_count integer;
  pin_owner_id uuid;
  current_strikes integer;
BEGIN
  -- Lock the pin row to prevent race conditions from concurrent reports
  -- FOR UPDATE NOWAIT: If another trigger is already processing this pin, skip
  -- This ensures only ONE trigger processes the pin deletion/strike logic
  BEGIN
    SELECT userid INTO STRICT pin_owner_id
    FROM public.reports
    WHERE reportid = NEW.pin_id
    FOR UPDATE NOWAIT;
  EXCEPTION
    WHEN lock_not_available THEN
      -- Another trigger is already processing this pin, skip
      RETURN NEW;
    WHEN no_data_found THEN
      -- Pin doesn't exist (already deleted by another trigger), skip
      RETURN NEW;
  END;
  
  -- Count total reports for this pin
  SELECT COUNT(DISTINCT reporter_user_id) INTO report_count
  FROM public.pin_reports
  WHERE pin_id = NEW.pin_id;
  
  -- If we've reached the threshold (REPORT_THRESHOLD_FOR_PIN_DELETION = 10)
  IF report_count >= 10 THEN
    -- pin_owner_id is already set from the FOR UPDATE query above
    IF pin_owner_id IS NOT NULL THEN
      -- Ensure user has a moderation record
      INSERT INTO public.user_moderation (user_id, strike_count, is_shadowbanned)
      VALUES (pin_owner_id, 0, false)
      ON CONFLICT (user_id) DO NOTHING;
      
      -- Increment strike count
      UPDATE public.user_moderation
      SET 
        strike_count = strike_count + 1,
        updated_at = now()
      WHERE user_id = pin_owner_id
      RETURNING strike_count INTO current_strikes;
      
      -- If user now has 5 or more strikes, shadowban them (STRIKE_THRESHOLD_FOR_SHADOWBAN = 5)
      IF current_strikes >= 5 THEN
        UPDATE public.user_moderation
        SET 
          is_shadowbanned = true,
          shadowban_reason = 'Automatic shadowban: 5 or more strikes',
          updated_at = now()
        WHERE user_id = pin_owner_id;
      END IF;
      
      -- Delete all reports for this pin FIRST to avoid foreign key issues
      -- This must happen before deleting the pin to prevent cascade conflicts
      DELETE FROM public.pin_reports WHERE pin_id = NEW.pin_id;
      
      -- Now delete the pin (this will cascade to other related tables like events, hazards, etc.)
      DELETE FROM public.reports WHERE reportid = NEW.pin_id;
      
      -- Return NULL since we deleted the NEW record that triggered this
      -- Note: For AFTER triggers, return values are ignored by PostgreSQL anyway
      RETURN NULL;
    END IF;
  END IF;
  
  -- If we didn't delete anything, return NEW (but this is also ignored for AFTER triggers)
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to execute the function after each report is inserted
CREATE TRIGGER trigger_check_pin_report_threshold
AFTER INSERT ON public.pin_reports
FOR EACH ROW
EXECUTE FUNCTION public.handle_pin_report_threshold();

-- Function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-update updated_at on user_moderation
CREATE TRIGGER trigger_user_moderation_updated_at
BEFORE UPDATE ON public.user_moderation
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- RPC function to atomically increment user strikes
-- This prevents race conditions when multiple reports trigger strikes simultaneously
CREATE OR REPLACE FUNCTION public.increment_user_strikes(target_user_id uuid)
RETURNS TABLE (
  id bigint,
  user_id uuid,
  strike_count integer,
  is_shadowbanned boolean,
  shadowban_reason text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
) AS $$
BEGIN
  -- Atomically increment strike_count and return the updated row
  RETURN QUERY
  UPDATE public.user_moderation
  SET strike_count = strike_count + 1,
      updated_at = now()
  WHERE user_moderation.user_id = target_user_id
  RETURNING 
    user_moderation.id,
    user_moderation.user_id,
    user_moderation.strike_count,
    user_moderation.is_shadowbanned,
    user_moderation.shadowban_reason,
    user_moderation.created_at,
    user_moderation.updated_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant permissions (adjust as needed for your RLS policies)
-- These are basic permissions; you may want to add RLS policies
ALTER TABLE public.user_moderation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pin_reports ENABLE ROW LEVEL SECURITY;

-- Allow users to view their own moderation status
CREATE POLICY "Users can view their own moderation status"
ON public.user_moderation
FOR SELECT
USING (auth.uid() = user_id);

-- Allow authenticated users to report pins
CREATE POLICY "Authenticated users can report pins"
ON public.pin_reports
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = reporter_user_id);

-- Allow users to view their own reports
CREATE POLICY "Users can view their own reports"
ON public.pin_reports
FOR SELECT
USING (auth.uid() = reporter_user_id);

-- Allow service role to manage all moderation data (for admin purposes)
CREATE POLICY "Service role can manage user_moderation"
ON public.user_moderation
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

CREATE POLICY "Service role can manage pin_reports"
ON public.pin_reports
FOR ALL
TO service_role
USING (true)
WITH CHECK (true);

