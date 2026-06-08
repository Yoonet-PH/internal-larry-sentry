-- Run once in Neon SQL Editor on an existing database
alter table webflow_status drop constraint if exists webflow_status_active_user_check;
alter table webflow_status add constraint webflow_status_active_user_check
  check (active_user in ('AC', 'George', 'Arianne', 'Jep'));
