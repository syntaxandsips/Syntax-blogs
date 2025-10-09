-- Adds a dedicated catalog for AI model categories along with
-- richer metadata for individual models so the admin console
-- can manage families and providers.

create table if not exists public.ai_model_categories (
  id uuid primary key default gen_random_uuid(),
  name text not null unique,
  slug text not null unique,
  description text,
  accent_color text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

do $$
begin
  if not exists (
    select 1
    from pg_trigger
    where tgname = 'update_ai_model_categories_updated_at'
  ) then
    create trigger update_ai_model_categories_updated_at
    before update on public.ai_model_categories
    for each row execute function trigger_update_timestamp();
  end if;
end
$$;

create index if not exists ai_model_categories_slug_idx on public.ai_model_categories (slug);

alter table public.ai_models
  add column if not exists family text,
  add column if not exists provider text,
  add column if not exists category_id uuid references public.ai_model_categories (id) on delete set null;

create index if not exists ai_models_category_id_idx on public.ai_models (category_id);
