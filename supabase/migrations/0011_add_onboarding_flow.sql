-- Create onboarding status enum if it does not already exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'onboarding_status') THEN
    CREATE TYPE onboarding_status AS ENUM ('pending', 'in_progress', 'completed');
  END IF;
END;
$$;

-- Create table to store personalized onboarding journeys
CREATE TABLE IF NOT EXISTS public.profile_onboarding_journeys (
  profile_id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status onboarding_status NOT NULL DEFAULT 'pending',
  current_step text,
  responses jsonb NOT NULL DEFAULT '{}'::jsonb,
  version text NOT NULL DEFAULT '2025.02',
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at timestamptz NOT NULL DEFAULT timezone('utc', now()),
  completed_at timestamptz
);

CREATE UNIQUE INDEX IF NOT EXISTS profile_onboarding_journeys_user_id_key
  ON public.profile_onboarding_journeys(user_id);

-- Ensure updated_at stays fresh
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'profile_onboarding_journeys_set_updated_at'
  ) THEN
    CREATE TRIGGER profile_onboarding_journeys_set_updated_at
      BEFORE UPDATE ON public.profile_onboarding_journeys
      FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
  END IF;
END;
$$;

-- Automatically seed onboarding journeys for every profile
CREATE OR REPLACE FUNCTION public.create_onboarding_journey_for_profile()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profile_onboarding_journeys (profile_id, user_id)
  VALUES (NEW.id, NEW.user_id)
  ON CONFLICT (profile_id) DO UPDATE
    SET user_id = EXCLUDED.user_id;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS create_onboarding_journey_for_profile ON public.profiles;

CREATE TRIGGER create_onboarding_journey_for_profile
  AFTER INSERT ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.create_onboarding_journey_for_profile();

-- Backfill for existing profiles
INSERT INTO public.profile_onboarding_journeys (profile_id, user_id)
SELECT p.id, p.user_id
FROM public.profiles p
ON CONFLICT (profile_id) DO UPDATE
  SET user_id = EXCLUDED.user_id;

-- Enable and configure RLS
ALTER TABLE public.profile_onboarding_journeys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their onboarding"
  ON public.profile_onboarding_journeys
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can record onboarding progress"
  ON public.profile_onboarding_journeys
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can start their onboarding"
  ON public.profile_onboarding_journeys
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);
