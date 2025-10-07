-- Allow comments without a linked profile
alter table public.comments
  alter column author_profile_id drop not null;

-- Ensure deleting a profile doesn't cascade anonymous comments
alter table public.comments
  drop constraint if exists comments_author_profile_id_fkey;

alter table public.comments
  add constraint comments_author_profile_id_fkey
  foreign key (author_profile_id)
  references public.profiles (id)
  on delete set null;
