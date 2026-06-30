Larry Status Dashboard
A single-page Astro app that shows who is currently using Larry. Status is shared across all visitors via Neon Postgres.

Users
Admin

George

Arianne

Jep

How it works
Click I'm in Larry to claim the seat.

Click Leave Larry (same button when you are active) to release it.

If someone else is active, other buttons are disabled.

The page polls /api/status every 2 seconds so everyone sees updates quickly.

Neon setup
Create a project at console.neon.tech.

Open SQL Editor and run the script in db/schema.sql.

Go to Dashboard → Connect and copy the connection string.

For Vercel/serverless, use the pooled connection string.

Set it as DATABASE_URL in .env.local (and in Vercel env vars when deploying).

Local development
Install dependencies:

npm install


2. Copy env vars:

   ```bash
cp .env.example .env.local
Paste your Neon DATABASE_URL into .env.local.

Run the dev server:

npm run dev


## Deploy (Vercel)

1. Push to GitHub and import the repo in Vercel.
2. Add `DATABASE_URL` in **Project Settings → Environment Variables** (use the pooled Neon connection string).
3. Optionally link Neon via the [Vercel Marketplace integration](https://vercel.com/marketplace/neon) to auto-inject the variable.
4. Add `SLACK_WEBHOOK_URL` and `CRON_SECRET` for Slack notifications (see below).
5. Run `db/migrations/010-schedule-slack-notified.sql` in Neon SQL Editor if the database already exists.
6. Deploy.

## Environment variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | Neon Postgres connection string (server-only; never expose to the browser) |
| `SLACK_WEBHOOK_URL` | Slack Incoming Webhook URL for Larry notifications (optional in local dev) |
| `CRON_SECRET` | Random secret that secures the schedule notification cron endpoint (required in production) |

## Slack notifications

Larry can post to a Slack channel via an Incoming Webhook:

1. In Slack, go to **Apps → Incoming Webhooks** and add a webhook to your channel.
2. Copy the webhook URL and set it as `SLACK_WEBHOOK_URL` in Vercel (and optionally `.env.local`).
3. Generate a random `CRON_SECRET` in Vercel env vars (Vercel Cron sends it automatically).
4. Run `db/migrations/010-schedule-slack-notified.sql` in Neon if upgrading an existing database.

Notifications sent:

- **Schedule slot reminder** — 5 minutes before a booked slot's `starts_at` time (checked every minute via Vercel Cron).
- **Leave Larry** — when a team role clicks Leave Larry.

## API

### `GET /api/status`

Returns:

```json
{ "activeUser": "George" }
or { "activeUser": null }.

POST /api/status
Body:

JSON
{ "user": "George", "action": "enter" }
or:

JSON
{ "user": "George", "action": "leave" }
Returns the updated { "activeUser" }. Responds with 409 if another user is already active.
