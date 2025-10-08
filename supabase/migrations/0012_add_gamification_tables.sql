-- Gamification tables, indexes, policies, and seed data
set check_function_bodies = off;

create table if not exists public.gamification_profiles (
  profile_id uuid primary key references public.profiles(id) on delete cascade,
  xp_total bigint not null default 0,
  level integer not null default 1,
  prestige integer not null default 0,
  current_streak integer not null default 0,
  longest_streak integer not null default 0,
  last_action_at timestamptz,
  settings jsonb not null default jsonb_build_object(
    'optedIn', true,
    'showcaseBadges', true,
    'emailNotifications', true,
    'betaTester', false
  ),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists gamification_profiles_level_idx on public.gamification_profiles(level desc, xp_total desc);
create index if not exists gamification_profiles_last_action_idx on public.gamification_profiles(last_action_at desc);

create table if not exists public.gamification_actions (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.gamification_profiles(profile_id) on delete cascade,
  action_type text not null,
  points integer not null,
  xp integer not null,
  metadata jsonb,
  awarded_at timestamptz not null default now()
);

create index if not exists gamification_actions_profile_idx on public.gamification_actions(profile_id, awarded_at desc);
create index if not exists gamification_actions_type_idx on public.gamification_actions(action_type, awarded_at desc);

create table if not exists public.gamification_badges (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  category text not null,
  rarity text not null default 'common',
  requirements jsonb not null,
  is_time_limited boolean not null default false,
  available_from timestamptz,
  available_to timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.profile_badges (
  profile_id uuid not null references public.gamification_profiles(profile_id) on delete cascade,
  badge_id uuid not null references public.gamification_badges(id) on delete cascade,
  awarded_at timestamptz not null default now(),
  evidence jsonb,
  progress jsonb,
  primary key (profile_id, badge_id)
);

create table if not exists public.gamification_levels (
  level integer primary key,
  min_xp bigint not null,
  perks jsonb not null default '{}'
);

create table if not exists public.gamification_challenges (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  cadence text not null,
  requirements jsonb not null,
  reward_points integer not null default 0,
  reward_badge_id uuid references public.gamification_badges(id) on delete set null,
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  is_active boolean not null default true
);

create table if not exists public.profile_challenge_progress (
  profile_id uuid not null references public.gamification_profiles(profile_id) on delete cascade,
  challenge_id uuid not null references public.gamification_challenges(id) on delete cascade,
  progress jsonb not null default jsonb_build_object('value', 0),
  status text not null default 'active',
  started_at timestamptz not null default now(),
  completed_at timestamptz,
  primary key (profile_id, challenge_id)
);

create table if not exists public.leaderboard_snapshots (
  id uuid primary key default gen_random_uuid(),
  scope text not null,
  captured_at timestamptz not null default now(),
  payload jsonb not null,
  expires_at timestamptz not null
);

create table if not exists public.gamification_audit (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references public.gamification_profiles(profile_id) on delete set null,
  action text not null,
  delta integer,
  reason text,
  performed_by uuid references public.profiles(id) on delete set null,
  created_at timestamptz not null default now()
);

-- Utility trigger for updated_at
create or replace function public.set_gamification_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger gamification_profiles_set_updated_at
before update on public.gamification_profiles
for each row execute function public.set_gamification_updated_at();

create trigger gamification_badges_set_updated_at
before update on public.gamification_badges
for each row execute function public.set_gamification_updated_at();

create trigger gamification_challenges_set_updated_at
before update on public.gamification_challenges
for each row execute function public.set_gamification_updated_at();

-- Trigger to seed gamification profile when profile created
create or replace function public.ensure_gamification_profile()
returns trigger
language plpgsql
as $$
begin
  insert into public.gamification_profiles(profile_id)
  values (new.id)
  on conflict (profile_id) do nothing;
  return new;
end;
$$;

create trigger profiles_after_insert_gamification
after insert on public.profiles
for each row execute function public.ensure_gamification_profile();

-- Row level security
alter table public.gamification_profiles enable row level security;
alter table public.gamification_actions enable row level security;
alter table public.gamification_badges enable row level security;
alter table public.profile_badges enable row level security;
alter table public.gamification_challenges enable row level security;
alter table public.profile_challenge_progress enable row level security;
alter table public.leaderboard_snapshots enable row level security;
alter table public.gamification_audit enable row level security;

create policy "Owners can read their gamification profile" on public.gamification_profiles
  for select
  using (
    auth.uid() = (select user_id from public.profiles where id = profile_id)
    or (select is_admin from public.profiles where user_id = auth.uid())
  );

create policy "Owners can update gamification preferences" on public.gamification_profiles
  for update
  using (
    auth.uid() = (select user_id from public.profiles where id = profile_id)
    or (select is_admin from public.profiles where user_id = auth.uid())
  )
  with check (
    auth.uid() = (select user_id from public.profiles where id = profile_id)
    or (select is_admin from public.profiles where user_id = auth.uid())
  );

create policy "Admins manage gamification profiles" on public.gamification_profiles
  for all
  using ((select is_admin from public.profiles where user_id = auth.uid()))
  with check ((select is_admin from public.profiles where user_id = auth.uid()));

create policy "Owners view their actions" on public.gamification_actions
  for select
  using (
    auth.uid() = (select user_id from public.profiles where id = profile_id)
    or (select is_admin from public.profiles where user_id = auth.uid())
  );

create policy "Service role inserts actions" on public.gamification_actions
  for insert
  with check (auth.role() = 'service_role');

create policy "Admins manage actions" on public.gamification_actions
  for all
  using ((select is_admin from public.profiles where user_id = auth.uid()))
  with check ((select is_admin from public.profiles where user_id = auth.uid()));

create policy "Gamification badges readable" on public.gamification_badges
  for select
  using (true);

create policy "Admins manage badges" on public.gamification_badges
  for all
  using ((select is_admin from public.profiles where user_id = auth.uid()))
  with check ((select is_admin from public.profiles where user_id = auth.uid()));

create policy "Owners read their badge progress" on public.profile_badges
  for select
  using (
    auth.uid() = (select user_id from public.profiles where id = profile_id)
    or (select is_admin from public.profiles where user_id = auth.uid())
  );

create policy "Service role upserts badge progress" on public.profile_badges
  for insert
  with check (auth.role() = 'service_role');

create policy "Service role updates badge progress" on public.profile_badges
  for update
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create policy "Challenges readable" on public.gamification_challenges
  for select
  using (true);

create policy "Admins manage challenges" on public.gamification_challenges
  for all
  using ((select is_admin from public.profiles where user_id = auth.uid()))
  with check ((select is_admin from public.profiles where user_id = auth.uid()));

create policy "Owners view their challenge progress" on public.profile_challenge_progress
  for select
  using (
    auth.uid() = (select user_id from public.profiles where id = profile_id)
    or (select is_admin from public.profiles where user_id = auth.uid())
  );

create policy "Service role manages challenge progress" on public.profile_challenge_progress
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');

create policy "Leaderboards public read" on public.leaderboard_snapshots
  for select using (true);

create policy "Admins manage leaderboards" on public.leaderboard_snapshots
  for all using ((select is_admin from public.profiles where user_id = auth.uid()))
  with check ((select is_admin from public.profiles where user_id = auth.uid()));

create policy "Admins view audit log" on public.gamification_audit
  for select using ((select is_admin from public.profiles where user_id = auth.uid()));

create policy "Admins insert audit log" on public.gamification_audit
  for insert with check ((select is_admin from public.profiles where user_id = auth.uid()) or auth.role() = 'service_role');

create policy "Admins manage audit log" on public.gamification_audit
  for all using ((select is_admin from public.profiles where user_id = auth.uid()))
  with check ((select is_admin from public.profiles where user_id = auth.uid()));

-- Seed data
insert into public.gamification_levels(level, min_xp, perks) values
  (1, 0, jsonb_build_object('label', 'Curious Reader')),
  (2, 150, jsonb_build_object('label', 'Comment Starter', 'perks', array['profile flair'])),
  (3, 400, jsonb_build_object('label', 'Community Regular', 'perks', array['priority feedback'])),
  (4, 800, jsonb_build_object('label', 'Syntax Storyteller', 'perks', array['beta invites'])),
  (5, 1300, jsonb_build_object('label', 'Syntax Sage', 'perks', array['event host access']))
on conflict (level) do update set min_xp = excluded.min_xp, perks = excluded.perks;

insert into public.gamification_badges(slug, name, description, category, rarity, requirements, is_time_limited)
values
  ('first-comment', 'First Cheers', 'Left your first comment on Syntax & Sips.', 'achievement', 'common', jsonb_build_object('type', 'total_actions', 'actionType', 'comment.create', 'threshold', 1), false),
  ('ten-comments', 'Conversation Catalyst', 'Shared ten approved comments.', 'milestone', 'uncommon', jsonb_build_object('type', 'total_actions', 'actionType', 'comment.create', 'threshold', 10), false),
  ('onboarding-complete', 'Trailblazer', 'Completed the onboarding journey.', 'achievement', 'common', jsonb_build_object('type', 'event', 'eventKey', 'onboarding.complete'), false),
  ('thirty-day-streak', 'Consistency Icon', 'Logged activity for 30 days in a row.', 'milestone', 'rare', jsonb_build_object('type', 'streak', 'days', 30), false)
on conflict (slug) do update set name = excluded.name, description = excluded.description, category = excluded.category, rarity = excluded.rarity, requirements = excluded.requirements;

insert into public.gamification_challenges(slug, title, cadence, requirements, reward_points, starts_at, ends_at)
values
  (
    'daily-comment-duo',
    'Daily Comment Duo',
    'daily',
    jsonb_build_object('type', 'total_actions', 'actionType', 'comment.create', 'threshold', 2),
    40,
    date_trunc('day', now()),
    date_trunc('day', now()) + interval '1 day'
  ),
  (
    'weekly-write-sprint',
    'Weekly Write Sprint',
    'weekly',
    jsonb_build_object('type', 'total_actions', 'actionType', 'post.publish', 'threshold', 1),
    250,
    date_trunc('week', now()),
    date_trunc('week', now()) + interval '7 days'
  )
on conflict (slug) do update set title = excluded.title, cadence = excluded.cadence, requirements = excluded.requirements, reward_points = excluded.reward_points, starts_at = excluded.starts_at, ends_at = excluded.ends_at;

-- Materialized view placeholder for analytics (refresh handled via cron)
create materialized view if not exists public.mv_gamification_leaderboard as
select
  gp.profile_id,
  gp.xp_total,
  gp.level,
  gp.current_streak,
  gp.longest_streak,
  gp.updated_at as refreshed_at
from public.gamification_profiles gp;

create index if not exists mv_gamification_leaderboard_idx on public.mv_gamification_leaderboard(xp_total desc);

-- Down migration
-- (Handled manually when rolling back, the platform runbook includes drop statements.)
