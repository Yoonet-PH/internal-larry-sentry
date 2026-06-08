import type { APIRoute } from 'astro';
import { getSql } from '../../lib/db';
import { isUser, type User } from '../../lib/status';

async function getActiveUser(): Promise<User | null> {
  const sql = getSql();
  const rows = await sql<{ active_user: string | null }[]>`
    select active_user from webflow_status where id = 1
  `;
  const value = rows[0]?.active_user;
  return isUser(value) ? value : null;
}

async function setActiveUser(user: User | null): Promise<void> {
  const sql = getSql();
  await sql`
    insert into webflow_status (id, active_user, updated_at)
    values (1, ${user}, now())
    on conflict (id) do update
    set active_user = ${user}, updated_at = now()
  `;
}

function json(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });
}

export const GET: APIRoute = async () => {
  try {
    const activeUser = await getActiveUser();
    return json({ activeUser });
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

    if (action !== 'enter' && action !== 'leave') {
      return json({ error: 'Invalid action' }, 400);
    }

    const current = await getActiveUser();

    if (action === 'leave') {
      if (current !== user) {
        return json({ activeUser: current }, 409);
      }
      await setActiveUser(null);
      return json({ activeUser: null });
    }

    if (current === null) {
      await setActiveUser(user);
      return json({ activeUser: user });
    }

    if (current === user) {
      await setActiveUser(null);
      return json({ activeUser: null });
    }

    return json({ activeUser: current }, 409);
  } catch {
    return json({ error: 'Failed to update status' }, 500);
  }
};
