import type { ScheduleUser } from './schedule-users';
import { formatSlackMention } from './slack-users';
import type { User } from './status';
import { formatScheduleRange } from './timezone';

const SCHEDULE_SLOT_CLOSINGS = [
  'Your shift with Larry the AI starts *soon*. Let’s crush that to-do list! 🚀',
  'Larry the AI is warming up and will be ready for your scheduled session in just a few minutes.',
  'Your scheduled time with Larry the AI starts soon. Have fun! 🤖',
  'Get ready—Larry the AI will be unlocked and ready for your dedicated slot in just a few minutes!',
  'It’s almost your turn! Larry the AI will be fully operational and at your command soon. ⚡',
  'Larry the AI will be open for your personal session soon. Make the most of it!',
  'Time to level up your workflow soon—Larry the AI is fired up and waiting just for you.',
  'Your scheduled block with our in-house AI, Larry, starts soon. Let\'s make some magic happen!',
  'Larry the AI will be on duty for your session soon! Get ready to dive in and let him do the heavy lifting.',
  'Your digital superpower for the hour is almost ready. Larry the AI will be good to go soon!',
] as const;

function pickScheduleSlotClosing(): string {
  const index = Math.floor(Math.random() * SCHEDULE_SLOT_CLOSINGS.length);
  return SCHEDULE_SLOT_CLOSINGS[index];
}

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

export async function notifyScheduleSlotReminder(
  userName: ScheduleUser,
  startsAt: string,
  endsAt: string,
): Promise<boolean> {
  const range = formatScheduleRange(startsAt, endsAt);
  const closing = pickScheduleSlotClosing();
  const mention = formatSlackMention(userName);
  const text = `${mention} — your Larry slot starts in 5 minutes (${range}). ${closing}`;
  return sendSlackMessage(text);
}

export async function notifyLarryLeft(user: User): Promise<boolean> {
  const text = `${user} has left Larry. Larry is now free to use.`;
  return sendSlackMessage(text);
}
