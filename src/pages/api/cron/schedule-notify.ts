import type { APIRoute } from 'astro';
import { getServerEnv } from '../../../lib/env';
import {
  listPendingReminders,
  markReminderNotified,
  processLarryFreeNotifications,
} from '../../../lib/schedule-notify';
import { notifyScheduleSlotReminder, verifySlackBotToken } from '../../../lib/slack';

export const prerender = false;

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function isAuthorized(request: Request): boolean {
  const cronSecret = getServerEnv('CRON_SECRET');
  if (!cronSecret) {
    return false;
  }

  const authHeader = request.headers.get('authorization');
  return authHeader === `Bearer ${cronSecret}`;
}

export const GET: APIRoute = async ({ request }) => {
  if (!isAuthorized(request)) {
    return json({ error: 'Unauthorized' }, 401);
  }

  try {
    const slackReady = await verifySlackBotToken();
    if (!slackReady) {
      console.error('Schedule notify cron: Slack bot token is missing or invalid');
    }

    const reminderSlots = await listPendingReminders();
    console.log(`Schedule notify cron: ${reminderSlots.length} slot(s) in 4–6 minute reminder window`);

    let reminded = 0;

    for (const slot of reminderSlots) {
      const sent = await notifyScheduleSlotReminder(
        slot.user_name,
        slot.starts_at.toISOString(),
        slot.ends_at.toISOString(),
      );

      if (sent) {
        await markReminderNotified(slot.id);
        reminded += 1;
        console.log(`Schedule notify cron: reminded ${slot.user_name} for slot ${slot.id}`);
      } else {
        console.warn(`Schedule notify cron: failed to remind ${slot.user_name} for slot ${slot.id}`);
      }
    }

    const readyNotified = await processLarryFreeNotifications();

    console.log(
      `Schedule notify cron: completed, reminded ${reminded}/${reminderSlots.length}, ready ${readyNotified}`,
    );
    return json({ reminded, readyNotified });
  } catch (error) {
    console.error('Schedule notify cron failed:', error);
    return json({ error: 'Failed to process schedule notifications' }, 500);
  }
};
