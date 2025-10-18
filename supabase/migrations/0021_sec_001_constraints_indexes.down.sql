-- Revert SEC-001 constraint/index helpers
DROP INDEX IF EXISTS public.profile_roles_profile_role_idx;
DROP INDEX IF EXISTS public.space_members_role_status_v2_idx;
DROP INDEX IF EXISTS public.posts_space_status_published_idx;
DROP INDEX IF EXISTS public.comments_thread_status_created_idx;

ALTER TABLE public.roles
  DROP CONSTRAINT IF EXISTS roles_slug_canonical_ck;
