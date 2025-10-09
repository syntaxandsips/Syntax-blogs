-- =================================================================
-- POST VOTE REACTIONS
-- =================================================================
-- Enables upvote/downvote reactions on blog posts backed by Supabase.
-- Tracks each profile's vote and keeps metadata ready for aggregation.
-- =================================================================

-- Ensure enum exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type t
    WHERE t.typname = 'post_vote_type'
      AND t.typnamespace = 'public'::regnamespace
  ) THEN
    CREATE TYPE public.post_vote_type AS ENUM ('upvote', 'downvote');
  END IF;
END;
$$;

-- Create table
CREATE TABLE IF NOT EXISTS public.post_votes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  profile_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  vote_type public.post_vote_type NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT post_votes_unique UNIQUE(post_id, profile_id)
);

CREATE INDEX IF NOT EXISTS post_votes_post_id_idx ON public.post_votes(post_id);
CREATE INDEX IF NOT EXISTS post_votes_profile_id_idx ON public.post_votes(profile_id);
CREATE INDEX IF NOT EXISTS post_votes_vote_type_idx ON public.post_votes(vote_type);

-- Updated at trigger
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'post_votes_set_updated_at'
      AND tgrelid = 'public.post_votes'::regclass
  ) THEN
    CREATE TRIGGER post_votes_set_updated_at
      BEFORE UPDATE ON public.post_votes
      FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
END;
$$;

-- Enable RLS
ALTER TABLE public.post_votes ENABLE ROW LEVEL SECURITY;

-- Policy: allow users to manage their own votes
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'post_votes'
      AND policyname = 'Users can manage their post votes'
  ) THEN
    CREATE POLICY "Users can manage their post votes"
      ON public.post_votes
      FOR ALL
      USING (
        profile_id IN (
          SELECT id FROM public.profiles WHERE user_id = auth.uid()
        )
      )
      WITH CHECK (
        profile_id IN (
          SELECT id FROM public.profiles WHERE user_id = auth.uid()
        )
      );
  END IF;
END;
$$;

-- Policy: admins can manage all votes
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'post_votes'
      AND policyname = 'Admins can manage post votes'
  ) THEN
    CREATE POLICY "Admins can manage post votes"
      ON public.post_votes
      FOR ALL
      USING (
        EXISTS (
          SELECT 1
          FROM public.profiles
          WHERE user_id = auth.uid()
            AND is_admin = TRUE
        )
      )
      WITH CHECK (
        EXISTS (
          SELECT 1
          FROM public.profiles
          WHERE user_id = auth.uid()
            AND is_admin = TRUE
        )
      );
  END IF;
END;
$$;

COMMENT ON TABLE public.post_votes IS 'Stores per-profile upvote/downvote reactions for blog posts.';
