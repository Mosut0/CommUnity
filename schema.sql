-- WARNING: This schema is for context only and is not meant to be run.
-- Table order and constraints may not be valid for execution.

CREATE TABLE public.events (
  eventid integer NOT NULL DEFAULT nextval('events_eventid_seq'::regclass),
  reportid integer NOT NULL,
  eventtype character varying NOT NULL,
  time timestamp without time zone NOT NULL,
  CONSTRAINT events_pkey PRIMARY KEY (eventid),
  CONSTRAINT events_reportid_fkey FOREIGN KEY (reportid) REFERENCES public.reports(reportid)
);
CREATE TABLE public.founditems (
  foundid integer NOT NULL DEFAULT nextval('founditems_foundid_seq'::regclass),
  reportid integer NOT NULL,
  itemtype character varying NOT NULL,
  contactinfo character varying,
  CONSTRAINT founditems_pkey PRIMARY KEY (foundid),
  CONSTRAINT founditems_reportid_fkey FOREIGN KEY (reportid) REFERENCES public.reports(reportid)
);
CREATE TABLE public.hazards (
  hazardid integer NOT NULL DEFAULT nextval('hazards_hazardid_seq'::regclass),
  reportid integer NOT NULL,
  hazardtype character varying NOT NULL,
  CONSTRAINT hazards_pkey PRIMARY KEY (hazardid),
  CONSTRAINT hazards_reportid_fkey FOREIGN KEY (reportid) REFERENCES public.reports(reportid)
);
CREATE TABLE public.lostitems (
  lostid integer NOT NULL DEFAULT nextval('lostitems_lostid_seq'::regclass),
  reportid integer NOT NULL,
  itemtype character varying NOT NULL,
  contactinfo character varying,
  CONSTRAINT lostitems_pkey PRIMARY KEY (lostid),
  CONSTRAINT lostitems_reportid_fkey FOREIGN KEY (reportid) REFERENCES public.reports(reportid)
);
CREATE TABLE public.notification_preferences (
  id bigint NOT NULL DEFAULT nextval('notification_preferences_id_seq'::regclass),
  user_id uuid UNIQUE,
  expo_push_token text,
  notify_types jsonb DEFAULT '[]'::jsonb,
  notify_radius_m integer DEFAULT 1000,
  last_location_lat double precision,
  last_location_lon double precision,
  last_location_updated_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT notification_preferences_pkey PRIMARY KEY (id),
  CONSTRAINT notification_preferences_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.notifications_audit (
  id bigint NOT NULL DEFAULT nextval('notifications_audit_id_seq'::regclass),
  user_id uuid,
  report_id uuid,
  expo_push_token text,
  payload jsonb,
  sent_at timestamp with time zone DEFAULT now(),
  status text,
  error text,
  CONSTRAINT notifications_audit_pkey PRIMARY KEY (id),
  CONSTRAINT notifications_audit_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.pin_reports (
  report_id bigint NOT NULL DEFAULT nextval('pin_reports_report_id_seq'::regclass),
  pin_id integer NOT NULL,
  reporter_user_id uuid NOT NULL,
  reason text,
  created_at timestamp with time zone DEFAULT now(),
  CONSTRAINT pin_reports_pkey PRIMARY KEY (report_id),
  CONSTRAINT pin_reports_pin_id_fkey FOREIGN KEY (pin_id) REFERENCES public.reports(reportid),
  CONSTRAINT pin_reports_reporter_user_id_fkey FOREIGN KEY (reporter_user_id) REFERENCES auth.users(id)
);
CREATE TABLE public.reports (
  reportid integer NOT NULL DEFAULT nextval('reports_reportid_seq'::regclass),
  userid uuid NOT NULL,
  category character varying NOT NULL CHECK (category::text = ANY (ARRAY['hazard'::character varying::text, 'infrastructure'::character varying::text, 'wildlife'::character varying::text, 'health'::character varying::text, 'lost'::character varying::text, 'found'::character varying::text, 'other'::character varying::text, 'event'::character varying::text])),
  description text,
  location point NOT NULL,
  createdat timestamp without time zone DEFAULT CURRENT_TIMESTAMP,
  imageurl text,
  CONSTRAINT reports_pkey PRIMARY KEY (reportid),
  CONSTRAINT reports_userid_fkey FOREIGN KEY (userid) REFERENCES auth.users(id)
);
CREATE TABLE public.user_moderation (
  id bigint NOT NULL DEFAULT nextval('user_moderation_id_seq'::regclass),
  user_id uuid NOT NULL UNIQUE,
  strike_count integer NOT NULL DEFAULT 0,
  is_shadowbanned boolean NOT NULL DEFAULT false,
  shadowban_reason text,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now(),
  CONSTRAINT user_moderation_pkey PRIMARY KEY (id),
  CONSTRAINT user_moderation_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id)
);