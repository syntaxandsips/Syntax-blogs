-- =================================================================
-- FEATURE FLAG GOVERNANCE
-- =================================================================
-- Creates feature flag storage and audit tables with admin/service RLS.
-- Enables governance workflows required by GOV-000.
-- =================================================================

-- Create enum for strongly typed flag keys
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type t
    WHERE t.typname = 'feature_flag_key'
      AND t.typnamespace = 'public'::regnamespace
  ) THEN
    CREATE TYPE public.feature_flag_key AS ENUM (
      'spaces_v1',
      'content_templates_v1',
      'search_unified_v1',
      'reputation_v1',
      'moderation_automation_v1',
      'donations_v1',
      'payouts_v1',
      'events_v1',
      'messaging_v1',
      'rbac_hardening_v1',
      'notifications_v1'
    );
  END IF;
END;
$$;

-- Ensure enum contains rbac_hardening_v1 for existing environments
ALTER TYPE public.feature_flag_key ADD VALUE IF NOT EXISTS 'rbac_hardening_v1';

-- Create feature_flags table
CREATE TABLE IF NOT EXISTS public.feature_flags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  flag_key public.feature_flag_key NOT NULL UNIQUE,
  description text NOT NULL DEFAULT '',
  enabled boolean NOT NULL DEFAULT false,
  owner text NOT NULL DEFAULT 'Unassigned',
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  updated_by uuid NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS feature_flags_key_idx ON public.feature_flags(flag_key);
CREATE INDEX IF NOT EXISTS feature_flags_enabled_idx ON public.feature_flags(enabled);

-- updated_at trigger
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'feature_flags_set_updated_at'
      AND tgrelid = 'public.feature_flags'::regclass
  ) THEN
    CREATE TRIGGER feature_flags_set_updated_at
      BEFORE UPDATE ON public.feature_flags
      FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
END;
$$;

-- Enable RLS
ALTER TABLE public.feature_flags ENABLE ROW LEVEL SECURITY;

-- Admin policy
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'feature_flags'
      AND policyname = 'Admins manage feature flags'
  ) THEN
    CREATE POLICY "Admins manage feature flags"
      ON public.feature_flags
      FOR ALL
      USING (
        EXISTS (
          SELECT 1 FROM public.profiles
          WHERE user_id = auth.uid()
            AND is_admin = TRUE
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.profiles
          WHERE user_id = auth.uid()
            AND is_admin = TRUE
        )
      );
  END IF;
END;
$$;

-- Service role policy
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'feature_flags'
      AND policyname = 'Service role manages feature flags'
  ) THEN
    CREATE POLICY "Service role manages feature flags"
      ON public.feature_flags
      FOR ALL
      USING (auth.role() = 'service_role')
      WITH CHECK (auth.role() = 'service_role');
  END IF;
END;
$$;

COMMENT ON TABLE public.feature_flags IS 'Stores governance metadata and state for platform feature flags.';

-- Create audit table
CREATE TABLE IF NOT EXISTS public.feature_flag_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  flag_id uuid NOT NULL REFERENCES public.feature_flags(id) ON DELETE CASCADE,
  flag_key public.feature_flag_key NOT NULL,
  previous_enabled boolean,
  new_enabled boolean,
  changed_by uuid NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  changed_by_role text NOT NULL DEFAULT 'unknown',
  reason text,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS feature_flag_audit_key_idx ON public.feature_flag_audit(flag_key, created_at DESC);
CREATE INDEX IF NOT EXISTS feature_flag_audit_actor_idx ON public.feature_flag_audit(changed_by, created_at DESC);

ALTER TABLE public.feature_flag_audit ENABLE ROW LEVEL SECURITY;

-- Admin read-only policy
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'feature_flag_audit'
      AND policyname = 'Admins read feature flag audit'
  ) THEN
    CREATE POLICY "Admins read feature flag audit"
      ON public.feature_flag_audit
      FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM public.profiles
          WHERE user_id = auth.uid()
            AND is_admin = TRUE
        )
      );
  END IF;
END;
$$;

-- Service role full access for logging
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'feature_flag_audit'
      AND policyname = 'Service role writes feature flag audit'
  ) THEN
    CREATE POLICY "Service role writes feature flag audit"
      ON public.feature_flag_audit
      FOR ALL
      USING (auth.role() = 'service_role')
      WITH CHECK (auth.role() = 'service_role');
  END IF;
END;
$$;

COMMENT ON TABLE public.feature_flag_audit IS 'Immutable audit log capturing feature flag mutations.';
