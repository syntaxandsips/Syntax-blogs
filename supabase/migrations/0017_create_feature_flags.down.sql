-- =================================================================
-- DOWN MIGRATION: FEATURE FLAG GOVERNANCE
-- =================================================================
-- Drops feature flag tables, policies, and enum to revert GOV-000.
-- Safe to run after ensuring no other tables depend on feature_flag_key.

DROP TABLE IF EXISTS public.feature_flag_audit CASCADE;
DROP TABLE IF EXISTS public.feature_flags CASCADE;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_type t
    WHERE t.typname = 'feature_flag_key'
      AND t.typnamespace = 'public'::regnamespace
  ) THEN
    DROP TYPE public.feature_flag_key;
  END IF;
END;
$$;
