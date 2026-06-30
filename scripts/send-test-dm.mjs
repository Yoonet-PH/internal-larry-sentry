import { readFileSync } from 'fs';

function loadEnv(file) {
  return Object.fromEntries(
    readFileSync(file, 'utf8')
      .split(/\r?\n/)
      .filter((line) => line && !line.startsWith('#'))
      .map((line) => {
        const index = line.indexOf('=');
        let value = line.slice(index + 1);
        if (value.startsWith('"') && value.endsWith('"')) {
          value = value.slice(1, -1);
        }
        return [line.slice(0, index), value];
      }),
  );
}

const token =
  loadEnv('.env.local').SLACK_BOT_TOKEN ?? loadEnv('.env.vercel.prod').SLACK_BOT_TOKEN;
const jepId = 'U04JS5UKPR8';

if (!token) {
  console.error('Missing SLACK_BOT_TOKEN in .env.local');
  process.exit(1);
}

async function slackApi(method, body) {
  const res = await fetch(`https://slack.com/api/${method}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  return res.json();
}

const authRes = await fetch('https://slack.com/api/auth.test', {
  method: 'POST',
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/x-www-form-urlencoded',
  },
  body: 'include_granted_scopes=true',
});
const auth = await authRes.json();
console.log('auth:', auth.ok ? `ok (${auth.user})` : auth.error);
console.log('scopes:', auth.response_metadata?.scopes?.join(', ') || '(none listed)');

const opened = await slackApi('conversations.open', { users: jepId });
if (!opened.ok) {
  console.error('conversations.open failed:', opened.error);
  const direct = await slackApi('chat.postMessage', {
    channel: jepId,
    text: 'Larry test DM — if you see this, Slack notifications are working.',
  });
  if (direct.ok) {
    console.log('DM sent to Jep via direct user ID.');
    process.exit(0);
  }
  console.error('chat.postMessage (user id) failed:', direct.error);
  process.exit(1);
}

const posted = await slackApi('chat.postMessage', {
  channel: opened.channel.id,
  text: 'Larry test DM — if you see this, Slack notifications are working.',
});

if (posted.ok) {
  console.log('DM sent to Jep successfully.');
} else {
  console.error('chat.postMessage failed:', posted.error);
  process.exit(1);
}
