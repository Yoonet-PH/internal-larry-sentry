alter table webflow_status
  drop constraint if exists webflow_status_remaining_credits_check;

alter table webflow_status
  alter column remaining_credits type integer using remaining_credits;

alter table webflow_status
  add constraint webflow_status_remaining_credits_check check (remaining_credits >= 0);
