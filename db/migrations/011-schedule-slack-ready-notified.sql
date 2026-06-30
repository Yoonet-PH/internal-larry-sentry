alter table larry_schedule
  add column if not exists slack_ready_notified_at timestamptz;
