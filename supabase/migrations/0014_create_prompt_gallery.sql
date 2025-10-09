-- Prompt gallery schema
set statement_timeout = 0;
set lock_timeout = 0;
set idle_in_transaction_session_timeout = 0;
set client_encoding = 'UTF8';
set standard_conforming_strings = on;

create type prompt_media_type as enum ('image', 'video', 'text', 'audio', '3d', 'workflow');
create type prompt_difficulty_level as enum ('beginner', 'intermediate', 'advanced');
create type prompt_visibility as enum ('public', 'unlisted', 'draft');
create type prompt_monetization_type as enum ('free', 'tip-enabled', 'premium');
create type prompt_asset_type as enum ('image', 'video', 'file');
create type prompt_moderation_status as enum ('pending', 'approved', 'rejected');
create type prompt_vote_type as enum ('upvote', 'downvote');

create table public.ai_models (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  display_name text not null,
  category text not null,
  version text,
  description text,
  icon_url text,
  parameters_schema jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger update_ai_models_updated_at
before update on public.ai_models
for each row execute procedure trigger_update_timestamp();

create table public.prompt_collections (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  slug text not null unique,
  is_curated boolean not null default false,
  is_featured boolean not null default false,
  cover_image text,
  created_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now()
);

create table public.prompts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  slug text not null unique,
  description text,
  prompt_text text not null,
  negative_prompt text,
  parameters jsonb,
  media_type prompt_media_type not null,
  difficulty prompt_difficulty_level not null default 'beginner',
  language text not null default 'en',
  license text not null default 'CC0',
  visibility prompt_visibility not null default 'public',
  monetization_type prompt_monetization_type not null default 'free',
  price numeric(10,2) default 0,
  views_count integer not null default 0,
  downloads_count integer not null default 0,
  copies_count integer not null default 0,
  upvotes integer not null default 0,
  downvotes integer not null default 0,
  rating numeric(3,2) default 0,
  is_featured boolean not null default false,
  is_flagged boolean not null default false,
  moderation_status prompt_moderation_status not null default 'pending',
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index prompts_slug_idx on public.prompts (slug);
create index prompts_media_type_idx on public.prompts (media_type);
create index prompts_visibility_idx on public.prompts (visibility);
create index prompts_published_at_idx on public.prompts (published_at desc);
create trigger update_prompts_updated_at
before update on public.prompts
for each row execute procedure trigger_update_timestamp();

create table public.prompt_models (
  prompt_id uuid references public.prompts (id) on delete cascade,
  model_id uuid references public.ai_models (id) on delete cascade,
  is_primary boolean not null default false,
  created_at timestamptz not null default now(),
  primary key (prompt_id, model_id)
);

create index prompt_models_model_idx on public.prompt_models (model_id);

create table public.prompt_assets (
  id uuid primary key default gen_random_uuid(),
  prompt_id uuid not null references public.prompts (id) on delete cascade,
  asset_type prompt_asset_type not null default 'image',
  file_url text not null,
  thumbnail_url text,
  display_order integer not null default 0,
  metadata jsonb,
  file_size integer,
  mime_type text,
  created_at timestamptz not null default now()
);

create index prompt_assets_prompt_idx on public.prompt_assets (prompt_id);
create index prompt_assets_display_order_idx on public.prompt_assets (prompt_id, display_order);

create table public.prompt_tags (
  id uuid primary key default gen_random_uuid(),
  name citext not null unique,
  category text,
  usage_count integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.prompt_tags_junction (
  prompt_id uuid references public.prompts (id) on delete cascade,
  tag_id uuid references public.prompt_tags (id) on delete cascade,
  added_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  primary key (prompt_id, tag_id)
);

create index prompt_tags_junction_tag_idx on public.prompt_tags_junction (tag_id);

create table public.prompt_votes (
  user_id uuid references public.profiles (id) on delete cascade,
  prompt_id uuid references public.prompts (id) on delete cascade,
  vote_type prompt_vote_type not null,
  weight numeric(4,2) not null default 1,
  created_at timestamptz not null default now(),
  primary key (user_id, prompt_id)
);

create table public.prompt_downloads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete set null,
  prompt_id uuid not null references public.prompts (id) on delete cascade,
  ip_address inet,
  user_agent text,
  created_at timestamptz not null default now()
);

create table public.prompt_copy_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete set null,
  prompt_id uuid not null references public.prompts (id) on delete cascade,
  ip_address inet,
  user_agent text,
  created_at timestamptz not null default now()
);

create table public.prompt_bookmark_collections (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  name text not null,
  description text,
  is_default boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.prompt_bookmarks (
  user_id uuid references public.profiles (id) on delete cascade,
  prompt_id uuid references public.prompts (id) on delete cascade,
  collection_id uuid references public.prompt_bookmark_collections (id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, prompt_id)
);

create table public.prompt_comments (
  id uuid primary key default gen_random_uuid(),
  prompt_id uuid not null references public.prompts (id) on delete cascade,
  user_id uuid references public.profiles (id) on delete set null,
  parent_id uuid references public.prompt_comments (id) on delete cascade,
  content text not null,
  markdown_content text,
  upvotes integer not null default 0,
  downvotes integer not null default 0,
  is_flagged boolean not null default false,
  is_deleted boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create trigger update_prompt_comments_updated_at
before update on public.prompt_comments
for each row execute procedure trigger_update_timestamp();

create index prompt_comments_prompt_idx on public.prompt_comments (prompt_id);
create index prompt_comments_parent_idx on public.prompt_comments (parent_id);

create table public.prompt_collection_items (
  collection_id uuid references public.prompt_collections (id) on delete cascade,
  prompt_id uuid references public.prompts (id) on delete cascade,
  display_order integer not null default 0,
  added_by uuid references public.profiles (id) on delete set null,
  created_at timestamptz not null default now(),
  primary key (collection_id, prompt_id)
);

create index prompt_collection_items_prompt_idx on public.prompt_collection_items (prompt_id);

create table public.prompt_moderation_queue (
  id uuid primary key default gen_random_uuid(),
  prompt_id uuid not null references public.prompts (id) on delete cascade,
  moderator_id uuid references public.profiles (id) on delete set null,
  status prompt_moderation_status not null default 'pending',
  reason text,
  notes text,
  created_at timestamptz not null default now(),
  resolved_at timestamptz
);

create index prompt_moderation_queue_status_idx on public.prompt_moderation_queue (status);

create table public.prompt_stats_daily (
  prompt_id uuid references public.prompts (id) on delete cascade,
  date date not null,
  views integer not null default 0,
  downloads integer not null default 0,
  copies integer not null default 0,
  upvotes integer not null default 0,
  downvotes integer not null default 0,
  comments integer not null default 0,
  created_at timestamptz not null default now(),
  primary key (prompt_id, date)
);

create table public.prompt_activity_feed (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete set null,
  prompt_id uuid references public.prompts (id) on delete cascade,
  activity_type text not null,
  metadata jsonb,
  created_at timestamptz not null default now()
);

create index prompt_activity_feed_prompt_idx on public.prompt_activity_feed (prompt_id);
create index prompt_activity_feed_user_idx on public.prompt_activity_feed (user_id);

-- Row Level Security policies will be configured separately in Supabase dashboard.
