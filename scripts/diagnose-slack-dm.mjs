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
const jepId = 'U04JS5UKPR8';

if (!token) {
  console.error('Missing SLACK_BOT_TOKEN');
  process.exit(1);
}

console.log('Token type:', token.startsWith('xoxb-') ? 'bot (xoxb)' : token.startsWith('xoxp-') ? 'user (xoxp)' : 'unknown');

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
console.log('\nauth.test');
console.log('  user:', auth.user);
console.log('  user_id:', auth.user_id);
console.log('  bot_id:', auth.bot_id ?? '(none — likely user token)');
console.log('  team:', auth.team);

const userInfo = await call('users.info', { user: jepId });
if (userInfo.ok) {
  console.log('\nTarget user (Jep)');
  console.log('  id:', userInfo.user.id);
  console.log('  name:', userInfo.user.name);
  console.log('  real_name:', userInfo.user.real_name);
  console.log('  deleted:', userInfo.user.deleted);
} else {
  console.log('\nusers.info for Jep failed:', userInfo.error);
  console.log('  (token may need users:read scope, or ID is wrong for this workspace)');
}

const open = await call('conversations.open', { users: jepId });
console.log('\nconversations.open:', open.ok ? `channel ${open.channel?.id}` : open.error);

if (!open.ok) {
  process.exit(1);
}

const text = `Larry notifier test at ${new Date().toLocaleString('en-PH', { timeZone: 'Asia/Manila' })} — reply if you see this.`;
const post = await call('chat.postMessage', {
  channel: open.channel.id,
  text,
  unfurl_links: false,
});

console.log('\nchat.postMessage');
console.log('  ok:', post.ok);
console.log('  error:', post.error ?? '');
console.log('  channel:', post.channel ?? '');
console.log('  ts:', post.ts ?? '');
console.log('  message.user:', post.message?.user ?? '');
console.log('  message.bot_id:', post.message?.bot_id ?? '');
console.log('  message.text:', post.message?.text ?? '');

if (post.ok) {
  const hist = await call('conversations.history', { channel: open.channel.id, limit: '3' });
  console.log('\nDM history (last 3):');
  if (hist.ok) {
    for (const m of hist.messages ?? []) {
      console.log(`  - [${m.user ?? m.bot_id ?? '?'}] ${m.text?.slice(0, 80)}`);
    }
  } else {
    console.log('  history failed:', hist.error);
  }
}
