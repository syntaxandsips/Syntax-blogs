-- Manage profile hierarchy with dedicated roles and membership mappings
create extension if not exists "pgcrypto";

-- =====================================================================
-- Roles table ensures clear privilege hierarchy
-- =====================================================================
create table if not exists public.roles (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  description text,
  priority integer not null default 100,
  created_at timestamptz not null default now()
);

alter table if exists public.roles
  add column if not exists slug text,
  add column if not exists name text,
  add column if not exists description text,
  add column if not exists priority integer not null default 100,
  add column if not exists created_at timestamptz not null default now();

alter table if exists public.roles
  alter column id set default gen_random_uuid();

create unique index if not exists roles_slug_key on public.roles(slug);

-- =====================================================================
-- Junction table between profiles and roles
-- =====================================================================
create table if not exists public.profile_roles (
  profile_id uuid not null references public.profiles(id) on delete cascade,
  role_id uuid not null references public.roles(id) on delete cascade,
  assigned_at timestamptz not null default now(),
  primary key (profile_id, role_id)
);

alter table if exists public.profile_roles
  add column if not exists profile_id uuid,
  add column if not exists role_id uuid,
  add column if not exists assigned_at timestamptz not null default now();

alter table if exists public.profile_roles
  alter column assigned_at set default now();

create index if not exists profile_roles_role_idx on public.profile_roles(role_id);
create index if not exists profile_roles_assigned_idx on public.profile_roles(assigned_at);

-- Ensure constraints exist even if table predated this migration
DO $$
BEGIN
  IF not exists (
    select 1
    from pg_constraint
    where conname = 'profile_roles_pkey'
      and conrelid = 'public.profile_roles'::regclass
  ) THEN
    alter table public.profile_roles
      add constraint profile_roles_pkey primary key (profile_id, role_id);
  END IF;
END;
$$;

DO $$
BEGIN
  IF not exists (
    select 1
    from pg_constraint
    where conname = 'profile_roles_profile_id_fkey'
      and conrelid = 'public.profile_roles'::regclass
  ) THEN
    alter table public.profile_roles
      add constraint profile_roles_profile_id_fkey foreign key (profile_id) references public.profiles(id) on delete cascade;
  END IF;
END;
$$;

DO $$
BEGIN
  IF not exists (
    select 1
    from pg_constraint
    where conname = 'profile_roles_role_id_fkey'
      and conrelid = 'public.profile_roles'::regclass
  ) THEN
    alter table public.profile_roles
      add constraint profile_roles_role_id_fkey foreign key (role_id) references public.roles(id) on delete cascade;
  END IF;
END;
$$;

-- =====================================================================
-- Primary role pointer on profiles
-- =====================================================================
alter table if exists public.profiles
  add column if not exists primary_role_id uuid;

DO $$
BEGIN
  IF not exists (
    select 1
    from pg_constraint
    where conname = 'profiles_primary_role_id_fkey'
      and conrelid = 'public.profiles'::regclass
  ) THEN
    alter table public.profiles
      add constraint profiles_primary_role_id_fkey foreign key (primary_role_id) references public.roles(id) on delete set null;
  END IF;
END;
$$;

-- =====================================================================
-- Seed canonical roles with deterministic ordering
-- =====================================================================
insert into public.roles (slug, name, description, priority)
values
  ('admin', 'Administrator', 'Full control over content, users, and configuration.', 10),
  ('editor', 'Editor', 'Manage and publish any post content.', 20),
  ('author', 'Author', 'Create and edit personal drafts.', 30),
  ('member', 'Member', 'Default reader profile with basic permissions.', 40)
on conflict (slug) do update
set
  name = excluded.name,
  description = excluded.description,
  priority = excluded.priority;

-- =====================================================================
-- Helper functions to inspect role membership
-- =====================================================================
create or replace function public.user_has_any_role(role_slugs text[])
returns boolean
language plpgsql
security definer
set search_path = public
as $$
declare
  has_role boolean;
begin
  if role_slugs is null or array_length(role_slugs, 1) = 0 then
    return false;
  end if;

  select exists(
    select 1
    from public.profiles p
    left join public.profile_roles pr on pr.profile_id = p.id
    left join public.roles r on r.id = pr.role_id
    where p.user_id = auth.uid()
      and (
        r.slug = any(role_slugs)
        or (
          p.is_admin = true
          and array_position(role_slugs, 'admin') is not null
        )
      )
  )
  into has_role;

  return coalesce(has_role, false);
end;
$$;

create or replace function public.user_has_role(role_slug text)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  if role_slug is null then
    return false;
  end if;
  return public.user_has_any_role(array[role_slug]);
end;
$$;

-- =====================================================================
-- Triggers to maintain primary role and role assignments
-- =====================================================================
create or replace function public.assign_primary_role()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  admin_role uuid;
  member_role uuid;
begin
  if new.primary_role_id is null then
    if new.is_admin then
      select id into admin_role from public.roles where slug = 'admin';
      if admin_role is not null then
        new.primary_role_id := admin_role;
      end if;
    end if;

    if new.primary_role_id is null then
      select id into member_role from public.roles where slug = 'member';
      if member_role is not null then
        new.primary_role_id := member_role;
      end if;
    end if;
  end if;

  return new;
end;
$$;

create or replace function public.ensure_profile_role_membership()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  admin_role uuid;
  member_role uuid;
begin
  select id into admin_role from public.roles where slug = 'admin';
  select id into member_role from public.roles where slug = 'member';

  if tg_op = 'INSERT' then
    if admin_role is not null and new.is_admin then
      insert into public.profile_roles(profile_id, role_id)
      values (new.id, admin_role)
      on conflict (profile_id, role_id) do nothing;
    end if;

    if member_role is not null then
      insert into public.profile_roles(profile_id, role_id)
      values (new.id, member_role)
      on conflict (profile_id, role_id) do nothing;
    end if;
  elsif tg_op = 'UPDATE' then
    if admin_role is not null then
      if new.is_admin then
        insert into public.profile_roles(profile_id, role_id)
        values (new.id, admin_role)
        on conflict (profile_id, role_id) do nothing;
      else
        delete from public.profile_roles
        where profile_id = new.id
          and role_id = admin_role;
      end if;
    end if;

    if member_role is not null then
      insert into public.profile_roles(profile_id, role_id)
      values (new.id, member_role)
      on conflict (profile_id, role_id) do nothing;
    end if;
  end if;

  return new;
end;
$$;

create or replace function public.sync_admin_flag_from_roles()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  admin_role uuid;
  member_role uuid;
  effective_admin boolean;
begin
  select id into admin_role from public.roles where slug = 'admin';
  select id into member_role from public.roles where slug = 'member';

  if admin_role is null then
    return null;
  end if;

  if tg_op = 'INSERT' then
    if new.role_id = admin_role then
      update public.profiles
      set is_admin = true,
          primary_role_id = coalesce(primary_role_id, admin_role)
      where id = new.profile_id;
    end if;
  elsif tg_op = 'DELETE' then
    if old.role_id = admin_role then
      select exists(
        select 1
        from public.profile_roles pr
        where pr.profile_id = old.profile_id
          and pr.role_id = admin_role
      ) into effective_admin;

      update public.profiles
      set is_admin = coalesce(effective_admin, false),
          primary_role_id = case
            when coalesce(effective_admin, false) then primary_role_id
            when member_role is not null then member_role
            else primary_role_id
          end
      where id = old.profile_id;
    end if;
  end if;

  return null;
end;
$$;

-- Drop old triggers before recreating to avoid duplicates
DO $$
BEGIN
  IF exists (
    select 1 from pg_trigger
    where tgname = 'profiles_assign_primary_role'
      and tgrelid = 'public.profiles'::regclass
  ) THEN
    drop trigger profiles_assign_primary_role on public.profiles;
  END IF;
END;
$$;

create trigger profiles_assign_primary_role
  before insert or update on public.profiles
  for each row execute function public.assign_primary_role();

DO $$
BEGIN
  IF exists (
    select 1 from pg_trigger
    where tgname = 'profiles_ensure_role_membership'
      and tgrelid = 'public.profiles'::regclass
  ) THEN
    drop trigger profiles_ensure_role_membership on public.profiles;
  END IF;
END;
$$;

create trigger profiles_ensure_role_membership
  after insert or update on public.profiles
  for each row execute function public.ensure_profile_role_membership();

DO $$
BEGIN
  IF exists (
    select 1 from pg_trigger
    where tgname = 'profile_roles_sync_admin_flag'
      and tgrelid = 'public.profile_roles'::regclass
  ) THEN
    drop trigger profile_roles_sync_admin_flag on public.profile_roles;
  END IF;
END;
$$;

create trigger profile_roles_sync_admin_flag
  after insert or delete on public.profile_roles
  for each row execute function public.sync_admin_flag_from_roles();

-- =====================================================================
-- Data backfill to guarantee consistency for existing profiles
-- =====================================================================
DO $$
DECLARE
  admin_role uuid;
  member_role uuid;
BEGIN
  select id into admin_role from public.roles where slug = 'admin';
  select id into member_role from public.roles where slug = 'member';

  IF member_role IS NOT NULL THEN
    update public.profiles
    set primary_role_id = coalesce(primary_role_id, member_role)
    where primary_role_id is null;

    insert into public.profile_roles(profile_id, role_id)
    select p.id, member_role
    from public.profiles p
    where not exists (
      select 1
      from public.profile_roles pr
      where pr.profile_id = p.id
        and pr.role_id = member_role
    );
  END IF;

  IF admin_role IS NOT NULL THEN
    insert into public.profile_roles(profile_id, role_id)
    select p.id, admin_role
    from public.profiles p
    where p.is_admin = true
      and not exists (
        select 1
        from public.profile_roles pr
        where pr.profile_id = p.id
          and pr.role_id = admin_role
      );

    update public.profiles
    set primary_role_id = admin_role
    where is_admin = true
      and primary_role_id <> admin_role;
  END IF;
END;
$$;

DO $$
DECLARE
  admin_role uuid;
BEGIN
  select id into admin_role from public.roles where slug = 'admin';

  IF admin_role IS NOT NULL THEN
    update public.profiles p
    set is_admin = exists (
      select 1
      from public.profile_roles pr
      where pr.profile_id = p.id
        and pr.role_id = admin_role
    );
  END IF;
END;
$$;

-- =====================================================================
-- Row level security for new tables
-- =====================================================================
alter table if exists public.roles enable row level security;
alter table if exists public.profile_roles enable row level security;

DO $$
BEGIN
  IF exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'roles'
      and policyname = 'Authenticated users can read roles'
  ) THEN
    drop policy "Authenticated users can read roles" on public.roles;
  END IF;
END;
$$;

create policy "Authenticated users can read roles"
  on public.roles for select
  using (auth.uid() is not null);

DO $$
BEGIN
  IF exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'roles'
      and policyname = 'Admins manage roles'
  ) THEN
    drop policy "Admins manage roles" on public.roles;
  END IF;
END;
$$;

create policy "Admins manage roles"
  on public.roles for all
  using (public.user_has_role('admin'))
  with check (public.user_has_role('admin'));

DO $$
BEGIN
  IF exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'profile_roles'
      and policyname = 'Users can read their role assignments'
  ) THEN
    drop policy "Users can read their role assignments" on public.profile_roles;
  END IF;
END;
$$;

create policy "Users can read their role assignments"
  on public.profile_roles for select
  using (
    public.user_has_role('admin')
    or auth.uid() = (
      select user_id from public.profiles where id = profile_id
    )
  );

DO $$
BEGIN
  IF exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'profile_roles'
      and policyname = 'Admins manage role assignments'
  ) THEN
    drop policy "Admins manage role assignments" on public.profile_roles;
  END IF;
END;
$$;

create policy "Admins manage role assignments"
  on public.profile_roles for all
  using (public.user_has_role('admin'))
  with check (public.user_has_role('admin'));

-- =====================================================================
-- Refresh existing policies to leverage helper role checks
-- =====================================================================
DO $$
BEGIN
  IF exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'profiles'
      and policyname = 'Users can update own profile. Admins can update any profile.'
  ) THEN
    drop policy "Users can update own profile. Admins can update any profile." on public.profiles;
  END IF;
END;
$$;

create policy "Users can update own profile. Admins can update any profile."
  on public.profiles for update
  using (
    auth.uid() = user_id
    or public.user_has_role('admin')
  );

DO $$
BEGIN
  IF exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'posts'
      and policyname = 'Authors can update their own posts. Admins can update any post.'
  ) THEN
    drop policy "Authors can update their own posts. Admins can update any post." on public.posts;
  END IF;
END;
$$;

create policy "Authors can update their own posts. Admins can update any post."
  on public.posts for update
  using (
    auth.uid() = (
      select user_id from public.profiles where id = author_id
    )
    or public.user_has_any_role(array['admin', 'editor'])
  );

DO $$
BEGIN
  IF exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'posts'
      and policyname = 'Authors can delete their own posts. Admins can delete any post.'
  ) THEN
    drop policy "Authors can delete their own posts. Admins can delete any post." on public.posts;
  END IF;
END;
$$;

create policy "Authors can delete their own posts. Admins can delete any post."
  on public.posts for delete
  using (
    auth.uid() = (
      select user_id from public.profiles where id = author_id
    )
    or public.user_has_any_role(array['admin', 'editor'])
  );

DO $$
BEGIN
  IF exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'categories'
      and policyname = 'Admins can manage categories'
  ) THEN
    drop policy "Admins can manage categories" on public.categories;
  END IF;
END;
$$;

create policy "Admins can manage categories"
  on public.categories for all
  using (public.user_has_role('admin'))
  with check (public.user_has_role('admin'));

DO $$
BEGIN
  IF exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'tags'
      and policyname = 'Admins can manage tags'
  ) THEN
    drop policy "Admins can manage tags" on public.tags;
  END IF;
END;
$$;

create policy "Admins can manage tags"
  on public.tags for all
  using (public.user_has_role('admin'))
  with check (public.user_has_role('admin'));

DO $$
BEGIN
  IF exists (
    select 1 from pg_policies
    where schemaname = 'public'
      and tablename = 'post_tags'
      and policyname = 'Admins can manage post tags'
  ) THEN
    drop policy "Admins can manage post tags" on public.post_tags;
  END IF;
END;
$$;

create policy "Admins can manage post tags"
  on public.post_tags for all
  using (public.user_has_role('admin'))
  with check (public.user_has_role('admin'));
