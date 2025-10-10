-- Expand canonical role matrix and harden RLS for multi-tier governance

-- =====================================================================
-- Upsert canonical roles with updated hierarchy
-- =====================================================================
INSERT INTO public.roles (slug, name, description, priority)
VALUES
  ('admin', 'Administrator', 'Full platform control including governance, security, and billing.', 10),
  ('moderator', 'Moderator', 'Enforce community guidelines, manage reports, and apply sanctions.', 20),
  ('organizer', 'Organizer', 'Operate spaces, configure templates, and coordinate events.', 30),
  ('contributor', 'Contributor', 'Publish and collaborate on content across approved spaces.', 40),
  ('member', 'Member', 'Participate in public discussions with baseline privileges.', 50)
ON CONFLICT (slug) DO UPDATE
SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  priority = EXCLUDED.priority;

-- Map legacy role slugs (editor/author) onto the new hierarchy
DO $$
DECLARE
  legacy_editor uuid;
  legacy_author uuid;
  organizer_role uuid;
  contributor_role uuid;
BEGIN
  SELECT id INTO organizer_role FROM public.roles WHERE slug = 'organizer';
  SELECT id INTO contributor_role FROM public.roles WHERE slug = 'contributor';
  SELECT id INTO legacy_editor FROM public.roles WHERE slug = 'editor';
  SELECT id INTO legacy_author FROM public.roles WHERE slug = 'author';

  IF legacy_editor IS NOT NULL AND organizer_role IS NOT NULL THEN
    UPDATE public.profile_roles
    SET role_id = organizer_role
    WHERE role_id = legacy_editor;

    UPDATE public.profiles
    SET primary_role_id = organizer_role
    WHERE primary_role_id = legacy_editor;

    DELETE FROM public.roles WHERE id = legacy_editor;
  END IF;

  IF legacy_author IS NOT NULL AND contributor_role IS NOT NULL THEN
    UPDATE public.profile_roles
    SET role_id = contributor_role
    WHERE role_id = legacy_author;

    UPDATE public.profiles
    SET primary_role_id = contributor_role
    WHERE primary_role_id = legacy_author;

    DELETE FROM public.roles WHERE id = legacy_author;
  END IF;
END;
$$;

-- =====================================================================
-- Helper to resolve highest priority role for a profile
-- =====================================================================
CREATE OR REPLACE FUNCTION public.determine_primary_role(profile_uuid uuid)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  resolved uuid;
BEGIN
  IF profile_uuid IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT r.id
  INTO resolved
  FROM public.profile_roles pr
  JOIN public.roles r ON r.id = pr.role_id
  WHERE pr.profile_id = profile_uuid
  ORDER BY r.priority ASC
  LIMIT 1;

  IF resolved IS NOT NULL THEN
    RETURN resolved;
  END IF;

  SELECT id INTO resolved FROM public.roles WHERE slug = 'member' LIMIT 1;
  RETURN resolved;
END;
$$;

-- =====================================================================
-- Refresh profile role maintenance triggers
-- =====================================================================
CREATE OR REPLACE FUNCTION public.assign_primary_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  member_role uuid;
BEGIN
  IF NEW.primary_role_id IS NULL THEN
    SELECT id INTO member_role FROM public.roles WHERE slug = 'member';
    IF member_role IS NOT NULL THEN
      NEW.primary_role_id := member_role;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.ensure_profile_role_membership()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_role uuid;
  member_role uuid;
BEGIN
  SELECT id INTO admin_role FROM public.roles WHERE slug = 'admin';
  SELECT id INTO member_role FROM public.roles WHERE slug = 'member';

  IF member_role IS NOT NULL THEN
    INSERT INTO public.profile_roles(profile_id, role_id)
    VALUES (NEW.id, member_role)
    ON CONFLICT (profile_id, role_id) DO NOTHING;
  END IF;

  IF admin_role IS NOT NULL THEN
    IF NEW.is_admin THEN
      INSERT INTO public.profile_roles(profile_id, role_id)
      VALUES (NEW.id, admin_role)
      ON CONFLICT (profile_id, role_id) DO NOTHING;
    ELSE
      DELETE FROM public.profile_roles
      WHERE profile_id = NEW.id
        AND role_id = admin_role;
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.sync_admin_flag_from_roles()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_profile uuid;
  admin_role uuid;
  member_role uuid;
  has_admin boolean;
  highest_role uuid;
BEGIN
  IF TG_OP = 'INSERT' THEN
    target_profile := NEW.profile_id;
  ELSE
    target_profile := OLD.profile_id;
  END IF;

  IF target_profile IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT id INTO admin_role FROM public.roles WHERE slug = 'admin';
  SELECT id INTO member_role FROM public.roles WHERE slug = 'member';

  SELECT EXISTS (
    SELECT 1 FROM public.profile_roles pr
    WHERE pr.profile_id = target_profile
      AND pr.role_id = admin_role
  ) INTO has_admin;

  highest_role := public.determine_primary_role(target_profile);

  UPDATE public.profiles
  SET
    is_admin = COALESCE(has_admin, FALSE),
    primary_role_id = COALESCE(highest_role, member_role, primary_role_id)
  WHERE id = target_profile;

  RETURN NULL;
END;
$$;

-- =====================================================================
-- Ensure baseline member role assignment and primary role accuracy
-- =====================================================================
DO $$
DECLARE
  member_role uuid;
BEGIN
  SELECT id INTO member_role FROM public.roles WHERE slug = 'member';

  IF member_role IS NOT NULL THEN
    INSERT INTO public.profile_roles(profile_id, role_id)
    SELECT p.id, member_role
    FROM public.profiles p
    WHERE NOT EXISTS (
      SELECT 1
      FROM public.profile_roles pr
      WHERE pr.profile_id = p.id
        AND pr.role_id = member_role
    );
  END IF;

  UPDATE public.profiles
  SET
    primary_role_id = public.determine_primary_role(id),
    is_admin = EXISTS (
      SELECT 1
      FROM public.profile_roles pr
      JOIN public.roles r ON r.id = pr.role_id
      WHERE pr.profile_id = public.profiles.id
        AND r.slug = 'admin'
    );
END;
$$;

-- =====================================================================
-- Role helper functions for privilege ladder checks
-- =====================================================================
CREATE OR REPLACE FUNCTION public.user_has_role_or_higher(role_slug text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  target_priority integer;
BEGIN
  IF role_slug IS NULL THEN
    RETURN FALSE;
  END IF;

  SELECT priority INTO target_priority
  FROM public.roles
  WHERE slug = role_slug;

  IF target_priority IS NULL THEN
    RETURN FALSE;
  END IF;

  RETURN EXISTS (
    SELECT 1
    FROM public.profiles p
    JOIN public.profile_roles pr ON pr.profile_id = p.id
    JOIN public.roles r ON r.id = pr.role_id
    WHERE p.user_id = auth.uid()
      AND r.priority <= target_priority
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.user_has_any_role(role_slugs text[])
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  normalized text[];
  target_slug text;
BEGIN
  IF role_slugs IS NULL OR array_length(role_slugs, 1) = 0 THEN
    RETURN FALSE;
  END IF;

  SELECT ARRAY_AGG(DISTINCT lower(trim(entry)))
  INTO normalized
  FROM unnest(role_slugs) AS entry
  WHERE trim(entry) <> '';

  IF normalized IS NULL OR array_length(normalized, 1) = 0 THEN
    RETURN FALSE;
  END IF;

  FOREACH target_slug IN ARRAY normalized LOOP
    IF public.user_has_role_or_higher(target_slug) THEN
      RETURN TRUE;
    END IF;
  END LOOP;

  RETURN FALSE;
END;
$$;

CREATE OR REPLACE FUNCTION public.user_has_role(role_slug text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN public.user_has_role_or_higher(role_slug);
END;
$$;

-- =====================================================================
-- Refresh RLS policies to honor the new hierarchy
-- =====================================================================
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'profiles'
      AND policyname = 'Users can update own profile. Admins can update any profile.'
  ) THEN
    DROP POLICY "Users can update own profile. Admins can update any profile." ON public.profiles;
  END IF;
END;
$$;

CREATE POLICY "Users can update own profile. Admins can update any profile."
  ON public.profiles FOR UPDATE
  USING (
    auth.uid() = user_id
    OR public.user_has_role_or_higher('admin')
  );

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'posts'
      AND policyname = 'Authors can update their own posts. Admins can update any post.'
  ) THEN
    DROP POLICY "Authors can update their own posts. Admins can update any post." ON public.posts;
  END IF;
END;
$$;

CREATE POLICY "Authors can update their own posts. Admins can update any post."
  ON public.posts FOR UPDATE
  USING (
    auth.uid() = (
      SELECT user_id FROM public.profiles WHERE id = author_id
    )
    OR public.user_has_any_role(ARRAY['admin', 'moderator', 'organizer'])
  );

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'posts'
      AND policyname = 'Authors can delete their own posts. Admins can delete any post.'
  ) THEN
    DROP POLICY "Authors can delete their own posts. Admins can delete any post." ON public.posts;
  END IF;
END;
$$;

CREATE POLICY "Authors can delete their own posts. Admins can delete any post."
  ON public.posts FOR DELETE
  USING (
    auth.uid() = (
      SELECT user_id FROM public.profiles WHERE id = author_id
    )
    OR public.user_has_any_role(ARRAY['admin', 'moderator', 'organizer'])
  );

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'categories'
      AND policyname = 'Admins can manage categories'
  ) THEN
    DROP POLICY "Admins can manage categories" ON public.categories;
  END IF;
END;
$$;

CREATE POLICY "Organizers manage categories"
  ON public.categories FOR ALL
  USING (public.user_has_any_role(ARRAY['admin', 'moderator', 'organizer']))
  WITH CHECK (public.user_has_any_role(ARRAY['admin', 'moderator', 'organizer']));

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'tags'
      AND policyname = 'Admins can manage tags'
  ) THEN
    DROP POLICY "Admins can manage tags" ON public.tags;
  END IF;
END;
$$;

CREATE POLICY "Organizers manage tags"
  ON public.tags FOR ALL
  USING (public.user_has_any_role(ARRAY['admin', 'moderator', 'organizer']))
  WITH CHECK (public.user_has_any_role(ARRAY['admin', 'moderator', 'organizer']));

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'post_tags'
      AND policyname = 'Admins can manage post tags'
  ) THEN
    DROP POLICY "Admins can manage post tags" ON public.post_tags;
  END IF;
END;
$$;

CREATE POLICY "Organizers manage post tags"
  ON public.post_tags FOR ALL
  USING (public.user_has_any_role(ARRAY['admin', 'moderator', 'organizer']))
  WITH CHECK (public.user_has_any_role(ARRAY['admin', 'moderator', 'organizer']));

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'community_contributors'
      AND policyname = 'admins manage contributors'
  ) THEN
    DROP POLICY "admins manage contributors" ON public.community_contributors;
  END IF;
END;
$$;

CREATE POLICY "staff manage contributors"
  ON public.community_contributors FOR ALL
  USING (public.user_has_any_role(ARRAY['admin', 'moderator', 'organizer']))
  WITH CHECK (public.user_has_any_role(ARRAY['admin', 'moderator', 'organizer']));

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'author_applications'
      AND policyname = 'admins review applications'
  ) THEN
    DROP POLICY "admins review applications" ON public.author_applications;
  END IF;
END;
$$;

CREATE POLICY "staff review applications"
  ON public.author_applications FOR UPDATE
  USING (public.user_has_any_role(ARRAY['admin', 'moderator', 'organizer']))
  WITH CHECK (public.user_has_any_role(ARRAY['admin', 'moderator', 'organizer']));

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'community_submission_events'
      AND policyname = 'admins view submission events'
  ) THEN
    DROP POLICY "admins view submission events" ON public.community_submission_events;
  END IF;
END;
$$;

CREATE POLICY "staff view submission events"
  ON public.community_submission_events FOR SELECT
  USING (public.user_has_any_role(ARRAY['admin', 'moderator', 'organizer']));

-- =====================================================================
-- Extend feature flag enum with RBAC flag (idempotent)
-- =====================================================================
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_enum e
    JOIN pg_type t ON t.oid = e.enumtypid
    WHERE t.typname = 'feature_flag_key'
      AND e.enumlabel = 'rbac_hardening_v1'
  ) THEN
    ALTER TYPE public.feature_flag_key ADD VALUE 'rbac_hardening_v1';
  END IF;
END;
$$;
