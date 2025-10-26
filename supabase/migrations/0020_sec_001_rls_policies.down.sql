-- =====================================================================
-- Down migration for SEC-001 RBAC hardening slice
-- Rolls back schema additions while preserving legacy behavior
-- =====================================================================

-- Remove refreshed policies to restore prior defaults
DO $$
BEGIN
  DROP POLICY IF EXISTS "Posts readable by visibility" ON public.posts;
  DROP POLICY IF EXISTS "Contributors insert posts" ON public.posts;
  DROP POLICY IF EXISTS "Contributors update drafts" ON public.posts;
  DROP POLICY IF EXISTS "Moderators delete posts" ON public.posts;

  DROP POLICY IF EXISTS "Post versions readable" ON public.post_versions;
  DROP POLICY IF EXISTS "Post versions write access" ON public.post_versions;

  DROP POLICY IF EXISTS "Comments readable" ON public.comments;
  DROP POLICY IF EXISTS "Members create comments" ON public.comments;
  DROP POLICY IF EXISTS "Moderators manage comments" ON public.comments;

  DROP POLICY IF EXISTS "Reports readable" ON public.reports;
  DROP POLICY IF EXISTS "Reports manageable" ON public.reports;

  DROP POLICY IF EXISTS "Spaces readable per visibility" ON public.spaces;
  DROP POLICY IF EXISTS "Organizers manage spaces" ON public.spaces;
  DROP POLICY IF EXISTS "Members can view roster" ON public.space_members;
  DROP POLICY IF EXISTS "Organizers manage roster" ON public.space_members;
  DROP POLICY IF EXISTS "Rules readable to members" ON public.space_rules;
  DROP POLICY IF EXISTS "Organizers manage rules" ON public.space_rules;

  DROP POLICY IF EXISTS "Admins manage feature flags" ON public.feature_flags;
  DROP POLICY IF EXISTS "Admins read feature flag audit" ON public.feature_flag_audit;
  DROP POLICY IF EXISTS "Admins read audit logs" ON public.audit_logs;
  DROP POLICY IF EXISTS "Users can read their role assignments" ON public.profile_roles;
END;
$$;

-- Drop helper functions
DROP FUNCTION IF EXISTS public.user_space_role_at_least(uuid, text);
DROP FUNCTION IF EXISTS public.user_role_at_least(text);
DROP FUNCTION IF EXISTS public.profile_role_at_least(uuid, text);
DROP FUNCTION IF EXISTS public.role_priority_for_slug(text);
DROP FUNCTION IF EXISTS public.highest_role_slug(uuid);
DROP FUNCTION IF EXISTS public.normalize_role_slug(text);
DROP FUNCTION IF EXISTS public.current_profile_id();
DROP FUNCTION IF EXISTS public.user_is_admin();

-- Remove additional indexes and constraints
ALTER TABLE public.posts DROP COLUMN IF EXISTS space_id;
ALTER TABLE public.comments DROP COLUMN IF EXISTS thread_root_id;
ALTER TABLE public.roles DROP CONSTRAINT IF EXISTS roles_slug_check;

-- Drop new tables (cascades remove indexes and triggers)
DROP TABLE IF EXISTS public.reports;
DROP TABLE IF EXISTS public.post_versions;
DROP TABLE IF EXISTS public.space_rules;
DROP TABLE IF EXISTS public.space_members;
DROP TABLE IF EXISTS public.spaces;

-- Drop enums only if unused
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_depend d ON d.refobjid = t.oid
    WHERE t.typname = 'space_visibility'
      AND d.deptype = 'n'
  ) THEN
    DROP TYPE IF EXISTS public.space_visibility;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_depend d ON d.refobjid = t.oid
    WHERE t.typname = 'space_membership_status'
      AND d.deptype = 'n'
  ) THEN
    DROP TYPE IF EXISTS public.space_membership_status;
  END IF;
END;
$$;

-- Disable RLS on tables created in the up migration (dropping tables already clears, but safe)
ALTER TABLE IF EXISTS public.spaces DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.space_members DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.space_rules DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.post_versions DISABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.reports DISABLE ROW LEVEL SECURITY;

-- NOTE: prior migrations defined the legacy policies; rerun 0018 down/up to restore if required.
