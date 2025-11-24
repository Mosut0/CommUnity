-- Migration: Create moderation tables for pin reporting system
-- This migration adds tables to track user strikes, shadowbans, and pin reports

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
CREATE OR REPLACE FUNCTION public.handle_pin_report_threshold()
RETURNS TRIGGER AS $$
DECLARE
  report_count integer;
  pin_owner_id uuid;
  current_strikes integer;
BEGIN
  -- Count total reports for this pin
  SELECT COUNT(DISTINCT reporter_user_id) INTO report_count
  FROM public.pin_reports
  WHERE pin_id = NEW.pin_id;
  
  -- If we've reached the threshold of 10 reports
  IF report_count >= 10 THEN
    -- Get the pin owner's user ID
    SELECT userid INTO pin_owner_id
    FROM public.reports
    WHERE reportid = NEW.pin_id;
    
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
      
      -- If user now has 5 or more strikes, shadowban them
      IF current_strikes >= 5 THEN
        UPDATE public.user_moderation
        SET 
          is_shadowbanned = true,
          shadowban_reason = 'Automatic shadowban: 5 or more strikes',
          updated_at = now()
        WHERE user_id = pin_owner_id;
      END IF;
      
      -- Delete the pin (cascade will delete related records)
      DELETE FROM public.reports WHERE reportid = NEW.pin_id;
    END IF;
  END IF;
  
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

