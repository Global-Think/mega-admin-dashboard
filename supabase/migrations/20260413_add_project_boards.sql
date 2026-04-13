create extension if not exists pgcrypto;

create table if not exists public.project_boards (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  client_name text not null,
  source_type text not null check (source_type in ('provisioned', 'legacy')),
  project_id uuid null references public.projects(id) on delete set null,
  framework text null,
  repo_url text null,
  created_at timestamptz not null default timezone('utc', now())
);

alter table public.kanban_columns
  add column if not exists board_id uuid;

alter table public.kanban_cards
  add column if not exists board_id uuid;

insert into public.project_boards (slug, title, client_name, source_type, project_id, framework, repo_url, created_at)
select
  p.name,
  p.name,
  p.client_name,
  'provisioned',
  p.id,
  p.framework,
  p.repo_url,
  p.created_at
from public.projects p
where not exists (
  select 1
  from public.project_boards boards
  where boards.project_id = p.id
);

update public.kanban_columns columns
set board_id = boards.id
from public.project_boards boards
where boards.project_id = columns.project_id
  and columns.board_id is null;

update public.kanban_cards cards
set board_id = boards.id
from public.project_boards boards
where boards.project_id = cards.project_id
  and cards.board_id is null;

alter table public.kanban_columns
  alter column board_id set not null;

alter table public.kanban_cards
  alter column board_id set not null;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'kanban_columns_board_id_fkey'
  ) then
    alter table public.kanban_columns
      add constraint kanban_columns_board_id_fkey
      foreign key (board_id) references public.project_boards(id) on delete cascade;
  end if;
end $$;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'kanban_cards_board_id_fkey'
  ) then
    alter table public.kanban_cards
      add constraint kanban_cards_board_id_fkey
      foreign key (board_id) references public.project_boards(id) on delete cascade;
  end if;
end $$;

create index if not exists project_boards_slug_idx on public.project_boards (slug);
create index if not exists project_boards_project_id_idx on public.project_boards (project_id);
create index if not exists kanban_columns_board_id_idx on public.kanban_columns (board_id);
create index if not exists kanban_cards_board_id_idx on public.kanban_cards (board_id);
