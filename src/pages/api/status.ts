import type { APIRoute } from 'astro';
import { getSql } from '../../lib/db';
import { notifyLarryLeft } from '../../lib/slack';
import {
  isClaudePlan,
  isUser,
  normalizeRemainingCredits,
  type ClaudePlan,
  type User,
} from '../../lib/status';

export const prerender = false;

type StatusRow = {
  active_user: string | null;
  claude_plan: string | null;
  remaining_credits: string | null;
  credits_updated_at: Date | string | null;
};

type StatusPayload = {
  activeUser: User | null;
  claudePlan: ClaudePlan | null;
  remainingCredits: string | null;
  creditsUpdatedAt: string | null;
};

async function getStatus(): Promise<StatusPayload> {
  const sql = getSql();
  const rows = await sql<StatusRow[]>`
    select active_user, claude_plan, remaining_credits, credits_updated_at
    from webflow_status
    where id = 1
  `;
  const row = rows[0];
  const activeUser = isUser(row?.active_user) ? row.active_user : null;
  const claudePlan = isClaudePlan(row?.claude_plan) ? row.claude_plan : null;
  const remainingCredits = normalizeRemainingCredits(row?.remaining_credits);
  const creditsUpdatedAt =
    row?.credits_updated_at instanceof Date
      ? row.credits_updated_at.toISOString()
      : typeof row?.credits_updated_at === 'string'
        ? row.credits_updated_at
        : null;

  return { activeUser, claudePlan, remainingCredits, creditsUpdatedAt };
}

async function setActiveUser(user: User | null): Promise<void> {
  const sql = getSql();
  if (user === null) {
    await sql`
      update webflow_status
      set active_user = null, claude_plan = null, updated_at = now()
      where id = 1
    `;
    return;
  }

  await sql`
    insert into webflow_status (id, active_user, updated_at)
    values (1, ${user}, now())
    on conflict (id) do update
    set active_user = ${user}, updated_at = now()
  `;
}

async function setClaudePlan(plan: ClaudePlan): Promise<void> {
  const sql = getSql();
  await sql`
    update webflow_status
    set claude_plan = ${plan}, updated_at = now()
    where id = 1
  `;
}

async function setRemainingCredits(remainingCredits: string): Promise<void> {
  const sql = getSql();
  await sql`
    update webflow_status
    set
      remaining_credits = ${remainingCredits},
      credits_updated_at = now(),
      updated_at = now()
    where id = 1
  `;
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

function getUpdateErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error);

  if (
    message.includes('webflow_status_remaining_credits_check') ||
    message.includes('check constraint')
  ) {
    return 'Credits format is out of date. Run db/migrations/009-credits-dollar-format.sql in Neon SQL Editor, then try again.';
  }

  return 'Failed to update status';
}

export const GET: APIRoute = async () => {
  try {
    const status = await getStatus();
    return json(status);
  } catch {
    return json({ error: 'Failed to read status' }, 500);
  }
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const user = body?.user;
    const action = body?.action;

    if (!isUser(user)) {
      return json({ error: 'Invalid user' }, 400);
    }

    const current = await getStatus();

    if (action === 'setPlan') {
      const plan = body?.plan;
      if (!isClaudePlan(plan)) {
        return json({ error: 'Invalid plan' }, 400);
      }
      if (current.activeUser !== user) {
        return json({ error: 'Only the active user can set the plan' }, 403);
      }
      await setClaudePlan(plan);
      return json({ ...(await getStatus()) });
    }

    if (action === 'updateCredits') {
      const remainingCredits = normalizeRemainingCredits(body?.remainingCredits);
      if (remainingCredits === null) {
        return json({ error: 'Invalid credits value' }, 400);
      }
      if (current.activeUser !== user) {
        return json({ error: 'Only the active user can update credits' }, 403);
      }
      await setRemainingCredits(remainingCredits);
      return json({ ...(await getStatus()) });
    }

    if (action !== 'enter' && action !== 'leave') {
      return json({ error: 'Invalid action' }, 400);
    }

    if (action === 'leave') {
      if (current.activeUser !== user) {
        return json({ ...(await getStatus()) }, 409);
      }
      await setActiveUser(null);
      try {
        await notifyLarryLeft(user);
      } catch (error) {
        console.error('Leave Larry Slack notification failed:', error);
      }
      return json({ ...(await getStatus()) });
    }

    if (current.activeUser === null) {
      await setActiveUser(user);
      return json({ ...(await getStatus()) });
    }

    if (current.activeUser === user) {
      await setActiveUser(null);
      try {
        await notifyLarryLeft(user);
      } catch (error) {
        console.error('Leave Larry Slack notification failed:', error);
      }
      return json({ ...(await getStatus()) });
    }

    return json({ ...(await getStatus()) }, 409);
  } catch (error) {
    return json({ error: getUpdateErrorMessage(error) }, 500);
  }
};
