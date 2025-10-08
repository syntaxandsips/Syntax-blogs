-- Create gamification tables, indexes, policies, and helper routines.
-- This migration follows the architecture described in docs/gamification-roadmap.md
-- and provides the foundational persistence layer for the Syntax & Sips gamification system.

-- Ensure custom enums exist for challenge cadence and progress status to keep data constrained.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type t
    WHERE t.typname = 'challenge_cadence'
      AND t.typnamespace = 'public'::regnamespace
  ) THEN
    CREATE TYPE public.challenge_cadence AS ENUM ('daily', 'weekly', 'monthly', 'seasonal', 'event');
  END IF;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type t
    WHERE t.typname = 'challenge_progress_status'
      AND t.typnamespace = 'public'::regnamespace
  ) THEN
    CREATE TYPE public.challenge_progress_status AS ENUM ('active', 'completed', 'expired', 'abandoned');
  END IF;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_type t
    WHERE t.typname = 'badge_state'
      AND t.typnamespace = 'public'::regnamespace
  ) THEN
    CREATE TYPE public.badge_state AS ENUM ('awarded', 'revoked', 'suspended');
  END IF;
END;
$$;

-- Primary profile summary table for gamification metrics.
CREATE TABLE IF NOT EXISTS public.gamification_profiles (
  profile_id uuid PRIMARY KEY REFERENCES public.profiles (id) ON DELETE CASCADE,
  xp_total bigint NOT NULL DEFAULT 0,
  level integer NOT NULL DEFAULT 1,
  prestige_level integer NOT NULL DEFAULT 0,
  level_progress jsonb NOT NULL DEFAULT '{}'::jsonb,
  current_streak integer NOT NULL DEFAULT 0,
  longest_streak integer NOT NULL DEFAULT 0,
  last_action_at timestamptz,
  streak_frozen_until timestamptz,
  opted_in boolean NOT NULL DEFAULT true,
  settings jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS gamification_profiles_level_idx
  ON public.gamification_profiles (level DESC, xp_total DESC);

-- Ledger of every action that resulted in XP or points being awarded.
CREATE TABLE IF NOT EXISTS public.gamification_actions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  action_type text NOT NULL,
  action_source text,
  points_awarded integer NOT NULL DEFAULT 0,
  xp_awarded integer NOT NULL DEFAULT 0,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  awarded_at timestamptz NOT NULL DEFAULT now(),
  request_id uuid,
  UNIQUE (profile_id, action_type, awarded_at)
);

CREATE INDEX IF NOT EXISTS gamification_actions_profile_idx
  ON public.gamification_actions (profile_id, awarded_at DESC);

CREATE INDEX IF NOT EXISTS gamification_actions_type_idx
  ON public.gamification_actions (action_type, awarded_at DESC);

-- Badge catalog
CREATE TABLE IF NOT EXISTS public.gamification_badges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  name text NOT NULL,
  description text,
  category text NOT NULL,
  rarity text NOT NULL DEFAULT 'common',
  parent_badge_id uuid REFERENCES public.gamification_badges (id) ON DELETE SET NULL,
  icon text,
  theme text,
  requirements jsonb NOT NULL DEFAULT '{}'::jsonb,
  reward_points integer NOT NULL DEFAULT 0,
  is_time_limited boolean NOT NULL DEFAULT false,
  available_from timestamptz,
  available_to timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS gamification_badges_category_idx
  ON public.gamification_badges (category);

CREATE INDEX IF NOT EXISTS gamification_badges_rarity_idx
  ON public.gamification_badges (rarity);

-- Mapping between profiles and badges they own.
CREATE TABLE IF NOT EXISTS public.profile_badges (
  profile_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  badge_id uuid NOT NULL REFERENCES public.gamification_badges (id) ON DELETE CASCADE,
  state public.badge_state NOT NULL DEFAULT 'awarded',
  awarded_at timestamptz NOT NULL DEFAULT now(),
  evidence jsonb,
  progress jsonb NOT NULL DEFAULT '{}'::jsonb,
  notified_at timestamptz,
  PRIMARY KEY (profile_id, badge_id)
);

CREATE INDEX IF NOT EXISTS profile_badges_badge_idx
  ON public.profile_badges (badge_id);

-- Level definitions with XP thresholds and perks metadata.
CREATE TABLE IF NOT EXISTS public.gamification_levels (
  level integer PRIMARY KEY,
  title text NOT NULL,
  min_xp bigint NOT NULL,
  perks jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE UNIQUE INDEX IF NOT EXISTS gamification_levels_min_xp_idx
  ON public.gamification_levels (min_xp);

-- Challenge catalog
CREATE TABLE IF NOT EXISTS public.gamification_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  description text,
  cadence public.challenge_cadence NOT NULL,
  requirements jsonb NOT NULL DEFAULT '{}'::jsonb,
  reward_points integer NOT NULL DEFAULT 0,
  reward_badge_id uuid REFERENCES public.gamification_badges (id) ON DELETE SET NULL,
  starts_at timestamptz,
  ends_at timestamptz,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS gamification_challenges_cadence_idx
  ON public.gamification_challenges (cadence, is_active);

-- Profile challenge progress tracker
CREATE TABLE IF NOT EXISTS public.profile_challenge_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid NOT NULL REFERENCES public.profiles (id) ON DELETE CASCADE,
  challenge_id uuid NOT NULL REFERENCES public.gamification_challenges (id) ON DELETE CASCADE,
  progress jsonb NOT NULL DEFAULT '{}'::jsonb,
  status public.challenge_progress_status NOT NULL DEFAULT 'active',
  streak_count integer NOT NULL DEFAULT 0,
  started_at timestamptz NOT NULL DEFAULT now(),
  completed_at timestamptz,
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (profile_id, challenge_id)
);

CREATE INDEX IF NOT EXISTS profile_challenge_progress_profile_idx
  ON public.profile_challenge_progress (profile_id);

CREATE INDEX IF NOT EXISTS profile_challenge_progress_status_idx
  ON public.profile_challenge_progress (status);

-- Leaderboard snapshots for cached ranking payloads.
CREATE TABLE IF NOT EXISTS public.leaderboard_snapshots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  scope text NOT NULL,
  captured_at timestamptz NOT NULL DEFAULT now(),
  expires_at timestamptz,
  payload jsonb NOT NULL DEFAULT '{}'::jsonb
);

CREATE INDEX IF NOT EXISTS leaderboard_snapshots_scope_idx
  ON public.leaderboard_snapshots (scope, captured_at DESC);

-- Audit log for manual adjustments and privileged actions.
CREATE TABLE IF NOT EXISTS public.gamification_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  profile_id uuid REFERENCES public.profiles (id) ON DELETE SET NULL,
  action text NOT NULL,
  delta bigint,
  reason text,
  performed_by uuid REFERENCES public.profiles (id) ON DELETE SET NULL,
  metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS gamification_audit_profile_idx
  ON public.gamification_audit (profile_id, created_at DESC);

CREATE INDEX IF NOT EXISTS gamification_audit_action_idx
  ON public.gamification_audit (action, created_at DESC);

-- Trigger helpers for updated_at maintenance.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'gamification_profiles_set_updated_at'
      AND tgrelid = 'public.gamification_profiles'::regclass
  ) THEN
    CREATE TRIGGER gamification_profiles_set_updated_at
      BEFORE UPDATE ON public.gamification_profiles
      FOR EACH ROW
      EXECUTE FUNCTION public.set_updated_at();
  END IF;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'gamification_badges_set_updated_at'
      AND tgrelid = 'public.gamification_badges'::regclass
  ) THEN
    CREATE TRIGGER gamification_badges_set_updated_at
      BEFORE UPDATE ON public.gamification_badges
      FOR EACH ROW
      EXECUTE FUNCTION public.set_updated_at();
  END IF;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'gamification_levels_set_updated_at'
      AND tgrelid = 'public.gamification_levels'::regclass
  ) THEN
    CREATE TRIGGER gamification_levels_set_updated_at
      BEFORE UPDATE ON public.gamification_levels
      FOR EACH ROW
      EXECUTE FUNCTION public.set_updated_at();
  END IF;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'gamification_challenges_set_updated_at'
      AND tgrelid = 'public.gamification_challenges'::regclass
  ) THEN
    CREATE TRIGGER gamification_challenges_set_updated_at
      BEFORE UPDATE ON public.gamification_challenges
      FOR EACH ROW
      EXECUTE FUNCTION public.set_updated_at();
  END IF;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'profile_challenge_progress_set_updated_at'
      AND tgrelid = 'public.profile_challenge_progress'::regclass
  ) THEN
    CREATE TRIGGER profile_challenge_progress_set_updated_at
      BEFORE UPDATE ON public.profile_challenge_progress
      FOR EACH ROW
      EXECUTE FUNCTION public.set_updated_at();
  END IF;
END;
$$;

-- Audit logging trigger to capture xp total changes.
CREATE OR REPLACE FUNCTION public.log_gamification_profile_audit()
RETURNS trigger
LANGUAGE plpgsql
AS $$
DECLARE
  xp_delta bigint;
BEGIN
  IF TG_OP = 'UPDATE' THEN
    IF NEW.xp_total IS DISTINCT FROM OLD.xp_total THEN
      xp_delta := COALESCE(NEW.xp_total, 0) - COALESCE(OLD.xp_total, 0);
      INSERT INTO public.gamification_audit (profile_id, action, delta, reason, metadata)
      VALUES (
        NEW.profile_id,
        'xp_total_changed',
        xp_delta,
        'Automatic XP ledger update',
        jsonb_build_object('previous', OLD.xp_total, 'next', NEW.xp_total, 'level', NEW.level)
      );
    END IF;
    IF NEW.level IS DISTINCT FROM OLD.level THEN
      INSERT INTO public.gamification_audit (profile_id, action, delta, reason, metadata)
      VALUES (
        NEW.profile_id,
        'level_changed',
        NULL,
        'Level recalculated based on XP thresholds',
        jsonb_build_object('previous', OLD.level, 'next', NEW.level, 'prestige', NEW.prestige_level)
      );
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_trigger
    WHERE tgname = 'gamification_profiles_audit_trigger'
      AND tgrelid = 'public.gamification_profiles'::regclass
  ) THEN
    CREATE TRIGGER gamification_profiles_audit_trigger
      AFTER UPDATE ON public.gamification_profiles
      FOR EACH ROW
      EXECUTE FUNCTION public.log_gamification_profile_audit();
  END IF;
END;
$$;

-- Row Level Security policies
ALTER TABLE public.gamification_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gamification_actions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gamification_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_badges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gamification_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gamification_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profile_challenge_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leaderboard_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gamification_audit ENABLE ROW LEVEL SECURITY;

-- Helper predicate to determine whether the requesting user is an administrator.
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles p
    WHERE p.user_id = auth.uid()
      AND p.is_admin = TRUE
  );
$$;

-- Policies for gamification_profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'gamification_profiles'
      AND policyname = 'Gamification profile owner access'
  ) THEN
    CREATE POLICY "Gamification profile owner access"
      ON public.gamification_profiles
      FOR SELECT
      USING (
        EXISTS (
          SELECT 1
          FROM public.profiles p
          WHERE p.id = public.gamification_profiles.profile_id
            AND p.user_id = auth.uid()
        )
        OR public.is_admin()
      );
  END IF;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'gamification_profiles'
      AND policyname = 'Gamification profiles admin manage'
  ) THEN
    CREATE POLICY "Gamification profiles admin manage"
      ON public.gamification_profiles
      FOR ALL
      USING (public.is_admin())
      WITH CHECK (public.is_admin());
  END IF;
END;
$$;

-- Policies for gamification_actions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'gamification_actions'
      AND policyname = 'Gamification actions owner select'
  ) THEN
    CREATE POLICY "Gamification actions owner select"
      ON public.gamification_actions
      FOR SELECT
      USING (
        EXISTS (
          SELECT 1
          FROM public.profiles p
          WHERE p.id = public.gamification_actions.profile_id
            AND p.user_id = auth.uid()
        )
        OR public.is_admin()
      );
  END IF;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'gamification_actions'
      AND policyname = 'Gamification actions service writes'
  ) THEN
    CREATE POLICY "Gamification actions service writes"
      ON public.gamification_actions
      FOR INSERT
      WITH CHECK (
        auth.role() = 'service_role'
      );
  END IF;
END;
$$;

-- Badge catalog policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'gamification_badges'
      AND policyname = 'Gamification badges readable'
  ) THEN
    CREATE POLICY "Gamification badges readable"
      ON public.gamification_badges
      FOR SELECT
      USING (true);
  END IF;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'gamification_badges'
      AND policyname = 'Gamification badges admin manage'
  ) THEN
    CREATE POLICY "Gamification badges admin manage"
      ON public.gamification_badges
      FOR ALL
      USING (public.is_admin())
      WITH CHECK (public.is_admin());
  END IF;
END;
$$;

-- Profile badges policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'profile_badges'
      AND policyname = 'Profile badges owner access'
  ) THEN
    CREATE POLICY "Profile badges owner access"
      ON public.profile_badges
      FOR SELECT
      USING (
        EXISTS (
          SELECT 1
          FROM public.profiles p
          WHERE p.id = public.profile_badges.profile_id
            AND p.user_id = auth.uid()
        )
        OR public.is_admin()
      );
  END IF;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'profile_badges'
      AND policyname = 'Profile badges admin manage'
  ) THEN
    CREATE POLICY "Profile badges admin manage"
      ON public.profile_badges
      FOR ALL
      USING (public.is_admin())
      WITH CHECK (public.is_admin());
  END IF;
END;
$$;

-- Levels policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'gamification_levels'
      AND policyname = 'Gamification levels public read'
  ) THEN
    CREATE POLICY "Gamification levels public read"
      ON public.gamification_levels
      FOR SELECT
      USING (true);
  END IF;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'gamification_levels'
      AND policyname = 'Gamification levels admin manage'
  ) THEN
    CREATE POLICY "Gamification levels admin manage"
      ON public.gamification_levels
      FOR ALL
      USING (public.is_admin())
      WITH CHECK (public.is_admin());
  END IF;
END;
$$;

-- Challenge policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'gamification_challenges'
      AND policyname = 'Gamification challenges readable'
  ) THEN
    CREATE POLICY "Gamification challenges readable"
      ON public.gamification_challenges
      FOR SELECT
      USING (true);
  END IF;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'gamification_challenges'
      AND policyname = 'Gamification challenges admin manage'
  ) THEN
    CREATE POLICY "Gamification challenges admin manage"
      ON public.gamification_challenges
      FOR ALL
      USING (public.is_admin())
      WITH CHECK (public.is_admin());
  END IF;
END;
$$;

-- Challenge progress policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'profile_challenge_progress'
      AND policyname = 'Challenge progress owner access'
  ) THEN
    CREATE POLICY "Challenge progress owner access"
      ON public.profile_challenge_progress
      FOR SELECT
      USING (
        EXISTS (
          SELECT 1
          FROM public.profiles p
          WHERE p.id = public.profile_challenge_progress.profile_id
            AND p.user_id = auth.uid()
        )
        OR public.is_admin()
      );
  END IF;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'profile_challenge_progress'
      AND policyname = 'Challenge progress admin manage'
  ) THEN
    CREATE POLICY "Challenge progress admin manage"
      ON public.profile_challenge_progress
      FOR ALL
      USING (public.is_admin())
      WITH CHECK (public.is_admin());
  END IF;
END;
$$;

-- Leaderboard snapshot policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'leaderboard_snapshots'
      AND policyname = 'Leaderboard snapshots readable'
  ) THEN
    CREATE POLICY "Leaderboard snapshots readable"
      ON public.leaderboard_snapshots
      FOR SELECT
      USING (true);
  END IF;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'leaderboard_snapshots'
      AND policyname = 'Leaderboard snapshots admin manage'
  ) THEN
    CREATE POLICY "Leaderboard snapshots admin manage"
      ON public.leaderboard_snapshots
      FOR ALL
      USING (public.is_admin())
      WITH CHECK (public.is_admin());
  END IF;
END;
$$;

-- Gamification audit policies
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'gamification_audit'
      AND policyname = 'Gamification audit admin read'
  ) THEN
    CREATE POLICY "Gamification audit admin read"
      ON public.gamification_audit
      FOR SELECT
      USING (public.is_admin());
  END IF;
END;
$$;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename = 'gamification_audit'
      AND policyname = 'Gamification audit admin write'
  ) THEN
    CREATE POLICY "Gamification audit admin write"
      ON public.gamification_audit
      FOR ALL
      USING (public.is_admin())
      WITH CHECK (public.is_admin());
  END IF;
END;
$$;

-- Seed baseline levels and badges only when not already populated to allow reruns idempotently.
INSERT INTO public.gamification_levels (level, title, min_xp, perks)
VALUES
  (1, 'Curious Sipper', 0, '{"perks": ["Weekly inspiration drip"]}'::jsonb),
  (2, 'Cafe Collaborator', 250, '{"perks": ["Comment flair", "Priority event RSVP"]}'::jsonb),
  (3, 'Syntax Storyteller', 750, '{"perks": ["Draft co-review", "Beta feature access"]}'::jsonb),
  (4, 'Brewer of Ideas', 1500, '{"perks": ["Host community roundtable", "Post spotlight nominations"]}'::jsonb),
  (5, 'Syntax Sage', 3000, '{"perks": ["Early access to experiments", "Invite-only salons"]}'::jsonb)
ON CONFLICT (level) DO NOTHING;

INSERT INTO public.gamification_badges (slug, name, description, category, rarity, requirements, reward_points, icon, theme)
VALUES
  ('first-sip', 'First Sip', 'Completed onboarding and shared your first intention.', 'achievement', 'common', '{"requires": ["onboarding_completed"]}'::jsonb, 50, 'mug', 'copper'),
  ('steady-sipper', 'Steady Sipper', 'Posted or commented five days in a row.', 'streak', 'uncommon', '{"streak_days": 5}'::jsonb, 150, 'flame', 'amber'),
  ('community-barista', 'Community Barista', 'Earned 10 helpful comment upvotes.', 'community', 'rare', '{"helpful_votes": 10}'::jsonb, 250, 'sparkles', 'violet'),
  ('seasonal-taster', 'Seasonal Taster', 'Participated in a Syntax & Sips seasonal challenge.', 'seasonal', 'rare', '{"challenge_participation": true}'::jsonb, 200, 'calendar', 'rose')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO public.gamification_challenges (slug, title, description, cadence, requirements, reward_points, reward_badge_id, starts_at, ends_at)
VALUES
  ('daily-brew', 'Daily Brew Log', 'Share one learning each day this week.', 'daily', '{"actions_required": [{"action": "comment.approved", "count": 1}]}'::jsonb, 40, NULL, now(), now() + interval '7 days'),
  ('weekly-roast', 'Weekly Roast Challenge', 'Publish or update one article this week.', 'weekly', '{"actions_required": [{"action": "post.published", "count": 1}]}'::jsonb, 120, NULL, now(), now() + interval '14 days')
ON CONFLICT (slug) DO NOTHING;

-- Down migration instructions (informational): drop tables in reverse order if rollback is required.
-- DROP TABLE IF EXISTS public.gamification_audit;
-- DROP TABLE IF EXISTS public.leaderboard_snapshots;
-- DROP TABLE IF EXISTS public.profile_challenge_progress;
-- DROP TABLE IF EXISTS public.gamification_challenges;
-- DROP TABLE IF EXISTS public.gamification_levels;
-- DROP TABLE IF EXISTS public.profile_badges;
-- DROP TABLE IF EXISTS public.gamification_badges;
-- DROP TABLE IF EXISTS public.gamification_actions;
-- DROP TABLE IF EXISTS public.gamification_profiles;
-- DROP TYPE IF EXISTS public.badge_state;
-- DROP TYPE IF EXISTS public.challenge_progress_status;
-- DROP TYPE IF EXISTS public.challenge_cadence;
