-- =================================================================
-- LIBRARY FEATURE SCHEMA
-- =================================================================
-- This migration creates tables for user library functionality:
-- - User-created lists
-- - List items
-- - Saved lists from other users
-- - Highlights
-- - Reading history
-- - Bookmarks (quick save)
-- =================================================================

-- Enable required extensions
create extension if not exists "pgcrypto";

-- =================================================================
-- 1. USER LISTS TABLE
-- =================================================================
create table if not exists public.user_lists (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  title text not null check (char_length(title) >= 1 and char_length(title) <= 200),
  description text check (char_length(description) <= 1000),
  slug text not null check (char_length(slug) >= 1 and char_length(slug) <= 200),
  is_public boolean not null default false,
  cover_image_url text,
  item_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint user_lists_profile_slug_unique unique(profile_id, slug)
);

create index user_lists_profile_id_idx on public.user_lists(profile_id);
create index user_lists_is_public_idx on public.user_lists(is_public) where is_public = true;
create index user_lists_created_at_idx on public.user_lists(created_at desc);

comment on table public.user_lists is 'User-created lists for organizing saved posts';
comment on column public.user_lists.item_count is 'Cached count of items in list, updated via trigger';

-- =================================================================
-- 2. LIST ITEMS TABLE
-- =================================================================
create table if not exists public.list_items (
  id uuid primary key default gen_random_uuid(),
  list_id uuid not null references public.user_lists(id) on delete cascade,
  post_id uuid not null references public.posts(id) on delete cascade,
  note text check (char_length(note) <= 500),
  position integer not null default 0,
  added_at timestamptz not null default now(),
  constraint list_items_unique unique(list_id, post_id)
);

create index list_items_list_id_idx on public.list_items(list_id);
create index list_items_post_id_idx on public.list_items(post_id);
create index list_items_position_idx on public.list_items(list_id, position);

comment on table public.list_items is 'Posts saved to user lists';
comment on column public.list_items.position is 'Order of item in list, 0-indexed';

-- =================================================================
-- 3. SAVED LISTS TABLE
-- =================================================================
create table if not exists public.saved_lists (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  list_id uuid not null references public.user_lists(id) on delete cascade,
  saved_at timestamptz not null default now(),
  constraint saved_lists_unique unique(profile_id, list_id)
);

create index saved_lists_profile_id_idx on public.saved_lists(profile_id);
create index saved_lists_list_id_idx on public.saved_lists(list_id);

comment on table public.saved_lists is 'Lists saved by users from other users';

-- =================================================================
-- 4. HIGHLIGHTS TABLE
-- =================================================================
create table if not exists public.highlights (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  post_id uuid not null references public.posts(id) on delete cascade,
  highlighted_text text not null check (char_length(highlighted_text) >= 1 and char_length(highlighted_text) <= 5000),
  note text check (char_length(note) <= 1000),
  color text not null default '#FFEB3B' check (color ~ '^#[0-9A-Fa-f]{6}$'),
  position_start integer not null check (position_start >= 0),
  position_end integer not null check (position_end > position_start),
  is_public boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint highlights_position_check check (position_end > position_start)
);

create index highlights_profile_id_idx on public.highlights(profile_id);
create index highlights_post_id_idx on public.highlights(post_id);
create index highlights_profile_post_idx on public.highlights(profile_id, post_id);
create index highlights_created_at_idx on public.highlights(created_at desc);

comment on table public.highlights is 'Text highlights made by users while reading posts';
comment on column public.highlights.color is 'Hex color code for highlight';
comment on column public.highlights.position_start is 'Character position where highlight starts';
comment on column public.highlights.position_end is 'Character position where highlight ends';

-- =================================================================
-- 5. READING HISTORY TABLE
-- =================================================================
create table if not exists public.reading_history (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  post_id uuid not null references public.posts(id) on delete cascade,
  read_at timestamptz not null default now(),
  read_duration_seconds integer check (read_duration_seconds >= 0),
  scroll_percentage integer check (scroll_percentage >= 0 and scroll_percentage <= 100),
  completed boolean not null default false,
  last_position integer default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index reading_history_profile_id_idx on public.reading_history(profile_id);
create index reading_history_post_id_idx on public.reading_history(post_id);
create index reading_history_profile_post_idx on public.reading_history(profile_id, post_id);
create index reading_history_read_at_idx on public.reading_history(read_at desc);
create index reading_history_completed_idx on public.reading_history(profile_id, completed);

comment on table public.reading_history is 'User reading activity tracking';
comment on column public.reading_history.read_duration_seconds is 'Time spent reading in seconds';
comment on column public.reading_history.scroll_percentage is 'How far user scrolled (0-100)';
comment on column public.reading_history.completed is 'Whether user finished reading';
comment on column public.reading_history.last_position is 'Last scroll position for resume reading';

-- =================================================================
-- 6. BOOKMARKS TABLE
-- =================================================================
create table if not exists public.bookmarks (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid not null references public.profiles(id) on delete cascade,
  post_id uuid not null references public.posts(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint bookmarks_unique unique(profile_id, post_id)
);

create index bookmarks_profile_id_idx on public.bookmarks(profile_id);
create index bookmarks_post_id_idx on public.bookmarks(post_id);
create index bookmarks_created_at_idx on public.bookmarks(created_at desc);

comment on table public.bookmarks is 'Quick save bookmarks for posts';

-- =================================================================
-- 7. TRIGGERS AND FUNCTIONS
-- =================================================================

-- Update updated_at timestamp
create or replace function public.update_library_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger user_lists_updated_at
  before update on public.user_lists
  for each row execute function public.update_library_updated_at();

create trigger highlights_updated_at
  before update on public.highlights
  for each row execute function public.update_library_updated_at();

create trigger reading_history_updated_at
  before update on public.reading_history
  for each row execute function public.update_library_updated_at();

-- Update list item count
create or replace function public.update_list_item_count()
returns trigger
language plpgsql
as $$
begin
  if (TG_OP = 'INSERT') then
    update public.user_lists
    set item_count = item_count + 1
    where id = new.list_id;
    return new;
  elsif (TG_OP = 'DELETE') then
    update public.user_lists
    set item_count = item_count - 1
    where id = old.list_id;
    return old;
  end if;
  return null;
end;
$$;

create trigger list_items_count_trigger
  after insert or delete on public.list_items
  for each row execute function public.update_list_item_count();

-- =================================================================
-- 8. ROW LEVEL SECURITY (RLS) POLICIES
-- =================================================================

-- Enable RLS on all tables
alter table public.user_lists enable row level security;
alter table public.list_items enable row level security;
alter table public.saved_lists enable row level security;
alter table public.highlights enable row level security;
alter table public.reading_history enable row level security;
alter table public.bookmarks enable row level security;

-- USER LISTS POLICIES
create policy "Users can view their own lists"
  on public.user_lists for select
  using (profile_id = (select id from public.profiles where user_id = auth.uid()));

create policy "Users can view public lists"
  on public.user_lists for select
  using (is_public = true);

create policy "Users can create their own lists"
  on public.user_lists for insert
  with check (profile_id = (select id from public.profiles where user_id = auth.uid()));

create policy "Users can update their own lists"
  on public.user_lists for update
  using (profile_id = (select id from public.profiles where user_id = auth.uid()));

create policy "Users can delete their own lists"
  on public.user_lists for delete
  using (profile_id = (select id from public.profiles where user_id = auth.uid()));

-- LIST ITEMS POLICIES
create policy "Users can view items in their lists or public lists"
  on public.list_items for select
  using (
    exists (
      select 1 from public.user_lists
      where id = list_items.list_id
      and (
        profile_id = (select id from public.profiles where user_id = auth.uid())
        or is_public = true
      )
    )
  );

create policy "Users can add items to their own lists"
  on public.list_items for insert
  with check (
    exists (
      select 1 from public.user_lists
      where id = list_items.list_id
      and profile_id = (select id from public.profiles where user_id = auth.uid())
    )
  );

create policy "Users can update items in their own lists"
  on public.list_items for update
  using (
    exists (
      select 1 from public.user_lists
      where id = list_items.list_id
      and profile_id = (select id from public.profiles where user_id = auth.uid())
    )
  );

create policy "Users can delete items from their own lists"
  on public.list_items for delete
  using (
    exists (
      select 1 from public.user_lists
      where id = list_items.list_id
      and profile_id = (select id from public.profiles where user_id = auth.uid())
    )
  );

-- SAVED LISTS POLICIES
create policy "Users can view their saved lists"
  on public.saved_lists for select
  using (profile_id = (select id from public.profiles where user_id = auth.uid()));

create policy "Users can save public lists"
  on public.saved_lists for insert
  with check (
    profile_id = (select id from public.profiles where user_id = auth.uid())
    and exists (select 1 from public.user_lists where id = saved_lists.list_id and is_public = true)
  );

create policy "Users can unsave their saved lists"
  on public.saved_lists for delete
  using (profile_id = (select id from public.profiles where user_id = auth.uid()));

-- HIGHLIGHTS POLICIES (strictly private)
create policy "Users can view their own highlights"
  on public.highlights for select
  using (profile_id = (select id from public.profiles where user_id = auth.uid()));

create policy "Users can create highlights"
  on public.highlights for insert
  with check (profile_id = (select id from public.profiles where user_id = auth.uid()));

create policy "Users can update their own highlights"
  on public.highlights for update
  using (profile_id = (select id from public.profiles where user_id = auth.uid()));

create policy "Users can delete their own highlights"
  on public.highlights for delete
  using (profile_id = (select id from public.profiles where user_id = auth.uid()));

-- READING HISTORY POLICIES (strictly private)
create policy "Users can view their own reading history"
  on public.reading_history for select
  using (profile_id = (select id from public.profiles where user_id = auth.uid()));

create policy "Users can record reading activity"
  on public.reading_history for insert
  with check (profile_id = (select id from public.profiles where user_id = auth.uid()));

create policy "Users can update their reading history"
  on public.reading_history for update
  using (profile_id = (select id from public.profiles where user_id = auth.uid()));

create policy "Users can delete their reading history"
  on public.reading_history for delete
  using (profile_id = (select id from public.profiles where user_id = auth.uid()));

-- BOOKMARKS POLICIES (strictly private)
create policy "Users can view their own bookmarks"
  on public.bookmarks for select
  using (profile_id = (select id from public.profiles where user_id = auth.uid()));

create policy "Users can create bookmarks"
  on public.bookmarks for insert
  with check (profile_id = (select id from public.profiles where user_id = auth.uid()));

create policy "Users can delete their own bookmarks"
  on public.bookmarks for delete
  using (profile_id = (select id from public.profiles where user_id = auth.uid()));
