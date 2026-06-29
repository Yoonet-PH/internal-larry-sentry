-- Run once in Neon: SQL Editor → paste and run
-- https://console.neon.tech → your project → SQL Editor

create table if not exists webflow_status (
  id int primary key default 1 check (id = 1),
  active_user text check (active_user in ('Admin', 'Webbie', 'Designer', 'Developer')),
  claude_plan text check (claude_plan in ('max', 'api')),
  remaining_credits text check (remaining_credits is null or remaining_credits ~ '^\d+(\.\d{1,2})?$'),
  credits_updated_at timestamptz,
  updated_at timestamptz not null default now()
);

insert into webflow_status (id, active_user)
values (1, null)
on conflict (id) do nothing;

create table if not exists larry_schedule (
  id uuid primary key default gen_random_uuid(),
  user_name text not null check (user_name in (
    'Arianne', 'Cassey', 'CJ', 'Em', 'Gaia', 'George', 'Jaisa', 'Jep',
    'JL', 'John', 'Louie', 'Paul', 'Runnel', 'Yura'
  )),
  starts_at timestamptz not null,
  ends_at timestamptz not null,
  created_at timestamptz not null default now(),
  check (ends_at > starts_at)
);

create index if not exists larry_schedule_starts_at_idx on larry_schedule (starts_at);
create index if not exists larry_schedule_ends_at_idx on larry_schedule (ends_at);
