export const SCHEDULE_USERS = [
  'Arianne',
  'Cassey',
  'CJ',
  'Em',
  'Gaia',
  'George',
  'Jaisa',
  'Jep',
  'JL',
  'John',
  'Louie',
  'Paul',
  'Runnel',
  'Yura',
] as const;

export type ScheduleUser = (typeof SCHEDULE_USERS)[number];

export function isScheduleUser(value: unknown): value is ScheduleUser {
  return typeof value === 'string' && SCHEDULE_USERS.includes(value as ScheduleUser);
}
