-- =====================================================================
-- SEC-001 follow-up: ensure supporting constraints and indexes exist
-- for role governance and content moderation workloads.
-- =====================================================================

-- Unique pairing for profile/role assignments (idempotent)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_indexes
    WHERE schemaname = 'public'
      AND indexname = 'profile_roles_profile_role_idx'
  ) THEN
    CREATE UNIQUE INDEX profile_roles_profile_role_idx
      ON public.profile_roles(profile_id, role_id);
  END IF;
END;
$$;

-- Composite ordering for space scoped moderation queues
CREATE INDEX IF NOT EXISTS space_members_role_status_v2_idx
  ON public.space_members(role_id, status, joined_at DESC);

-- Accelerate content feeds ordered within spaces
CREATE INDEX IF NOT EXISTS posts_space_status_published_idx
  ON public.posts(space_id, status, published_at DESC NULLS LAST);

-- Thread visibility + moderation review speed-ups
CREATE INDEX IF NOT EXISTS comments_thread_status_created_idx
  ON public.comments(thread_root_id, status, created_at DESC);

-- Guard rails to prevent legacy slugs from slipping back in
ALTER TABLE public.roles
  ADD CONSTRAINT roles_slug_canonical_ck
  CHECK (slug = public.normalize_role_slug(slug))
  NOT VALID;

ALTER TABLE public.roles
  VALIDATE CONSTRAINT roles_slug_canonical_ck;
