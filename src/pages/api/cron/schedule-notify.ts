import type { APIRoute } from 'astro';
import { getSql } from '../../../lib/db';
import { notifyScheduleSlotStarted } from '../../../lib/slack';
import type { ScheduleUser } from '../../../lib/schedule-users';

export const prerender = false;

type PendingSlot = {
  id: string;
  user_name: ScheduleUser;
  starts_at: Date;
  ends_at: Date;
};

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function isAuthorized(request: Request): boolean {
  const cronSecret = import.meta.env.CRON_SECRET;
  if (!cronSecret) {
    return false;
  }

  const authHeader = request.headers.get('authorization');
  return authHeader === `Bearer ${cronSecret}`;
}

async function listPendingSlots(): Promise<PendingSlot[]> {
  const sql = getSql();
  return sql<PendingSlot[]>`
    select id, user_name, starts_at, ends_at
    from larry_schedule
    where slack_notified_at is null
      and starts_at <= now()
      and starts_at > now() - interval '15 minutes'
    order by starts_at asc
  `;
}

async function markSlotNotified(id: string): Promise<void> {
  const sql = getSql();
  await sql`
    update larry_schedule
    set slack_notified_at = now()
    where id = ${id}::uuid
  `;
}

export const GET: APIRoute = async ({ request }) => {
  if (!isAuthorized(request)) {
    return json({ error: 'Unauthorized' }, 401);
  }

  try {
    const slots = await listPendingSlots();
    let notified = 0;

    for (const slot of slots) {
      const sent = await notifyScheduleSlotStarted(
        slot.user_name,
        slot.starts_at.toISOString(),
        slot.ends_at.toISOString(),
      );

      if (sent) {
        await markSlotNotified(slot.id);
        notified += 1;
      }
    }

    return json({ notified });
  } catch (error) {
    console.error('Schedule notify cron failed:', error);
    return json({ error: 'Failed to process schedule notifications' }, 500);
  }
};
