import { neon } from '@neondatabase/serverless';

function getSql() {
  const url = "postgresql://neondb_owner:npg_ZiubGVTqY04A@ep-cold-firefly-aqim59i6-pooler.c-8.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require";
  return neon(url);
}

const USERS = ["George", "Arianne", "Jep"];
function isUser(value) {
  return typeof value === "string" && USERS.includes(value);
}

async function getActiveUser() {
  const sql = getSql();
  const rows = await sql`
    select active_user from webflow_status where id = 1
  `;
  const value = rows[0]?.active_user;
  return isUser(value) ? value : null;
}
async function setActiveUser(user) {
  const sql = getSql();
  await sql`
    insert into webflow_status (id, active_user, updated_at)
    values (1, ${user}, now())
    on conflict (id) do update
    set active_user = ${user}, updated_at = now()
  `;
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
