-- AI workflow management tables
create type public.ai_workflow_status as enum ('pending', 'running', 'completed', 'failed');

create table if not exists public.ai_workflows (
  id uuid primary key default gen_random_uuid(),
  topic text,
  status public.ai_workflow_status not null default 'pending',
  current_agent text,
  metadata jsonb not null default '{}'::jsonb,
  result jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.ai_workflow_events (
  id uuid primary key default gen_random_uuid(),
  workflow_id uuid not null references public.ai_workflows(id) on delete cascade,
  type text not null,
  payload jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table if not exists public.research_notes (
  id uuid primary key default gen_random_uuid(),
  workflow_id uuid references public.ai_workflows(id) on delete set null,
  title text not null,
  url text,
  content text,
  metadata jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

alter table public.posts
  add column if not exists seo_focus_keyword text,
  add column if not exists seo_score numeric,
  add column if not exists ai_generated boolean not null default false,
  add column if not exists seo_recommendations jsonb;

create index if not exists ai_workflows_status_idx on public.ai_workflows(status);
create index if not exists ai_workflow_events_workflow_id_idx on public.ai_workflow_events(workflow_id, created_at);
create index if not exists research_notes_workflow_id_idx on public.research_notes(workflow_id);

create trigger ai_workflows_updated_at
before update on public.ai_workflows
for each row execute function public.set_updated_at();

alter table public.ai_workflows enable row level security;
alter table public.ai_workflow_events enable row level security;
alter table public.research_notes enable row level security;

create policy "AI workflows readable by admins"
  on public.ai_workflows for select
  using ( exists (
    select 1 from public.profiles p
    where p.user_id = auth.uid()
      and p.is_admin
  ));

create policy "AI workflow events readable by admins"
  on public.ai_workflow_events for select
  using ( exists (
    select 1 from public.profiles p
    where p.user_id = auth.uid()
      and p.is_admin
  ));

create policy "Research notes readable by admins"
  on public.research_notes for select
  using ( exists (
    select 1 from public.profiles p
    where p.user_id = auth.uid()
      and p.is_admin
  ));
