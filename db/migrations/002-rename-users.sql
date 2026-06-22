-- Run in Neon SQL Editor if you already applied schema.sql with the old user names.

update webflow_status
set active_user = case active_user
  when 'George' then 'Webbie'
  when 'Arianne' then 'Designer'
  when 'Jep' then 'Developer'
  else active_user
end
where active_user in ('George', 'Arianne', 'Jep');

alter table webflow_status drop constraint if exists webflow_status_active_user_check;
alter table webflow_status add constraint webflow_status_active_user_check
  check (active_user in ('Admin', 'Webbie', 'Designer', 'Developer'));
