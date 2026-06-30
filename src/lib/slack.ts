import type { ScheduleUser } from './schedule-users';
import { getSlackUserId } from './slack-users';
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

type SlackApiResponse = {
  ok: boolean;
  error?: string;
  channel?: { id: string };
};

function pickScheduleSlotClosing(): string {
  const index = Math.floor(Math.random() * SCHEDULE_SLOT_CLOSINGS.length);
  return SCHEDULE_SLOT_CLOSINGS[index];
}

function getBotToken(): string | undefined {
  return import.meta.env.SLACK_BOT_TOKEN;
}

async function slackApi<T extends SlackApiResponse>(
  method: string,
  body: Record<string, string>,
): Promise<T | null> {
  const token = getBotToken();
  if (!token) {
    console.error('Slack notification skipped: missing SLACK_BOT_TOKEN');
    return null;
  }

  try {
    const response = await fetch(`https://slack.com/api/${method}`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json; charset=utf-8',
      },
      body: JSON.stringify(body),
    });

    const data = (await response.json()) as T;
    if (!data.ok) {
      console.error(`Slack ${method} failed:`, data.error ?? response.statusText);
      return null;
    }

    return data;
  } catch (error) {
    console.error(`Slack ${method} failed:`, error);
    return null;
  }
}

async function openDirectMessageChannel(slackUserId: string): Promise<string | null> {
  const data = await slackApi<SlackApiResponse>('conversations.open', { users: slackUserId });
  return data?.channel?.id ?? null;
}

export async function sendSlackDirectMessage(slackUserId: string, text: string): Promise<boolean> {
  const channelId = await openDirectMessageChannel(slackUserId);
  if (!channelId) {
    return false;
  }

  const data = await slackApi<SlackApiResponse>('chat.postMessage', {
    channel: channelId,
    text,
  });
  return data !== null;
}

export async function notifyScheduleSlotReminder(
  userName: ScheduleUser,
  startsAt: string,
  endsAt: string,
): Promise<boolean> {
  const slackUserId = getSlackUserId(userName);
  if (!slackUserId) {
    console.warn(`Slack DM skipped: no Slack ID for ${userName}`);
    return false;
  }

  const range = formatScheduleRange(startsAt, endsAt);
  const closing = pickScheduleSlotClosing();
  const minutesLeft = Math.max(1, Math.round((new Date(startsAt).getTime() - Date.now()) / 60000));
  const minuteLabel = minutesLeft === 1 ? 'minute' : 'minutes';
  const text = `Your Larry slot starts in ${minutesLeft} ${minuteLabel} (${range}). ${closing}`;
  return sendSlackDirectMessage(slackUserId, text);
}

export async function notifyLarryLeft(_user: User): Promise<boolean> {
  // Team roles (Admin, Webbie, etc.) are not mapped to Slack IDs; no DM target.
  return false;
}
