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

const token = loadEnv('.env.local').SLACK_BOT_TOKEN;
if (!token) {
  console.error('Missing SLACK_BOT_TOKEN');
  process.exit(1);
}

if (token.startsWith('xoxp-')) {
  console.error('Wrong token type: you have a User OAuth Token (xoxp-).');
  console.error('Use the Bot User OAuth Token (xoxb-) from Slack → OAuth & Permissions.');
  process.exit(1);
}

if (!token.startsWith('xoxb-')) {
  console.error('SLACK_BOT_TOKEN must start with xoxb-');
  process.exit(1);
}

async function call(method, body) {
  const res = await fetch(`https://slack.com/api/${method}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json; charset=utf-8',
    },
    body: JSON.stringify(body),
  });
  return res.json();
}

const auth = await call('auth.test', {});
console.log('Bot:', auth.user);

const open = await call('conversations.open', { users: 'U04JS5UKPR8' });
console.log('conversations.open:', open.ok ? 'ok' : open.error);

if (!open.ok) {
  process.exit(1);
}

const post = await call('chat.postMessage', {
  channel: open.channel.id,
  text: 'Larry test DM — Slack scopes are working.',
});

if (post.ok) {
  console.log('chat.postMessage: ok');
  console.log('DM sent to Jep.');
  process.exit(0);
}

console.log('chat.postMessage:', post.error);
if (post.needed) {
  console.log('  needs scope:', post.needed);
  console.log('  token has:   ', post.provided);
  console.log('\nFix: Slack app → OAuth & Permissions → add "chat:write" under Bot Token Scopes');
  console.log('     → Reinstall to Workspace → copy new Bot User OAuth Token → update SLACK_BOT_TOKEN');
}
process.exit(1);
