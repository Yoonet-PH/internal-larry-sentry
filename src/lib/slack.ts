import type { ScheduleUser } from './schedule-users';
import type { User } from './status';
import { formatScheduleRange } from './timezone';

function getWebhookUrl(): string | undefined {
  return import.meta.env.SLACK_WEBHOOK_URL;
}

export async function sendSlackMessage(text: string): Promise<boolean> {
  const webhookUrl = getWebhookUrl();
  if (!webhookUrl) {
    console.error('Slack notification skipped: missing SLACK_WEBHOOK_URL');
    return false;
  }

  try {
    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });

    if (!response.ok) {
      console.error(`Slack notification failed: ${response.status} ${response.statusText}`);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Slack notification failed:', error);
    return false;
  }
}

export async function notifyScheduleSlotStarted(
  userName: ScheduleUser,
  startsAt: string,
  endsAt: string,
): Promise<boolean> {
  const range = formatScheduleRange(startsAt, endsAt);
  const text = `${userName} — your Larry slot has started (${range}). You can now use Larry the AI.`;
  return sendSlackMessage(text);
}

export async function notifyLarryLeft(user: User): Promise<boolean> {
  const text = `${user} has left Larry. Larry is now free to use.`;
  return sendSlackMessage(text);
}
