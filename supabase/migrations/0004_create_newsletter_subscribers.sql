-- Create table for newsletter subscribers
create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),
  email text not null,
  source text,
  subscribed_at timestamptz not null default now(),
  confirmed_at timestamptz,
  unsubscribed_at timestamptz,
  metadata jsonb default '{}'::jsonb
);

create unique index if not exists newsletter_subscribers_email_idx
  on public.newsletter_subscribers (lower(email));

-- Enable row level security to protect subscriber data
alter table public.newsletter_subscribers enable row level security;

-- Allow only service role (edge functions) to manage subscribers by default.
create policy "Allow read for admins" on public.newsletter_subscribers
  for select
  using (
    auth.role() = 'service_role'
    or exists (
      select 1 from public.profiles
      where profiles.user_id = auth.uid()
        and profiles.is_admin = true
    )
  );

create policy "Service role manages subscribers" on public.newsletter_subscribers
  for all
  using (auth.role() = 'service_role')
  with check (auth.role() = 'service_role');
