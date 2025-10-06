-- Ensure pgcrypto extension is available for uuid generation
create extension if not exists "pgcrypto";

-- Ensure the post_status enum exists with the expected values
do $$
begin
  if not exists (
    select 1
    from pg_type t
    where t.typname = 'post_status'
      and t.typnamespace = 'public'::regnamespace
  ) then
    create type public.post_status as enum ('draft', 'scheduled', 'published');
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1 from pg_enum e
    join pg_type t on t.oid = e.enumtypid
    where t.typname = 'post_status'
      and t.typnamespace = 'public'::regnamespace
      and e.enumlabel = 'draft'
  ) then
    alter type public.post_status add value 'draft';
  end if;
  if not exists (
    select 1 from pg_enum e
    join pg_type t on t.oid = e.enumtypid
    where t.typname = 'post_status'
      and t.typnamespace = 'public'::regnamespace
      and e.enumlabel = 'scheduled'
  ) then
    alter type public.post_status add value 'scheduled';
  end if;
  if not exists (
    select 1 from pg_enum e
    join pg_type t on t.oid = e.enumtypid
    where t.typname = 'post_status'
      and t.typnamespace = 'public'::regnamespace
      and e.enumlabel = 'published'
  ) then
    alter type public.post_status add value 'published';
  end if;
end;
$$;

-- =========================================================================
-- Profiles hardening
-- =========================================================================
alter table if exists public.profiles
  add column if not exists user_id uuid,
  add column if not exists display_name text,
  add column if not exists avatar_url text,
  add column if not exists is_admin boolean not null default false,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now();

alter table if exists public.profiles
  alter column id set default gen_random_uuid();

do $$
begin
  if not exists (
    select 1
    from pg_constraint c
    where c.conname = 'profiles_pkey'
      and c.conrelid = 'public.profiles'::regclass
  ) then
    alter table public.profiles
      add constraint profiles_pkey primary key (id);
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint c
    where c.conname = 'profiles_user_id_key'
      and c.conrelid = 'public.profiles'::regclass
  ) then
    alter table public.profiles
      add constraint profiles_user_id_key unique (user_id);
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint c
    where c.conname = 'profiles_user_id_fkey'
      and c.conrelid = 'public.profiles'::regclass
  ) then
    alter table public.profiles
      add constraint profiles_user_id_fkey
        foreign key (user_id) references auth.users (id) on delete cascade;
  end if;
end;
$$;

-- =========================================================================
-- Categories hardening
-- =========================================================================
alter table if exists public.categories
  add column if not exists slug text,
  add column if not exists name text,
  add column if not exists created_at timestamptz not null default now();

alter table if exists public.categories
  alter column id set default gen_random_uuid();

create unique index if not exists categories_slug_key
  on public.categories (slug);

-- =========================================================================
-- Posts hardening
-- =========================================================================
alter table if exists public.posts
  add column if not exists title text,
  add column if not exists slug text,
  add column if not exists excerpt text,
  add column if not exists content text,
  add column if not exists accent_color text,
  add column if not exists status public.post_status not null default 'draft',
  add column if not exists views integer not null default 0,
  add column if not exists seo_title text,
  add column if not exists seo_description text,
  add column if not exists created_at timestamptz not null default now(),
  add column if not exists updated_at timestamptz not null default now(),
  add column if not exists published_at timestamptz,
  add column if not exists scheduled_for timestamptz,
  add column if not exists author_id uuid,
  add column if not exists category_id uuid;

alter table if exists public.posts
  alter column id set default gen_random_uuid();

create unique index if not exists posts_slug_key on public.posts (slug);
create index if not exists posts_status_idx on public.posts (status);
create index if not exists posts_published_at_idx on public.posts (published_at desc nulls last);
create index if not exists posts_category_idx on public.posts (category_id);
create index if not exists posts_author_idx on public.posts (author_id);

do $$
begin
  if not exists (
    select 1
    from pg_constraint c
    where c.conname = 'posts_author_id_fkey'
      and c.conrelid = 'public.posts'::regclass
  ) then
    alter table public.posts
      add constraint posts_author_id_fkey
        foreign key (author_id) references public.profiles (id) on delete set null;
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint c
    where c.conname = 'posts_category_id_fkey'
      and c.conrelid = 'public.posts'::regclass
  ) then
    alter table public.posts
      add constraint posts_category_id_fkey
        foreign key (category_id) references public.categories (id) on delete set null;
  end if;
end;
$$;

-- =========================================================================
-- Tags hardening
-- =========================================================================
alter table if exists public.tags
  add column if not exists slug text,
  add column if not exists name text,
  add column if not exists created_at timestamptz not null default now();

alter table if exists public.tags
  alter column id set default gen_random_uuid();

create unique index if not exists tags_slug_key on public.tags (slug);

-- =========================================================================
-- Post tags hardening
-- =========================================================================
create table if not exists public.post_tags (
  post_id uuid not null references public.posts (id) on delete cascade,
  tag_id uuid not null references public.tags (id) on delete cascade,
  primary key (post_id, tag_id)
);

-- =========================================================================
-- Helper triggers
-- =========================================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
begin
  if not exists (
    select 1
    from pg_trigger
    where tgname = 'profiles_set_updated_at'
      and tgrelid = 'public.profiles'::regclass
  ) then
    create trigger profiles_set_updated_at
      before update on public.profiles
      for each row execute function public.set_updated_at();
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1
    from pg_trigger
    where tgname = 'posts_set_updated_at'
      and tgrelid = 'public.posts'::regclass
  ) then
    create trigger posts_set_updated_at
      before update on public.posts
      for each row execute function public.set_updated_at();
  end if;
end;
$$;

-- =========================================================================
-- Policies (idempotent creation)
-- =========================================================================
alter table if exists public.profiles enable row level security;
alter table if exists public.categories enable row level security;
alter table if exists public.tags enable row level security;
alter table if exists public.post_tags enable row level security;
alter table if exists public.posts enable row level security;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'profiles'
      and policyname = 'Profiles are viewable by everyone.'
  ) then
    create policy "Profiles are viewable by everyone."
      on public.profiles for select
      using (true);
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'profiles'
      and policyname = 'Users can insert their own profile.'
  ) then
    create policy "Users can insert their own profile."
      on public.profiles for insert
      with check (auth.uid() = user_id);
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'profiles'
      and policyname = 'Users can update own profile. Admins can update any profile.'
  ) then
    create policy "Users can update own profile. Admins can update any profile."
      on public.profiles for update
      using (
        auth.uid() = user_id
        or (select is_admin from public.profiles where user_id = auth.uid())
      );
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'posts'
      and policyname = 'Published posts are viewable by everyone.'
  ) then
    create policy "Published posts are viewable by everyone."
      on public.posts for select
      using (status = 'published');
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'posts'
      and policyname = 'Authors can view their own posts.'
  ) then
    create policy "Authors can view their own posts."
      on public.posts for select
      using (
        auth.uid() = (
          select user_id from public.profiles where id = author_id
        )
      );
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'posts'
      and policyname = 'Authors can insert their own posts.'
  ) then
    create policy "Authors can insert their own posts."
      on public.posts for insert
      with check (
        auth.uid() = (
          select user_id from public.profiles where id = author_id
        )
      );
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'posts'
      and policyname = 'Authors can update their own posts. Admins can update any post.'
  ) then
    create policy "Authors can update their own posts. Admins can update any post."
      on public.posts for update
      using (
        auth.uid() = (
          select user_id from public.profiles where id = author_id
        )
        or (
          select is_admin from public.profiles where user_id = auth.uid()
        )
      );
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'posts'
      and policyname = 'Authors can delete their own posts. Admins can delete any post.'
  ) then
    create policy "Authors can delete their own posts. Admins can delete any post."
      on public.posts for delete
      using (
        auth.uid() = (
          select user_id from public.profiles where id = author_id
        )
        or (
          select is_admin from public.profiles where user_id = auth.uid()
        )
      );
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'categories'
      and policyname = 'Public can read categories'
  ) then
    create policy "Public can read categories"
      on public.categories for select
      using (true);
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'categories'
      and policyname = 'Admins can manage categories'
  ) then
    create policy "Admins can manage categories"
      on public.categories for all
      using ((select is_admin from public.profiles where user_id = auth.uid()))
      with check ((select is_admin from public.profiles where user_id = auth.uid()));
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'tags'
      and policyname = 'Public can read tags'
  ) then
    create policy "Public can read tags"
      on public.tags for select
      using (true);
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'tags'
      and policyname = 'Admins can manage tags'
  ) then
    create policy "Admins can manage tags"
      on public.tags for all
      using ((select is_admin from public.profiles where user_id = auth.uid()))
      with check ((select is_admin from public.profiles where user_id = auth.uid()));
  end if;
end;
$$;

do $$
begin
  if not exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'post_tags'
      and policyname = 'Admins can manage post tags'
  ) then
    create policy "Admins can manage post tags"
      on public.post_tags for all
      using ((select is_admin from public.profiles where user_id = auth.uid()))
      with check ((select is_admin from public.profiles where user_id = auth.uid()));
  end if;
end;
$$;

-- =========================================================================
-- Seed data safeguards
-- =========================================================================
insert into public.categories (slug, name)
values
  ('machine-learning', 'Machine Learning'),
  ('reinforcement-learning', 'Reinforcement Learning'),
  ('data-science', 'Data Science'),
  ('quantum-computing', 'Quantum Computing')
on conflict (slug) do nothing;
