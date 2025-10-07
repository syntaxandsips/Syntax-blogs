-- Enhance newsletter subscribers with double opt-in support
alter table public.newsletter_subscribers
  add column if not exists confirmation_token text,
  add column if not exists confirmation_token_expires_at timestamptz,
  add column if not exists confirmed boolean not null default false;

-- Backfill the confirmed flag based on historic data
update public.newsletter_subscribers
set confirmed = true
where confirmed_at is not null
  and confirmed = false;

-- Ensure confirmation tokens are easy to query and expire automatically if desired
create index if not exists newsletter_subscribers_confirmation_token_idx
  on public.newsletter_subscribers (confirmation_token);
