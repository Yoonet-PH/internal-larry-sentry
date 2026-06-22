import type { APIRoute } from 'astro';
import { getSql } from '../../lib/db';
import { parseScheduleTimes, toScheduleEntry } from '../../lib/schedule';
import { isScheduleUser, type ScheduleUser } from '../../lib/schedule-users';

export const prerender = false;

type ScheduleRow = {
  id: string;
  user_name: ScheduleUser;
  starts_at: Date;
  ends_at: Date;
  created_at: Date;
};

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

async function listUpcomingSchedule(): Promise<ScheduleRow[]> {
  const sql = getSql();
  return sql<ScheduleRow[]>`
    select id, user_name, starts_at, ends_at, created_at
    from larry_schedule
    where ends_at > now()
    order by starts_at asc
  `;
}

async function findOverlappingSchedule(startsAt: Date, endsAt: Date, excludeId?: string) {
  const sql = getSql();
  const rows = await sql<ScheduleRow[]>`
    select id, user_name, starts_at, ends_at, created_at
    from larry_schedule
    where ends_at > ${startsAt.toISOString()}
      and starts_at < ${endsAt.toISOString()}
      and (${excludeId ?? null}::uuid is null or id <> ${excludeId ?? null}::uuid)
    limit 1
  `;
  return rows[0] ?? null;
}

export const GET: APIRoute = async () => {
  try {
    const rows = await listUpcomingSchedule();
    return json({ schedule: rows.map(toScheduleEntry) });
  } catch {
    return json({ error: 'Failed to load schedule' }, 500);
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const user = body?.user;
    const times = parseScheduleTimes(body?.startsAt, body?.endsAt);

    if (!isScheduleUser(user)) {
      return json({ error: 'Invalid user' }, 400);
    }

    if (!times) {
      return json({ error: 'Invalid start or end time' }, 400);
    }

    const { startsAt, endsAt } = times;

    if (startsAt < new Date()) {
      return json({ error: 'Cannot schedule in the past' }, 400);
    }

    const overlap = await findOverlappingSchedule(startsAt, endsAt);
    if (overlap) {
      return json(
        {
          error: 'That time overlaps an existing schedule slot',
          conflict: toScheduleEntry(overlap),
        },
        409,
      );
    }

    const sql = getSql();
    const rows = await sql<ScheduleRow[]>`
      insert into larry_schedule (user_name, starts_at, ends_at)
      values (${user}, ${startsAt.toISOString()}, ${endsAt.toISOString()})
      returning id, user_name, starts_at, ends_at, created_at
    `;

    return json({ entry: toScheduleEntry(rows[0]!) }, 201);
  } catch {
    return json({ error: 'Failed to add to schedule' }, 500);
  }
};

export const DELETE: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const id = body?.id;

    if (typeof id !== 'string' || !id) {
      return json({ error: 'Invalid schedule id' }, 400);
    }

    const sql = getSql();
    const rows = await sql<{ id: string }[]>`
      delete from larry_schedule
      where id = ${id}::uuid
      returning id
    `;

    if (!rows[0]) {
      return json({ error: 'Schedule entry not found' }, 404);
    }

    return json({ ok: true });
  } catch {
    return json({ error: 'Failed to remove from schedule' }, 500);
  }
};
