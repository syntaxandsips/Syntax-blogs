-- Enable uuid generation
create extension if not exists "pgcrypto";

-- Enum for post status
create type public.post_status as enum ('draft', 'scheduled', 'published');

-- =================================================================
-- 1. USER PROFILES TABLE (Improved from 'authors')
-- =================================================================
-- A 'profiles' table is a common Supabase pattern to store public user data.
-- It links 1-to-1 with auth.users and can include roles like 'is_admin'.
create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  display_name text not null,
  avatar_url text,
  is_admin boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Categories table
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  created_at timestamptz not null default now()
);

-- Posts table
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  excerpt text,
  content text not null,
  accent_color text,
  status public.post_status not null default 'draft',
  views integer not null default 0,
  seo_title text,
  seo_description text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  published_at timestamptz,
  scheduled_for timestamptz,
  -- Author now references the 'profiles' table
  author_id uuid references public.profiles(id) on delete set null,
  category_id uuid references public.categories(id) on delete set null
);

create index if not exists posts_status_idx on public.posts(status);
create index if not exists posts_published_at_idx on public.posts(published_at desc nulls last);
create index if not exists posts_category_idx on public.posts(category_id);
create index if not exists posts_author_idx on public.posts(author_id); -- Added index for author lookups

-- Tags tables
create table if not exists public.tags (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.post_tags (
  post_id uuid not null references public.posts(id) on delete cascade,
  tag_id uuid not null references public.tags(id) on delete cascade,
  primary key (post_id, tag_id)
);

-- =================================================================
-- 2. HELPER FUNCTIONS AND TRIGGERS
-- =================================================================
-- Helper function for updating updated_at
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$ begin
  new.updated_at = now();
  return new;
end;
 $$;

create trigger profiles_set_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger posts_set_updated_at
before update on public.posts
for each row execute function public.set_updated_at();

-- Function to increment view counters safely.
-- SECURITY DEFINER allows unauthenticated users to call this to increment views.
create or replace function public.increment_post_views(post_slug text)
returns integer -- Return only the view count for better security
language sql
security definer
set search_path = public
as $$   update public.posts
     set views = coalesce(views, 0) + 1
   where slug = post_slug
   returning views;
 $$;

-- =================================================================
-- 3. ROW LEVEL SECURITY (RLS) - THE CRITICAL FIXES
-- =================================================================
-- Enable Row Level Security
alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.tags enable row level security;
alter table public.post_tags enable row level security;
alter table public.posts enable row level security;

-- Policies for PROFILES table
create policy "Profiles are viewable by everyone."
  on public.profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on public.profiles for insert
  with check ( auth.uid() = user_id );

create policy "Users can update own profile. Admins can update any profile."
  on public.profiles for update
  using ( auth.uid() = user_id OR (select is_admin from public.profiles where user_id = auth.uid()) );

-- Policies for POSTS table
create policy "Published posts are viewable by everyone."
  on public.posts for select
  using ( status = 'published' );

create policy "Authors can view their own posts."
  on public.posts for select
  using ( auth.uid() = (select user_id from public.profiles where id = author_id) );

create policy "Authors can insert their own posts."
  on public.posts for insert
  with check ( auth.uid() = (select user_id from public.profiles where id = author_id) );

create policy "Authors can update their own posts. Admins can update any post."
  on public.posts for update
  using ( auth.uid() = (select user_id from public.profiles where id = author_id) OR (select is_admin from public.profiles where user_id = auth.uid()) );

create policy "Authors can delete their own posts. Admins can delete any post."
  on public.posts for delete
  using ( auth.uid() = (select user_id from public.profiles where id = author_id) OR (select is_admin from public.profiles where user_id = auth.uid()) );

-- Policies for CATEGORIES table
create policy "Public can read categories"
  on public.categories
  for select
  using (true);

create policy "Admins can manage categories"
  on public.categories
  for all
  using ( (select is_admin from public.profiles where user_id = auth.uid()) )
  with check ( (select is_admin from public.profiles where user_id = auth.uid()) );

-- Policies for TAGS table
create policy "Public can read tags"
  on public.tags
  for select
  using (true);

create policy "Admins can manage tags"
  on public.tags
  for all
  using ( (select is_admin from public.profiles where user_id = auth.uid()) )
  with check ( (select is_admin from public.profiles where user_id = auth.uid()) );

-- Policies for POST_TAGS join table
create policy "Admins can manage post tags"
  on public.post_tags
  for all
  using ( (select is_admin from public.profiles where user_id = auth.uid()) )
  with check ( (select is_admin from public.profiles where user_id = auth.uid()) );


-- =================================================================
-- 4. SEED DATA
-- =================================================================
-- Seed starter categories
insert into public.categories (slug, name)
values
  ('machine-learning', 'Machine Learning'),
  ('reinforcement-learning', 'Reinforcement Learning'),
  ('data-science', 'Data Science'),
  ('quantum-computing', 'Quantum Computing')
on conflict (slug) do nothing;

-- Seed an admin profile.
-- IMPORTANT: Replace 'YOUR_ADMIN_USER_ID_HERE' with the actual UUID from auth.users
-- for the user you want to be an admin.
-- You can find this in the Supabase Dashboard under Authentication > Users.
-- insert into public.profiles (user_id, display_name, is_admin)
-- values ('YOUR_ADMIN_USER_ID_HERE', 'Admin User', true)
-- on conflict (user_id) do nothing;
