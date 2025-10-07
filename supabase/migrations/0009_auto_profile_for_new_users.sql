-- Automatically provision a profile row whenever a new auth user is created
create or replace function public.create_profile_for_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  default_display_name text;
begin
  -- Prefer a custom display name supplied via metadata, then fall back to email prefix
  default_display_name := coalesce(
    nullif(new.raw_user_meta_data->>'display_name', ''),
    nullif(split_part(coalesce(new.email, ''), '@', 1), ''),
    'New User'
  );

  insert into public.profiles (user_id, display_name, is_admin)
  values (new.id, default_display_name, false)
  on conflict (user_id) do update
    set display_name = excluded.display_name;

  return new;
end;
$$;

drop trigger if exists create_profile_for_new_user on auth.users;

create trigger create_profile_for_new_user
  after insert on auth.users
  for each row
  execute function public.create_profile_for_new_user();

-- Backfill profiles for any existing auth users that do not yet have a profile row
insert into public.profiles (user_id, display_name, is_admin)
select
  u.id,
  coalesce(
    nullif(u.raw_user_meta_data->>'display_name', ''),
    nullif(split_part(coalesce(u.email, ''), '@', 1), ''),
    'New User'
  ),
  false
from auth.users u
left join public.profiles p on p.user_id = u.id
where p.id is null;
