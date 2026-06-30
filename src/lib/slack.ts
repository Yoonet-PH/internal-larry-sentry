import type { ScheduleUser } from './schedule-users';
import { getServerEnv } from './env';
import type { User } from './status';
import { formatScheduleRange } from './timezone';
import { getSlackUserId } from './slack-users';

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
  needed?: string;
  provided?: string;
  channel?: { id: string };
};

function pickScheduleSlotClosing(): string {
  const index = Math.floor(Math.random() * SCHEDULE_SLOT_CLOSINGS.length);
  return SCHEDULE_SLOT_CLOSINGS[index];
}

function getBotToken(): string | undefined {
  const token = getServerEnv('SLACK_BOT_TOKEN');
  if (!token) {
    return undefined;
  }

  if (token.startsWith('xoxp-')) {
    console.error(
      'Slack notification skipped: SLACK_BOT_TOKEN is a user token (xoxp-). Use the Bot User OAuth Token (xoxb-) from Slack app → OAuth & Permissions.',
    );
    return undefined;
  }

  if (!token.startsWith('xoxb-')) {
    console.error('Slack notification skipped: SLACK_BOT_TOKEN must be a bot token (xoxb-).');
    return undefined;
  }

  return token;
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
      if (data.error === 'missing_scope') {
        console.error(
          `Slack ${method} failed: missing_scope`,
          data.needed ? `(needs ${data.needed}, token has: ${data.provided ?? 'unknown'})` : '',
        );
      } else {
        console.error(`Slack ${method} failed:`, data.error ?? response.statusText);
      }
      return null;
    }

    return data;
  } catch (error) {
    console.error(`Slack ${method} failed:`, error);
    return null;
  }
}

export async function verifySlackBotToken(): Promise<boolean> {
  const data = await slackApi<SlackApiResponse & { user?: string }>('auth.test', {});
  if (!data) {
    return false;
  }
  console.log(`Slack bot ready as ${data.user ?? 'unknown'}`);
  return true;
}

export async function sendSlackDirectMessage(slackUserId: string, text: string): Promise<boolean> {
  const opened = await slackApi<SlackApiResponse>('conversations.open', { users: slackUserId });
  const channelId = opened?.channel?.id;
  if (!channelId) {
    return false;
  }

  const posted = await slackApi<SlackApiResponse>('chat.postMessage', {
    channel: channelId,
    text,
  });
  return posted !== null;
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

export async function notifyScheduleSlotReady(
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
  const text = `Larry is free — your scheduled slot (${range}) has started. Go claim Larry!`;
  return sendSlackDirectMessage(slackUserId, text);
}

export async function notifyLarryLeft(_user: User): Promise<boolean> {
  return false;
}
