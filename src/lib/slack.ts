import type { ScheduleUser } from './schedule-users';
import type { User } from './status';
import { formatScheduleRange } from './timezone';

const SCHEDULE_SLOT_CLOSINGS = [
  'Your shift with Larry the AI starts *now*. Let’s crush that to-do list! 🚀',
  'Look who just clocked in for you! Larry the AI is online and ready for your scheduled session.',
  'Your scheduled time with Larry the AI is officially live. Have fun! 🤖',
  'Player 2 has entered the chat. Larry the AI is unlocked and ready for your dedicated slot!',
  'It’s your turn! Larry the AI is fully operational and at your command. ⚡',
  'Larry the AI is officially open for your personal session. Make the most of it!',
  'Time to level up your workflow—Larry the AI is fired up and waiting just for you.',
  'Your scheduled block with our in-house AI, Larry, starts right now. Let\'s make some magic happen!',
  'Larry the AI is officially on duty for your session! Dive in and let him do the heavy lifting.',
  'Your digital superpower for the hour is ready. Larry the AI is officially good to go!',
] as const;

function pickScheduleSlotClosing(): string {
  const index = Math.floor(Math.random() * SCHEDULE_SLOT_CLOSINGS.length);
  return SCHEDULE_SLOT_CLOSINGS[index];
}

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
  const closing = pickScheduleSlotClosing();
  const text = `@${userName} — your Larry slot has started (${range}). ${closing}`;
  return sendSlackMessage(text);
}

export async function notifyLarryLeft(user: User): Promise<boolean> {
  const text = `${user} has left Larry. Larry is now free to use.`;
  return sendSlackMessage(text);
}
