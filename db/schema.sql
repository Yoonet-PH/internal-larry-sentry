-- Run once in Neon: SQL Editor → paste and run
-- https://console.neon.tech → your project → SQL Editor

create table if not exists webflow_status (
  id int primary key default 1 check (id = 1),
  active_user text check (active_user in ('Admin', 'George', 'Arianne', 'Jep')),
  updated_at timestamptz not null default now()
);

insert into webflow_status (id, active_user)
values (1, null)
on conflict (id) do nothing;
