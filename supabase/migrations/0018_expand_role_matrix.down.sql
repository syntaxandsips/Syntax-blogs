-- =====================================================================
-- DOWN MIGRATION: REVERT EXPANDED ROLE MATRIX (SEC-001)
-- =====================================================================
-- Restores legacy admin/editor/author/member hierarchy and supporting
-- policies. Run only after ensuring no new features depend on the
-- organizer/moderator/contributor roles.

DO $$
DECLARE
  organizer_role uuid;
  contributor_role uuid;
  moderator_role uuid;
  admin_role uuid;
  member_role uuid;
  editor_role uuid;
  author_role uuid;
BEGIN
  SELECT id INTO organizer_role FROM public.roles WHERE slug = 'organizer';
  SELECT id INTO contributor_role FROM public.roles WHERE slug = 'contributor';
  SELECT id INTO moderator_role FROM public.roles WHERE slug = 'moderator';
  SELECT id INTO admin_role FROM public.roles WHERE slug = 'admin';
  SELECT id INTO member_role FROM public.roles WHERE slug = 'member';

  INSERT INTO public.roles (slug, name, description, priority)
  VALUES
    ('editor', 'Editor', 'Manage and publish any post content.', 20),
    ('author', 'Author', 'Create and edit personal drafts.', 30)
  ON CONFLICT (slug) DO UPDATE
  SET
    name = EXCLUDED.name,
    description = EXCLUDED.description,
    priority = EXCLUDED.priority;

  SELECT id INTO editor_role FROM public.roles WHERE slug = 'editor';
  SELECT id INTO author_role FROM public.roles WHERE slug = 'author';

  IF editor_role IS NOT NULL THEN
    IF organizer_role IS NOT NULL THEN
      UPDATE public.profile_roles
      SET role_id = editor_role
      WHERE role_id = organizer_role;

      UPDATE public.profiles
      SET primary_role_id = editor_role
      WHERE primary_role_id = organizer_role;
    END IF;

    IF moderator_role IS NOT NULL THEN
      UPDATE public.profile_roles
      SET role_id = editor_role
      WHERE role_id = moderator_role;

      UPDATE public.profiles
      SET primary_role_id = editor_role
      WHERE primary_role_id = moderator_role;
    END IF;
  END IF;

  IF author_role IS NOT NULL AND contributor_role IS NOT NULL THEN
    UPDATE public.profile_roles
    SET role_id = author_role
    WHERE role_id = contributor_role;

    UPDATE public.profiles
    SET primary_role_id = author_role
    WHERE primary_role_id = contributor_role;
  END IF;

  IF contributor_role IS NOT NULL THEN
    DELETE FROM public.roles WHERE id = contributor_role;
  END IF;

  IF organizer_role IS NOT NULL THEN
    DELETE FROM public.roles WHERE id = organizer_role;
  END IF;

  IF moderator_role IS NOT NULL THEN
    DELETE FROM public.roles WHERE id = moderator_role;
  END IF;

  -- Ensure all profiles retain at least the member role
  IF member_role IS NOT NULL THEN
    INSERT INTO public.profile_roles(profile_id, role_id)
    SELECT p.id, member_role
    FROM public.profiles p
    WHERE NOT EXISTS (
      SELECT 1 FROM public.profile_roles pr
      WHERE pr.profile_id = p.id
        AND pr.role_id = member_role
    );
  END IF;

  -- Re-sync admin flag after remapping roles
  IF admin_role IS NOT NULL THEN
    UPDATE public.profiles p
    SET is_admin = EXISTS (
      SELECT 1 FROM public.profile_roles pr
      WHERE pr.profile_id = p.id
        AND pr.role_id = admin_role
    );
  END IF;
END;
$$;

-- Drop helper functions introduced for expanded hierarchy
DROP FUNCTION IF EXISTS public.determine_primary_role(uuid);
DROP FUNCTION IF EXISTS public.user_has_role_or_higher(text);

-- Restore legacy helper implementations
CREATE OR REPLACE FUNCTION public.user_has_any_role(role_slugs text[])
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  has_role boolean;
BEGIN
  IF role_slugs IS NULL OR array_length(role_slugs, 1) = 0 THEN
    RETURN FALSE;
  END IF;

  SELECT EXISTS(
    SELECT 1
    FROM public.profiles p
    LEFT JOIN public.profile_roles pr ON pr.profile_id = p.id
    LEFT JOIN public.roles r ON r.id = pr.role_id
    WHERE p.user_id = auth.uid()
      AND (
        r.slug = ANY(role_slugs)
        OR (
          p.is_admin = TRUE
          AND array_position(role_slugs, 'admin') IS NOT NULL
        )
      )
  )
  INTO has_role;

  RETURN COALESCE(has_role, FALSE);
END;
$$;

CREATE OR REPLACE FUNCTION public.user_has_role(role_slug text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF role_slug IS NULL THEN
    RETURN FALSE;
  END IF;
  RETURN public.user_has_any_role(ARRAY[role_slug]);
END;
$$;

CREATE OR REPLACE FUNCTION public.assign_primary_role()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  admin_role uuid;
  member_role uuid;
BEGIN
  IF NEW.primary_role_id IS NULL THEN
    IF NEW.is_admin THEN
      SELECT id INTO admin_role FROM public.roles WHERE slug = 'admin';
      IF admin_role IS NOT NULL THEN
        NEW.primary_role_id := admin_role;
      END IF;
    END IF;

    IF NEW.primary_role_id IS NULL THEN
      SELECT id INTO member_role FROM public.roles WHERE slug = 'member';
      IF member_role IS NOT NULL THEN
        NEW.primary_role_id := member_role;
      END IF;
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

  IF TG_OP = 'INSERT' THEN
    IF admin_role IS NOT NULL AND NEW.is_admin THEN
      INSERT INTO public.profile_roles(profile_id, role_id)
      VALUES (NEW.id, admin_role)
      ON CONFLICT (profile_id, role_id) DO NOTHING;
    END IF;

    IF member_role IS NOT NULL THEN
      INSERT INTO public.profile_roles(profile_id, role_id)
      VALUES (NEW.id, member_role)
      ON CONFLICT (profile_id, role_id) DO NOTHING;
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
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

    IF member_role IS NOT NULL THEN
      INSERT INTO public.profile_roles(profile_id, role_id)
      VALUES (NEW.id, member_role)
      ON CONFLICT (profile_id, role_id) DO NOTHING;
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
  admin_role uuid;
  member_role uuid;
  effective_admin boolean;
BEGIN
  SELECT id INTO admin_role FROM public.roles WHERE slug = 'admin';
  SELECT id INTO member_role FROM public.roles WHERE slug = 'member';

  IF admin_role IS NULL THEN
    RETURN NULL;
  END IF;

  IF TG_OP = 'INSERT' THEN
    IF NEW.role_id = admin_role THEN
      UPDATE public.profiles
      SET is_admin = TRUE,
          primary_role_id = COALESCE(primary_role_id, admin_role)
      WHERE id = NEW.profile_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.role_id = admin_role THEN
      SELECT EXISTS (
        SELECT 1
        FROM public.profile_roles pr
        WHERE pr.profile_id = OLD.profile_id
          AND pr.role_id = admin_role
      ) INTO effective_admin;

      UPDATE public.profiles
      SET is_admin = COALESCE(effective_admin, FALSE),
          primary_role_id = CASE
            WHEN COALESCE(effective_admin, FALSE) THEN primary_role_id
            WHEN member_role IS NOT NULL THEN member_role
            ELSE primary_role_id
          END
      WHERE id = OLD.profile_id;
    END IF;
  END IF;

  RETURN NULL;
END;
$$;

-- Restore RLS policies to admin/editor precedence
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
    OR public.user_has_role('admin')
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
    OR public.user_has_any_role(ARRAY['admin', 'editor'])
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
    OR public.user_has_any_role(ARRAY['admin', 'editor'])
  );

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'categories'
      AND policyname = 'Organizers manage categories'
  ) THEN
    DROP POLICY "Organizers manage categories" ON public.categories;
  END IF;
END;
$$;

CREATE POLICY "Admins can manage categories"
  ON public.categories FOR ALL
  USING (public.user_has_role('admin'))
  WITH CHECK (public.user_has_role('admin'));

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'tags'
      AND policyname = 'Organizers manage tags'
  ) THEN
    DROP POLICY "Organizers manage tags" ON public.tags;
  END IF;
END;
$$;

CREATE POLICY "Admins can manage tags"
  ON public.tags FOR ALL
  USING (public.user_has_role('admin'))
  WITH CHECK (public.user_has_role('admin'));

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'post_tags'
      AND policyname = 'Organizers manage post tags'
  ) THEN
    DROP POLICY "Organizers manage post tags" ON public.post_tags;
  END IF;
END;
$$;

CREATE POLICY "Admins can manage post tags"
  ON public.post_tags FOR ALL
  USING (public.user_has_role('admin'))
  WITH CHECK (public.user_has_role('admin'));

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'community_contributors'
      AND policyname = 'staff manage contributors'
  ) THEN
    DROP POLICY "staff manage contributors" ON public.community_contributors;
  END IF;
END;
$$;

CREATE POLICY "admins manage contributors"
  ON public.community_contributors FOR ALL
  USING (public.user_has_any_role(ARRAY['admin', 'editor']))
  WITH CHECK (public.user_has_any_role(ARRAY['admin', 'editor']));

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'author_applications'
      AND policyname = 'staff review applications'
  ) THEN
    DROP POLICY "staff review applications" ON public.author_applications;
  END IF;
END;
$$;

CREATE POLICY "admins review applications"
  ON public.author_applications FOR UPDATE
  USING (public.user_has_any_role(ARRAY['admin', 'editor']))
  WITH CHECK (public.user_has_any_role(ARRAY['admin', 'editor']));

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'community_submission_events'
      AND policyname = 'staff view submission events'
  ) THEN
    DROP POLICY "staff view submission events" ON public.community_submission_events;
  END IF;
END;
$$;

CREATE POLICY "admins view submission events"
  ON public.community_submission_events FOR SELECT
  USING (public.user_has_any_role(ARRAY['admin', 'editor']));
