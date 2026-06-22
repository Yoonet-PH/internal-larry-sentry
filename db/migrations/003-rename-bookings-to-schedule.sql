-- Run in Neon SQL Editor if you already have larry_bookings from an earlier deploy.

alter table if exists larry_bookings rename to larry_schedule;

alter index if exists larry_bookings_starts_at_idx rename to larry_schedule_starts_at_idx;
alter index if exists larry_bookings_ends_at_idx rename to larry_schedule_ends_at_idx;
