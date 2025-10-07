-- Create site settings storage table
create table if not exists public.site_settings (
  id uuid primary key default gen_random_uuid(),
  settings_key text not null unique,
  value jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create index if not exists site_settings_key_idx on public.site_settings(settings_key);

alter table if exists public.site_settings
  alter column id set default gen_random_uuid();

-- trigger to maintain updated_at
create or replace function public.site_settings_set_updated_at()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger site_settings_touch_updated_at
  before update on public.site_settings
  for each row
  execute function public.site_settings_set_updated_at();

-- enable row level security
alter table public.site_settings enable row level security;

-- policy: admins can manage settings
create policy if not exists "Admins manage site settings"
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

-- policy: service role can access
create policy if not exists "Service role access to site settings"
  on public.site_settings
  for all
  to service_role
  using (true)
  with check (true);
