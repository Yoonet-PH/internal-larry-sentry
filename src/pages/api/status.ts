import type { APIRoute } from 'astro';
import { kv } from '@vercel/kv';
import { isUser, KV_KEY, type User } from '../../lib/status';

async function getActiveUser(): Promise<User | null> {
  const value = await kv.get<string>(KV_KEY);
  return isUser(value) ? value : null;
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
      await kv.del(KV_KEY);
      return json({ activeUser: null });
    }

    if (current === null) {
      await kv.set(KV_KEY, user);
      return json({ activeUser: user });
    }

    if (current === user) {
      await kv.del(KV_KEY);
      return json({ activeUser: null });
    }

    return json({ activeUser: current }, 409);
  } catch {
    return json({ error: 'Failed to update status' }, 500);
  }
};
