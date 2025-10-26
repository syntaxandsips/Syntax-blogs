-- =====================================================================
-- Revert MOD-001 spaces foundation adjustments
-- =====================================================================

DROP TRIGGER IF EXISTS space_members_role_slug_trg ON public.space_members;
DROP FUNCTION IF EXISTS public.space_members_set_role_slug();

ALTER TABLE public.space_members
  DROP COLUMN IF EXISTS role_slug,
  DROP COLUMN IF EXISTS requested_at,
  DROP COLUMN IF EXISTS decision_at;

ALTER TABLE public.spaces
  DROP COLUMN IF EXISTS feature_flags,
  DROP COLUMN IF EXISTS banner_image_url;

ALTER TABLE public.space_rules
  DROP COLUMN IF EXISTS kind,
  DROP COLUMN IF EXISTS value,
  DROP COLUMN IF EXISTS position;

DROP INDEX IF EXISTS public.space_rules_space_kind_idx;
DROP INDEX IF EXISTS public.space_members_pending_idx;

DROP TABLE IF EXISTS public.post_templates;

ALTER TABLE public.post_versions
  DROP COLUMN IF EXISTS scheduled_for;

DROP POLICY IF EXISTS "Members request access" ON public.space_members;

-- Rename membership statuses back to legacy naming if required
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'space_membership_status'
  ) THEN
    IF EXISTS (
      SELECT 1
      FROM pg_enum
      WHERE enumtypid = 'public.space_membership_status'::regtype
        AND enumlabel = 'pending'
    ) THEN
      ALTER TYPE public.space_membership_status RENAME VALUE 'pending' TO 'invited';
    END IF;

    IF EXISTS (
      SELECT 1
      FROM pg_enum
      WHERE enumtypid = 'public.space_membership_status'::regtype
        AND enumlabel = 'banned'
    ) THEN
      ALTER TYPE public.space_membership_status RENAME VALUE 'banned' TO 'suspended';
    END IF;
  END IF;
END;
$$;

DROP TYPE IF EXISTS public.space_rule_kind;
DROP TYPE IF EXISTS public.content_template_type;

