import { getSql } from './db';
import type { ScheduleUser } from './schedule-users';
import { notifyScheduleSlotReady } from './slack';

export type ScheduleSlot = {
  id: string;
  user_name: ScheduleUser;
  starts_at: Date;
  ends_at: Date;
};

export async function isLarryFree(): Promise<boolean> {
  const sql = getSql();
  const rows = await sql<{ active_user: string | null }[]>`
    select active_user from webflow_status where id = 1
  `;
  return rows[0]?.active_user == null;
}

export async function listPendingReminders(): Promise<ScheduleSlot[]> {
  const sql = getSql();
  return sql<ScheduleSlot[]>`
    select id, user_name, starts_at, ends_at
    from larry_schedule
    where slack_notified_at is null
      and starts_at > now()
      and starts_at > now() + interval '4 minutes'
      and starts_at <= now() + interval '6 minutes'
    order by starts_at asc
  `;
}

export async function listPendingReadyNotifications(): Promise<ScheduleSlot[]> {
  const sql = getSql();
  return sql<ScheduleSlot[]>`
    select id, user_name, starts_at, ends_at
    from larry_schedule
    where slack_ready_notified_at is null
      and starts_at <= now()
      and ends_at > now()
    order by starts_at asc
  `;
}

export async function markReminderNotified(id: string): Promise<void> {
  const sql = getSql();
  await sql`
    update larry_schedule
    set slack_notified_at = now()
    where id = ${id}::uuid
  `;
}

export async function markReadyNotified(id: string): Promise<void> {
  const sql = getSql();
  await sql`
    update larry_schedule
    set slack_ready_notified_at = now()
    where id = ${id}::uuid
  `;
}

export async function processLarryFreeNotifications(): Promise<number> {
  if (!(await isLarryFree())) {
    return 0;
  }

  const slots = await listPendingReadyNotifications();
  let notified = 0;

  for (const slot of slots) {
    const sent = await notifyScheduleSlotReady(
      slot.user_name,
      slot.starts_at.toISOString(),
      slot.ends_at.toISOString(),
    );

    if (sent) {
      await markReadyNotified(slot.id);
      notified += 1;
      console.log(`Larry ready DM sent to ${slot.user_name} for slot ${slot.id}`);
    } else {
      console.warn(`Larry ready DM failed for ${slot.user_name} slot ${slot.id}`);
    }
  }

  return notified;
}
