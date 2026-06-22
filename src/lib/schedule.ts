import { isScheduleUser, type ScheduleUser } from './schedule-users';

export type ScheduleEntry = {
  id: string;
  user: ScheduleUser;
  startsAt: string;
  endsAt: string;
  createdAt: string;
};

export function isScheduleRow(row: unknown): row is {
  id: string;
  user_name: string;
  starts_at: Date | string;
  ends_at: Date | string;
  created_at: Date | string;
} {
  if (!row || typeof row !== 'object') return false;
  const record = row as Record<string, unknown>;
  return (
    typeof record.id === 'string' &&
    isScheduleUser(record.user_name) &&
    (record.starts_at instanceof Date || typeof record.starts_at === 'string') &&
    (record.ends_at instanceof Date || typeof record.ends_at === 'string') &&
    (record.created_at instanceof Date || typeof record.created_at === 'string')
  );
}

export function toScheduleEntry(row: {
  id: string;
  user_name: ScheduleUser;
  starts_at: Date | string;
  ends_at: Date | string;
  created_at: Date | string;
}): ScheduleEntry {
  return {
    id: row.id,
    user: row.user_name,
    startsAt: new Date(row.starts_at).toISOString(),
    endsAt: new Date(row.ends_at).toISOString(),
    createdAt: new Date(row.created_at).toISOString(),
  };
}

export function parseScheduleTimes(startsAt: unknown, endsAt: unknown): { startsAt: Date; endsAt: Date } | null {
  if (typeof startsAt !== 'string' || typeof endsAt !== 'string') return null;

  const start = new Date(startsAt);
  const end = new Date(endsAt);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) return null;
  if (end <= start) return null;

  return { startsAt: start, endsAt: end };
}

export function scheduleOverlap(
  aStart: Date,
  aEnd: Date,
  bStart: Date,
  bEnd: Date,
): boolean {
  return aStart < bEnd && bStart < aEnd;
}
