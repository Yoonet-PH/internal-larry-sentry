-- Run in Neon SQL Editor if larry_schedule still restricts user_name to team roles.

delete from larry_schedule
where user_name in ('Admin', 'Webbie', 'Designer', 'Developer');

alter table larry_schedule drop constraint if exists larry_schedule_user_name_check;
alter table larry_schedule drop constraint if exists larry_bookings_user_name_check;
alter table larry_schedule add constraint larry_schedule_user_name_check
  check (user_name in (
    'Arianne', 'Cassey', 'CJ', 'Em', 'Gaia', 'George', 'Jaisa', 'Jep',
    'JL', 'John', 'Louie', 'Paul', 'Runnel', 'Yura'
  ));
