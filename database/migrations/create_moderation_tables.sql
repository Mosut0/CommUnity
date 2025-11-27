-- Migration: Create moderation tables for pin reporting system
-- IMPORTANT: Thresholds are hardcoded in trigger (>= 10 reports, >= 5 strikes)
-- If changed in config/moderation.ts, update lines 56 and 67 below

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

CREATE INDEX IF NOT EXISTS idx_user_moderation_user_id ON public.user_moderation(user_id);
CREATE INDEX IF NOT EXISTS idx_user_moderation_shadowbanned ON public.user_moderation(is_shadowbanned) WHERE is_shadowbanned = true;

CREATE TABLE IF NOT EXISTS public.pin_reports (
  report_id bigserial PRIMARY KEY,
  pin_id integer NOT NULL,
  reporter_user_id uuid NOT NULL,
  reason text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT pin_reports_pin_id_fkey FOREIGN KEY (pin_id) REFERENCES public.reports(reportid) ON DELETE CASCADE,
  CONSTRAINT pin_reports_reporter_user_id_fkey FOREIGN KEY (reporter_user_id) REFERENCES auth.users(id) ON DELETE CASCADE,
  CONSTRAINT pin_reports_unique_user_pin UNIQUE (pin_id, reporter_user_id)
);

CREATE INDEX IF NOT EXISTS idx_pin_reports_pin_id ON public.pin_reports(pin_id);
CREATE INDEX IF NOT EXISTS idx_pin_reports_reporter_user_id ON public.pin_reports(reporter_user_id);

-- Trigger function: Deletes pin and assigns strikes when report threshold is reached
-- Uses blocking row locks to prevent race conditions with concurrent reports
CREATE OR REPLACE FUNCTION public.handle_pin_report_threshold()
RETURNS TRIGGER AS $$
DECLARE
  report_count integer;
  pin_owner_id uuid;
  current_strikes integer;
BEGIN
  BEGIN
    SELECT userid INTO STRICT pin_owner_id
    FROM public.reports
    WHERE reportid = NEW.pin_id
    FOR UPDATE;
  EXCEPTION
    WHEN no_data_found THEN
      RETURN NEW;
  END;
  
  SELECT COUNT(DISTINCT reporter_user_id) INTO report_count
  FROM public.pin_reports
  WHERE pin_id = NEW.pin_id;
  
  IF report_count >= 10 THEN
    IF pin_owner_id IS NOT NULL THEN
      INSERT INTO public.user_moderation (user_id, strike_count, is_shadowbanned)
      VALUES (pin_owner_id, 0, false)
      ON CONFLICT (user_id) DO NOTHING;
      
      UPDATE public.user_moderation
      SET strike_count = strike_count + 1, updated_at = now()
      WHERE user_id = pin_owner_id
      RETURNING strike_count INTO current_strikes;
      
      IF current_strikes >= 5 THEN
        UPDATE public.user_moderation
        SET is_shadowbanned = true,
            shadowban_reason = 'Automatic shadowban: 5 or more strikes',
            updated_at = now()
        WHERE user_id = pin_owner_id;
      END IF;
      
      DELETE FROM public.reports WHERE reportid = NEW.pin_id;
    END IF;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_check_pin_report_threshold
AFTER INSERT ON public.pin_reports
FOR EACH ROW
EXECUTE FUNCTION public.handle_pin_report_threshold();

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_user_moderation_updated_at
BEFORE UPDATE ON public.user_moderation
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

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
  RETURN QUERY
  UPDATE public.user_moderation
  SET strike_count = strike_count + 1, updated_at = now()
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

ALTER TABLE public.user_moderation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pin_reports ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own moderation status"
ON public.user_moderation FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can report pins"
ON public.pin_reports FOR INSERT TO authenticated
WITH CHECK (auth.uid() = reporter_user_id);

CREATE POLICY "Users can view their own reports"
ON public.pin_reports FOR SELECT
USING (auth.uid() = reporter_user_id);

CREATE POLICY "Service role can manage user_moderation"
ON public.user_moderation FOR ALL TO service_role
USING (true) WITH CHECK (true);

CREATE POLICY "Service role can manage pin_reports"
ON public.pin_reports FOR ALL TO service_role
USING (true) WITH CHECK (true);

