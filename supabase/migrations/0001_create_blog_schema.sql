-- Enable uuid generation
create extension if not exists "pgcrypto";

-- Enum for post status
create type public.post_status as enum ('draft', 'scheduled', 'published');

-- Categories table
create table if not exists public.categories (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  created_at timestamptz not null default now()
);

-- Authors table maps auth.users to a display profile
create table if not exists public.authors (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  display_name text not null,
  avatar_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index if not exists authors_user_id_key on public.authors(user_id);

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
  author_id uuid references public.authors(id) on delete set null,
  category_id uuid references public.categories(id) on delete set null
);

create index if not exists posts_status_idx on public.posts(status);
create index if not exists posts_published_at_idx on public.posts(published_at desc nulls last);
create index if not exists posts_category_idx on public.posts(category_id);

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

-- Helper function for updating updated_at
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger posts_set_updated_at
before update on public.posts
for each row execute function public.set_updated_at();

create trigger authors_set_updated_at
before update on public.authors
for each row execute function public.set_updated_at();

-- Function to increment view counters safely
create or replace function public.increment_post_views(post_slug text)
returns public.posts
language sql
security definer
set search_path = public
as $$
  update public.posts
     set views = coalesce(views, 0) + 1,
         updated_at = now()
   where slug = post_slug
   returning *;
$$;

-- Enable Row Level Security
alter table public.categories enable row level security;
alter table public.tags enable row level security;
alter table public.post_tags enable row level security;
alter table public.posts enable row level security;
alter table public.authors enable row level security;

-- Policies
create policy if not exists "Public can read published posts"
  on public.posts
  for select
  using (status = 'published');

create policy if not exists "Admins can manage posts"
  on public.posts
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy if not exists "Public can read categories"
  on public.categories
  for select
  using (true);

create policy if not exists "Admins manage categories"
  on public.categories
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy if not exists "Public can read tags"
  on public.tags
  for select
  using (true);

create policy if not exists "Admins manage tags"
  on public.tags
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy if not exists "Admins manage post tags"
  on public.post_tags
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

create policy if not exists "Admins manage author profiles"
  on public.authors
  for all
  using (auth.role() = 'authenticated')
  with check (auth.role() = 'authenticated');

-- Seed starter categories
insert into public.categories (slug, name)
values
  ('machine-learning', 'Machine Learning'),
  ('reinforcement-learning', 'Reinforcement Learning'),
  ('data-science', 'Data Science'),
  ('quantum-computing', 'Quantum Computing')
on conflict (slug) do nothing;
