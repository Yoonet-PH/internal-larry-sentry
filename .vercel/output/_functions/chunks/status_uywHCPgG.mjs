import { kv } from '@vercel/kv';

const USERS = ["George", "Arianne", "Jep"];
const KV_KEY = "webflow:activeUser";
function isUser(value) {
  return typeof value === "string" && USERS.includes(value);
}

async function getActiveUser() {
  const value = await kv.get(KV_KEY);
  return isUser(value) ? value : null;
}
function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}
const GET = async () => {
  try {
    const activeUser = await getActiveUser();
    return json({ activeUser });
  } catch {
    return json({ error: "Failed to read status" }, 500);
  }
};
const POST = async ({ request }) => {
  try {
    const body = await request.json();
    const user = body?.user;
    const action = body?.action;
    if (!isUser(user)) {
      return json({ error: "Invalid user" }, 400);
    }
    if (action !== "enter" && action !== "leave") {
      return json({ error: "Invalid action" }, 400);
    }
    const current = await getActiveUser();
    if (action === "leave") {
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
    return json({ error: "Failed to update status" }, 500);
  }
};

const _page = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  GET,
  POST
}, Symbol.toStringTag, { value: 'Module' }));

const page = () => _page;

export { page };
