-- =====================================================================
-- SEC-001: RBAC hardening for Phase-1 scope
-- Adds community spaces schema, helper functions, and deny-by-default RLS
-- =====================================================================

-- ---------------------------------------------------------------------
-- Enums required for space governance (idempotent)
-- ---------------------------------------------------------------------
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t WHERE t.typname = 'space_visibility'
  ) THEN
    CREATE TYPE public.space_visibility AS ENUM ('public', 'private', 'unlisted');
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_type t WHERE t.typname = 'space_membership_status'
  ) THEN
    CREATE TYPE public.space_membership_status AS ENUM ('active', 'invited', 'suspended');
  END IF;
END;
$$;

-- ---------------------------------------------------------------------
-- Spaces table and companions (idempotent create with constraints)
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.spaces (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  visibility public.space_visibility NOT NULL DEFAULT 'public',
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  is_archived boolean NOT NULL DEFAULT false
);

CREATE TABLE IF NOT EXISTS public.space_members (
  space_id uuid NOT NULL REFERENCES public.spaces(id) ON DELETE CASCADE,
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  role_id uuid NOT NULL REFERENCES public.roles(id) ON DELETE RESTRICT,
  status public.space_membership_status NOT NULL DEFAULT 'active',
  joined_at timestamptz NOT NULL DEFAULT now(),
  last_seen_at timestamptz,
  PRIMARY KEY (space_id, profile_id)
);

CREATE TABLE IF NOT EXISTS public.space_rules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  space_id uuid NOT NULL REFERENCES public.spaces(id) ON DELETE CASCADE,
  title text NOT NULL,
  body text NOT NULL,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS space_members_role_status_idx ON public.space_members(role_id, status);
CREATE INDEX IF NOT EXISTS space_members_profile_idx ON public.space_members(profile_id);
CREATE INDEX IF NOT EXISTS space_members_space_role_idx ON public.space_members(space_id, role_id);
CREATE INDEX IF NOT EXISTS spaces_visibility_idx ON public.spaces(visibility);

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'spaces_set_updated_at' AND tgrelid = 'public.spaces'::regclass
  ) THEN
    CREATE TRIGGER spaces_set_updated_at
      BEFORE UPDATE ON public.spaces
      FOR EACH ROW
      EXECUTE FUNCTION public.set_updated_at();
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'space_rules_set_updated_at' AND tgrelid = 'public.space_rules'::regclass
  ) THEN
    CREATE TRIGGER space_rules_set_updated_at
      BEFORE UPDATE ON public.space_rules
      FOR EACH ROW
      EXECUTE FUNCTION public.set_updated_at();
  END IF;
END;
$$;

ALTER TABLE public.spaces ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.space_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.space_rules ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------
-- Content history table (post_versions) and indexes
-- ---------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.post_versions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  version_number integer NOT NULL,
  content jsonb NOT NULL DEFAULT '{}'::jsonb,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS post_versions_post_number_idx
  ON public.post_versions(post_id, version_number DESC);

ALTER TABLE public.post_versions ENABLE ROW LEVEL SECURITY;

-- Ensure posts have optional linkage to spaces for future enforcement
ALTER TABLE public.posts
  ADD COLUMN IF NOT EXISTS space_id uuid REFERENCES public.spaces(id) ON DELETE SET NULL;

CREATE INDEX IF NOT EXISTS posts_space_status_idx ON public.posts(space_id, status);
CREATE INDEX IF NOT EXISTS posts_space_published_idx ON public.posts(space_id, published_at DESC NULLS LAST);

-- Comments already exist; ensure indexing for moderation threads
ALTER TABLE public.comments
  ADD COLUMN IF NOT EXISTS thread_root_id uuid;

CREATE INDEX IF NOT EXISTS comments_thread_root_idx ON public.comments(thread_root_id, created_at DESC);

-- Reports table to log moderation tickets
CREATE TABLE IF NOT EXISTS public.reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  reporter_profile_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  subject_type text NOT NULL,
  subject_id text NOT NULL,
  reason text NOT NULL,
  notes text,
  status text NOT NULL DEFAULT 'open',
  space_id uuid REFERENCES public.spaces(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  resolved_at timestamptz
);

CREATE INDEX IF NOT EXISTS reports_space_status_idx ON public.reports(space_id, status);
CREATE INDEX IF NOT EXISTS reports_subject_idx ON public.reports(subject_type, subject_id);

ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------
-- Helper functions for canonical role lookups and membership checks
-- ---------------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.normalize_role_slug(role_slug text)
RETURNS text
LANGUAGE plpgsql
STABLE
AS $$
BEGIN
  IF role_slug IS NULL THEN
    RETURN NULL;
  END IF;

  CASE lower(role_slug)
    WHEN 'editor' THEN RETURN 'organizer';
    WHEN 'author' THEN RETURN 'contributor';
    ELSE RETURN lower(role_slug);
  END CASE;
END;
$$;

CREATE OR REPLACE FUNCTION public.highest_role_slug(profile_uuid uuid)
RETURNS text
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  resolved uuid;
  slug text;
BEGIN
  IF profile_uuid IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT public.determine_primary_role(profile_uuid) INTO resolved;

  IF resolved IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT slug INTO slug FROM public.roles WHERE id = resolved;
  RETURN slug;
END;
$$;

CREATE OR REPLACE FUNCTION public.role_priority_for_slug(role_slug text)
RETURNS integer
LANGUAGE sql
STABLE
AS $$
  SELECT priority
  FROM public.roles
  WHERE slug = public.normalize_role_slug(role_slug)
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.profile_role_at_least(profile_uuid uuid, required_slug text)
RETURNS boolean
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  required_priority integer;
BEGIN
  IF profile_uuid IS NULL OR required_slug IS NULL THEN
    RETURN FALSE;
  END IF;

  SELECT priority INTO required_priority
  FROM public.roles
  WHERE slug = public.normalize_role_slug(required_slug);

  IF required_priority IS NULL THEN
    RETURN FALSE;
  END IF;

  RETURN EXISTS (
    SELECT 1
    FROM public.profile_roles pr
    JOIN public.roles r ON r.id = pr.role_id
    WHERE pr.profile_id = profile_uuid
      AND r.priority <= required_priority
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.current_profile_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT id
  FROM public.profiles
  WHERE user_id = auth.uid()
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.user_role_at_least(required_slug text)
RETURNS boolean
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  profile_uuid uuid;
BEGIN
  profile_uuid := public.current_profile_id();
  IF profile_uuid IS NULL THEN
    RETURN FALSE;
  END IF;

  RETURN public.profile_role_at_least(profile_uuid, required_slug);
END;
$$;

CREATE OR REPLACE FUNCTION public.user_is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT COALESCE((
    SELECT is_admin FROM public.profiles WHERE user_id = auth.uid()
  ), FALSE);
$$;

CREATE OR REPLACE FUNCTION public.user_space_role_at_least(space_uuid uuid, required_slug text)
RETURNS boolean
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  profile_uuid uuid;
  required_priority integer;
BEGIN
  IF space_uuid IS NULL OR required_slug IS NULL THEN
    RETURN FALSE;
  END IF;

  profile_uuid := public.current_profile_id();
  IF profile_uuid IS NULL THEN
    RETURN FALSE;
  END IF;

  SELECT priority INTO required_priority
  FROM public.roles
  WHERE slug = public.normalize_role_slug(required_slug);

  IF required_priority IS NULL THEN
    RETURN FALSE;
  END IF;

  RETURN EXISTS (
    SELECT 1
    FROM public.space_members sm
    JOIN public.roles r ON r.id = sm.role_id
    WHERE sm.space_id = space_uuid
      AND sm.profile_id = profile_uuid
      AND sm.status = 'active'
      AND r.priority <= required_priority
  );
END;
$$;

-- ---------------------------------------------------------------------
-- RLS policies (deny-by-default via RLS enablement)
-- ---------------------------------------------------------------------

-- Spaces visibility and management
DO $$
BEGIN
  PERFORM 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'spaces' AND policyname = 'Spaces readable per visibility';
  IF FOUND THEN
    DROP POLICY "Spaces readable per visibility" ON public.spaces;
  END IF;

  CREATE POLICY "Spaces readable per visibility"
    ON public.spaces
    FOR SELECT
    USING (
      visibility = 'public'
      OR public.user_space_role_at_least(id, 'member')
      OR public.user_role_at_least('moderator')
    );

  PERFORM 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'spaces' AND policyname = 'Organizers manage spaces';
  IF FOUND THEN
    DROP POLICY "Organizers manage spaces" ON public.spaces;
  END IF;

  CREATE POLICY "Organizers manage spaces"
    ON public.spaces
    FOR ALL
    USING (
      public.user_space_role_at_least(id, 'organizer')
      OR public.user_role_at_least('admin')
    )
    WITH CHECK (
      public.user_space_role_at_least(id, 'organizer')
      OR public.user_role_at_least('admin')
    );
END;
$$;

-- Space members governance
DO $$
BEGIN
  PERFORM 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'space_members' AND policyname = 'Members can view roster';
  IF FOUND THEN
    DROP POLICY "Members can view roster" ON public.space_members;
  END IF;

  CREATE POLICY "Members can view roster"
    ON public.space_members
    FOR SELECT
    USING (
      public.user_space_role_at_least(space_id, 'member')
      OR public.user_role_at_least('moderator')
    );

  PERFORM 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'space_members' AND policyname = 'Organizers manage roster';
  IF FOUND THEN
    DROP POLICY "Organizers manage roster" ON public.space_members;
  END IF;

  CREATE POLICY "Organizers manage roster"
    ON public.space_members
    FOR ALL
    USING (
      public.user_space_role_at_least(space_id, 'organizer')
      OR public.user_role_at_least('admin')
    )
    WITH CHECK (
      public.user_space_role_at_least(space_id, 'organizer')
      OR public.user_role_at_least('admin')
    );
END;
$$;

-- Space rules
DO $$
BEGIN
  PERFORM 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'space_rules' AND policyname = 'Rules readable to members';
  IF FOUND THEN
    DROP POLICY "Rules readable to members" ON public.space_rules;
  END IF;

  CREATE POLICY "Rules readable to members"
    ON public.space_rules
    FOR SELECT
    USING (
      public.user_space_role_at_least(space_id, 'member')
      OR public.user_role_at_least('moderator')
      OR EXISTS (
        SELECT 1 FROM public.spaces s
        WHERE s.id = space_id AND s.visibility = 'public'
      )
    );

  PERFORM 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'space_rules' AND policyname = 'Organizers manage rules';
  IF FOUND THEN
    DROP POLICY "Organizers manage rules" ON public.space_rules;
  END IF;

  CREATE POLICY "Organizers manage rules"
    ON public.space_rules
    FOR ALL
    USING (
      public.user_space_role_at_least(space_id, 'organizer')
      OR public.user_role_at_least('admin')
    )
    WITH CHECK (
      public.user_space_role_at_least(space_id, 'organizer')
      OR public.user_role_at_least('admin')
    );
END;
$$;

-- Posts policies (replace legacy ones)
DO $$
BEGIN
  PERFORM 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'posts' AND policyname LIKE 'Authors%';
  WHILE FOUND LOOP
    DROP POLICY IF EXISTS "Authors can update their own posts. Admins can update any post." ON public.posts;
    DROP POLICY IF EXISTS "Authors can delete their own posts. Admins can delete any post." ON public.posts;
    DROP POLICY IF EXISTS "Authors can insert their own posts." ON public.posts;
    PERFORM 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'posts' AND policyname LIKE 'Authors%';
  END LOOP;

  DROP POLICY IF EXISTS "Published posts are viewable by everyone." ON public.posts;
  DROP POLICY IF EXISTS "Authors can view their own posts." ON public.posts;
END;
$$;

CREATE POLICY "Posts readable by visibility"
  ON public.posts
  FOR SELECT
  USING (
    status = 'published'
      OR public.user_space_role_at_least(space_id, 'member')
      OR public.user_role_at_least('moderator')
      OR author_id = (
        SELECT id FROM public.profiles WHERE user_id = auth.uid()
      )
  );

CREATE POLICY "Contributors insert posts"
  ON public.posts
  FOR INSERT
  WITH CHECK (
    author_id = (
      SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
    AND (
      public.user_role_at_least('contributor')
      OR public.user_space_role_at_least(space_id, 'contributor')
    )
  );

CREATE POLICY "Contributors update drafts"
  ON public.posts
  FOR UPDATE
  USING (
    author_id = (
      SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
    OR public.user_role_at_least('moderator')
    OR public.user_space_role_at_least(space_id, 'organizer')
  )
  WITH CHECK (
    author_id = (
      SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
    OR public.user_role_at_least('moderator')
    OR public.user_space_role_at_least(space_id, 'organizer')
  );

CREATE POLICY "Moderators delete posts"
  ON public.posts
  FOR DELETE
  USING (
    public.user_role_at_least('moderator')
    OR public.user_space_role_at_least(space_id, 'organizer')
    OR author_id = (
      SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
  );

-- Post versions: mirror post author + staff access
CREATE POLICY "Post versions readable"
  ON public.post_versions
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1
      FROM public.posts p
      WHERE p.id = post_id
        AND (
          p.author_id = (
            SELECT id FROM public.profiles WHERE user_id = auth.uid()
          )
          OR public.user_space_role_at_least(p.space_id, 'organizer')
          OR public.user_role_at_least('moderator')
        )
    )
  );

CREATE POLICY "Post versions write access"
  ON public.post_versions
  FOR ALL
  USING (
    EXISTS (
      SELECT 1
      FROM public.posts p
      WHERE p.id = post_id
        AND (
          p.author_id = (
            SELECT id FROM public.profiles WHERE user_id = auth.uid()
          )
          OR public.user_space_role_at_least(p.space_id, 'organizer')
          OR public.user_role_at_least('moderator')
        )
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1
      FROM public.posts p
      WHERE p.id = post_id
        AND (
          p.author_id = (
            SELECT id FROM public.profiles WHERE user_id = auth.uid()
          )
          OR public.user_space_role_at_least(p.space_id, 'organizer')
          OR public.user_role_at_least('moderator')
        )
    )
  );

-- Comments policy refresh
DO $$
BEGIN
  DROP POLICY IF EXISTS "Public can read approved comments" ON public.comments;
  DROP POLICY IF EXISTS "Authenticated users can insert their comments" ON public.comments;
  DROP POLICY IF EXISTS "Admins can manage comments" ON public.comments;
END;
$$;

CREATE POLICY "Comments readable"
  ON public.comments
  FOR SELECT
  USING (
    status = 'approved'
    OR author_profile_id = (
      SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
    OR public.user_role_at_least('moderator')
    OR EXISTS (
      SELECT 1
      FROM public.posts p
      WHERE p.id = post_id
        AND public.user_space_role_at_least(p.space_id, 'member')
    )
  );

CREATE POLICY "Members create comments"
  ON public.comments
  FOR INSERT
  WITH CHECK (
    author_profile_id = (
      SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
    AND (
      public.user_role_at_least('member')
      OR EXISTS (
        SELECT 1 FROM public.posts p
        WHERE p.id = post_id
          AND public.user_space_role_at_least(p.space_id, 'member')
      )
    )
  );

CREATE POLICY "Moderators manage comments"
  ON public.comments
  FOR ALL
  USING (
    public.user_role_at_least('moderator')
    OR EXISTS (
      SELECT 1 FROM public.posts p
      WHERE p.id = post_id
        AND public.user_space_role_at_least(p.space_id, 'organizer')
    )
  )
  WITH CHECK (
    public.user_role_at_least('moderator')
    OR EXISTS (
      SELECT 1 FROM public.posts p
      WHERE p.id = post_id
        AND public.user_space_role_at_least(p.space_id, 'organizer')
    )
  );

-- Reports visibility
DO $$
BEGIN
  DROP POLICY IF EXISTS "Reports readable" ON public.reports;
END;
$$;

CREATE POLICY "Reports readable"
  ON public.reports
  FOR SELECT
  USING (
    public.user_role_at_least('moderator')
    OR public.user_space_role_at_least(space_id, 'moderator')
  );

CREATE POLICY "Reports manageable"
  ON public.reports
  FOR ALL
  USING (
    public.user_role_at_least('moderator')
    OR public.user_space_role_at_least(space_id, 'moderator')
  )
  WITH CHECK (
    public.user_role_at_least('moderator')
    OR public.user_space_role_at_least(space_id, 'moderator')
  );

-- Audit log remains service/admin but ensure admin check uses canonical helper
DO $$
BEGIN
  DROP POLICY IF EXISTS "Admins read audit logs" ON public.audit_logs;
END;
$$;

CREATE POLICY "Admins read audit logs"
  ON public.audit_logs
  FOR SELECT
  USING (public.user_role_at_least('admin'));

-- Feature flags policy hardened to canonical helper
DO $$
BEGIN
  DROP POLICY IF EXISTS "Admins manage feature flags" ON public.feature_flags;
END;
$$;

CREATE POLICY "Admins manage feature flags"
  ON public.feature_flags
  FOR ALL
  USING (public.user_role_at_least('admin'))
  WITH CHECK (public.user_role_at_least('admin'));

DO $$
BEGIN
  DROP POLICY IF EXISTS "Admins read feature flag audit" ON public.feature_flag_audit;
END;
$$;

CREATE POLICY "Admins read feature flag audit"
  ON public.feature_flag_audit
  FOR SELECT
  USING (public.user_role_at_least('admin'));

-- Profile roles select policy to expose canonical roles to members
DO $$
BEGIN
  DROP POLICY IF EXISTS "Users can read their role assignments" ON public.profile_roles;
END;
$$;

CREATE POLICY "Users can read their role assignments"
  ON public.profile_roles
  FOR SELECT
  USING (
    profile_id = (
      SELECT id FROM public.profiles WHERE user_id = auth.uid()
    )
    OR public.user_role_at_least('moderator')
  );

-- Ensure roles.slug constrained to canonical set
ALTER TABLE public.roles
  ADD CONSTRAINT roles_slug_check
  CHECK (
    slug IN ('member', 'contributor', 'organizer', 'moderator', 'admin')
  ) NOT VALID;

-- Backfill to satisfy new constraint by mapping legacy slugs
UPDATE public.roles
SET slug = public.normalize_role_slug(slug)
WHERE slug NOT IN ('member', 'contributor', 'organizer', 'moderator', 'admin');

ALTER TABLE public.roles VALIDATE CONSTRAINT roles_slug_check;

-- ---------------------------------------------------------------------
-- Unit-test helper: ensure highest_role_slug returns canonical member
-- ---------------------------------------------------------------------
DO $$
DECLARE
  member_role uuid;
  temp_profile uuid;
BEGIN
  SELECT id INTO member_role FROM public.roles WHERE slug = 'member';
  IF member_role IS NULL THEN
    RETURN;
  END IF;

  INSERT INTO public.profiles(id, user_id, display_name, is_admin)
  VALUES (gen_random_uuid(), gen_random_uuid(), 'rbac-test-profile', FALSE)
  ON CONFLICT DO NOTHING
  RETURNING id INTO temp_profile;

  IF temp_profile IS NULL THEN
    RETURN;
  END IF;

  INSERT INTO public.profile_roles(profile_id, role_id)
  VALUES (temp_profile, member_role)
  ON CONFLICT DO NOTHING;

  PERFORM public.highest_role_slug(temp_profile);

  DELETE FROM public.profile_roles WHERE profile_id = temp_profile;
  DELETE FROM public.profiles WHERE id = temp_profile;
END;
$$;

COMMENT ON FUNCTION public.user_space_role_at_least(uuid, text) IS 'Returns true when the current user holds at least the requested role within the given space.';
COMMENT ON FUNCTION public.highest_role_slug(uuid) IS 'Resolves the canonical highest privilege slug for a profile via determine_primary_role helper.';
COMMENT ON FUNCTION public.normalize_role_slug(text) IS 'Maps legacy role labels to canonical slugs.';
