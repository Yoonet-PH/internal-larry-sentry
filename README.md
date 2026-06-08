# Webflow Status Dashboard

A single-page Astro app that shows who is currently using Webflow. Status is shared across all visitors via Neon Postgres.

## Users

- George
- Arianne
- Jep

## How it works

- Click **I'm in Webflow** to claim the seat.
- Click **Leave Webflow** (same button when you are active) to release it.
- If someone else is active, other buttons are disabled.
- The page polls `/api/status` every 2 seconds so everyone sees updates quickly.

## Neon setup

1. Create a project at [console.neon.tech](https://console.neon.tech).
2. Open **SQL Editor** and run the script in [`db/schema.sql`](db/schema.sql).
3. Go to **Dashboard → Connect** and copy the **connection string**.
   - For Vercel/serverless, use the **pooled** connection string.
4. Set it as `DATABASE_URL` in `.env.local` (and in Vercel env vars when deploying).

## Local development

1. Install dependencies:

   ```bash
   npm install
   ```

2. Copy env vars:

   ```bash
   cp .env.example .env.local
   ```

   Paste your Neon `DATABASE_URL` into `.env.local`.

3. Run the dev server:

   ```bash
   npm run dev
   ```

## Deploy (Vercel)

1. Push to GitHub and import the repo in Vercel.
2. Add `DATABASE_URL` in **Project Settings → Environment Variables** (use the pooled Neon connection string).
3. Optionally link Neon via the [Vercel Marketplace integration](https://vercel.com/marketplace/neon) to auto-inject the variable.
4. Deploy.

## Environment variables

| Variable | Description |
|---|---|
| `DATABASE_URL` | Neon Postgres connection string (server-only; never expose to the browser) |

## API

### `GET /api/status`

Returns:

```json
{ "activeUser": "George" }
```

or `{ "activeUser": null }`.

### `POST /api/status`

Body:

```json
{ "user": "George", "action": "enter" }
```

or:

```json
{ "user": "George", "action": "leave" }
```

Returns the updated `{ "activeUser" }`. Responds with `409` if another user is already active.
