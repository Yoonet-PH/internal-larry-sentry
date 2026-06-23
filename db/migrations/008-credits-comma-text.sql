alter table webflow_status
  drop constraint if exists webflow_status_remaining_credits_check;

alter table webflow_status
  alter column remaining_credits type text using (
    case
      when remaining_credits is null then null
      when remaining_credits::text ~ '^\d{1,3}(,\d{3})*$' then remaining_credits::text
      else to_char(remaining_credits::bigint, 'FM999,999,999,999')
    end
  );

alter table webflow_status
  add constraint webflow_status_remaining_credits_check
  check (remaining_credits is null or remaining_credits ~ '^\d{1,3}(,\d{3})*$');
