alter table webflow_status
  add column if not exists claude_plan text check (claude_plan in ('max', 'api')),
  add column if not exists remaining_credits smallint check (remaining_credits >= 0 and remaining_credits <= 100);
