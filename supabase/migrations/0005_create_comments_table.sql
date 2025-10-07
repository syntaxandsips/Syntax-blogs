-- Create enum for comment statuses if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type t
    WHERE t.typname = 'comment_status'
      AND t.typnamespace = 'public'::regnamespace
  ) THEN
    CREATE TYPE public.comment_status AS ENUM ('pending', 'approved', 'rejected');
  END IF;
END;
$$;

-- Create comments table
CREATE TABLE IF NOT EXISTS public.comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.posts (id) ON DELETE CASCADE,
  author_profile_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  content text NOT NULL,
  status public.comment_status NOT NULL DEFAULT 'pending',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  approved_at timestamptz
);

CREATE INDEX IF NOT EXISTS comments_post_id_idx ON public.comments (post_id);
CREATE INDEX IF NOT EXISTS comments_status_idx ON public.comments (status);
CREATE INDEX IF NOT EXISTS comments_created_at_idx ON public.comments (created_at DESC);

-- Trigger to keep updated_at fresh
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'comments_set_updated_at'
      AND tgrelid = 'public.comments'::regclass
  ) THEN
    CREATE TRIGGER comments_set_updated_at
      BEFORE UPDATE ON public.comments
      FOR EACH ROW
      EXECUTE FUNCTION public.set_updated_at();
  END IF;
END;
$$;

-- Enable row level security
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;

-- Policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'comments'
      AND policyname = 'Public can read approved comments'
  ) THEN
    CREATE POLICY "Public can read approved comments"
      ON public.comments
      FOR SELECT
      USING (
        status = 'approved'
        OR (
          auth.uid() IS NOT NULL AND
          author_profile_id IN (
            SELECT id FROM public.profiles WHERE user_id = auth.uid()
          )
        )
        OR (
          EXISTS (
            SELECT 1
            FROM public.profiles
            WHERE user_id = auth.uid()
              AND is_admin = TRUE
          )
        )
      );
  END IF;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'comments'
      AND policyname = 'Authenticated users can insert their comments'
  ) THEN
    CREATE POLICY "Authenticated users can insert their comments"
      ON public.comments
      FOR INSERT
      WITH CHECK (
        auth.uid() IS NOT NULL
        AND author_profile_id IN (
          SELECT id FROM public.profiles WHERE user_id = auth.uid()
        )
      );
  END IF;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'comments'
      AND policyname = 'Admins can manage comments'
  ) THEN
    CREATE POLICY "Admins can manage comments"
      ON public.comments
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
