alter table webflow_status
  drop constraint if exists webflow_status_remaining_credits_check;

update webflow_status
set remaining_credits = to_char(
  replace(remaining_credits, ',', '')::numeric / 1000.0,
  'FM999999990.00'
)
where remaining_credits is not null
  and remaining_credits ~ '^\d{1,3}(,\d{3})*$';

alter table webflow_status
  add constraint webflow_status_remaining_credits_check
  check (remaining_credits is null or remaining_credits ~ '^\d+(\.\d{1,2})?$');
