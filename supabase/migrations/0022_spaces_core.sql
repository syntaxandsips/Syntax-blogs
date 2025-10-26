-- =====================================================================
-- MOD-001: Spaces phase 2 foundation
-- Adds feature flag payloads, refined membership statuses, richer rules,
-- and template scaffolding to support vertical slice delivery.
-- =====================================================================

-- Ensure enum for rule kinds exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'space_rule_kind'
  ) THEN
    CREATE TYPE public.space_rule_kind AS ENUM ('rule', 'flair', 'template', 'automod');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'content_template_type'
  ) THEN
    CREATE TYPE public.content_template_type AS ENUM (
      'article',
      'discussion',
      'qa',
      'event',
      'workshop'
    );
  END IF;
END;
$$;

-- Add feature flag payloads for spaces
ALTER TABLE public.spaces
  ADD COLUMN IF NOT EXISTS feature_flags jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS banner_image_url text;

-- Normalize membership status naming (invited->pending, suspended->banned)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_type WHERE typname = 'space_membership_status'
  ) THEN
    IF EXISTS (
      SELECT 1
      FROM pg_enum
      WHERE enumtypid = 'public.space_membership_status'::regtype
        AND enumlabel = 'invited'
    ) THEN
      ALTER TYPE public.space_membership_status RENAME VALUE 'invited' TO 'pending';
    END IF;

    IF EXISTS (
      SELECT 1
      FROM pg_enum
      WHERE enumtypid = 'public.space_membership_status'::regtype
        AND enumlabel = 'suspended'
    ) THEN
      ALTER TYPE public.space_membership_status RENAME VALUE 'suspended' TO 'banned';
    END IF;

    IF NOT EXISTS (
      SELECT 1
      FROM pg_enum
      WHERE enumtypid = 'public.space_membership_status'::regtype
        AND enumlabel = 'pending'
    ) THEN
      ALTER TYPE public.space_membership_status ADD VALUE 'pending';
    END IF;

    IF NOT EXISTS (
      SELECT 1
      FROM pg_enum
      WHERE enumtypid = 'public.space_membership_status'::regtype
        AND enumlabel = 'active'
    ) THEN
      ALTER TYPE public.space_membership_status ADD VALUE 'active';
    END IF;

    IF NOT EXISTS (
      SELECT 1
      FROM pg_enum
      WHERE enumtypid = 'public.space_membership_status'::regtype
        AND enumlabel = 'banned'
    ) THEN
      ALTER TYPE public.space_membership_status ADD VALUE 'banned';
    END IF;
  END IF;
END;
$$;

-- Add canonical slug shadow column for quick lookups
ALTER TABLE public.space_members
  ADD COLUMN IF NOT EXISTS role_slug text NOT NULL DEFAULT 'member',
  ADD COLUMN IF NOT EXISTS requested_at timestamptz,
  ADD COLUMN IF NOT EXISTS decision_at timestamptz;

-- Backfill role slug from roles table
UPDATE public.space_members sm
SET role_slug = public.normalize_role_slug(r.slug)
FROM public.roles r
WHERE sm.role_id = r.id;

-- Trigger to keep role slug in sync
CREATE OR REPLACE FUNCTION public.space_members_set_role_slug()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF TG_OP = 'INSERT' OR NEW.role_id IS DISTINCT FROM OLD.role_id THEN
    SELECT public.normalize_role_slug(slug) INTO NEW.role_slug
    FROM public.roles
    WHERE id = NEW.role_id;
  END IF;
  RETURN NEW;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'space_members_role_slug_trg'
  ) THEN
    CREATE TRIGGER space_members_role_slug_trg
      BEFORE INSERT OR UPDATE ON public.space_members
      FOR EACH ROW
      EXECUTE FUNCTION public.space_members_set_role_slug();
  END IF;
END;
$$;

-- Enrich rules to support flairs/templates metadata
ALTER TABLE public.space_rules
  ADD COLUMN IF NOT EXISTS kind public.space_rule_kind NOT NULL DEFAULT 'rule',
  ADD COLUMN IF NOT EXISTS value jsonb NOT NULL DEFAULT '{}'::jsonb,
  ADD COLUMN IF NOT EXISTS position integer NOT NULL DEFAULT 0;

CREATE INDEX IF NOT EXISTS space_rules_space_kind_idx
  ON public.space_rules(space_id, kind, position);

-- Pending membership partial index to accelerate approvals
CREATE INDEX IF NOT EXISTS space_members_pending_idx
  ON public.space_members(space_id, profile_id)
  WHERE status = 'pending';

-- Create post_templates table for reusable scaffolds
CREATE TABLE IF NOT EXISTS public.post_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id uuid NOT NULL REFERENCES public.spaces(id) ON DELETE CASCADE,
  content_type public.content_template_type NOT NULL,
  title text NOT NULL,
  body text,
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS post_templates_space_type_idx
  ON public.post_templates(space_id, content_type);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'post_templates_set_updated_at'
  ) THEN
    CREATE TRIGGER post_templates_set_updated_at
      BEFORE UPDATE ON public.post_templates
      FOR EACH ROW
      EXECUTE FUNCTION public.set_updated_at();
  END IF;
END;
$$;

-- Ensure post_versions metadata column exists for scheduling context
ALTER TABLE public.post_versions
  ADD COLUMN IF NOT EXISTS scheduled_for timestamptz;

-- Permit self-service join requests transitioning to pending state
DO $$
BEGIN
  PERFORM 1 FROM pg_policies
  WHERE schemaname = 'public'
    AND tablename = 'space_members'
    AND policyname = 'Members request access';

  IF FOUND THEN
    DROP POLICY "Members request access" ON public.space_members;
  END IF;

  CREATE POLICY "Members request access"
    ON public.space_members
    FOR INSERT
    WITH CHECK (
      profile_id = (
        SELECT id FROM public.profiles WHERE user_id = auth.uid()
      )
      AND status = 'pending'
    );
END;
$$;

