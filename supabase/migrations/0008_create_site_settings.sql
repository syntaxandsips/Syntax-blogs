-- Create site settings storage table
create table if not exists public.site_settings (
  id uuid primary key default gen_random_uuid(),
  settings_key text not null unique,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create index if not exists site_settings_key_idx on public.site_settings(settings_key);

-- This line is redundant since the default is set in CREATE TABLE, but harmless.
alter table if exists public.site_settings
  alter column id set default gen_random_uuid();

-- Trigger to maintain updated_at
create or replace function public.site_settings_set_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$ begin
  new.updated_at := now();
  return new;
end;
 $$;

-- Drop trigger if it exists to allow re-running the script
drop trigger if exists site_settings_touch_updated_at on public.site_settings;

create trigger site_settings_touch_updated_at
  before update on public.site_settings
  for each row
  execute function public.site_settings_set_updated_at();

-- Enable row level security
alter table public.site_settings enable row level security;

-- Policy: Admins can manage settings
-- First, drop the policy if it exists to make the script idempotent
drop policy if exists "Admins manage site settings" on public.site_settings;

create policy "Admins manage site settings"
  on public.site_settings
  for all
  using (
    exists (
      select 1 from public.profiles
      where user_id = auth.uid()
        and is_admin = true
    )
  )
  with check (
    exists (
      select 1 from public.profiles
      where user_id = auth.uid()
        and is_admin = true
    )
  );

-- Policy: Service role can access
-- First, drop the policy if it exists
drop policy if exists "Service role access to site settings" on public.site_settings;

create policy "Service role access to site settings"
  on public.site_settings
  for all
  using ( auth.role() = 'service_role' )
  with check ( auth.role() = 'service_role' );
