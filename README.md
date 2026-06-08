# Webflow Status Dashboard

A single-page Astro app that shows who is currently using Webflow. Status is shared across all visitors via Vercel KV (or Upstash Redis on Vercel).

## Users

- George
- Arianne
- Jep

## How it works

- Click **I'm in Webflow** to claim the seat.
- Click **Leave Webflow** (same button when you are active) to release it.
- If someone else is active, other buttons are disabled.
- The page polls `/api/status` every 2 seconds so everyone sees updates quickly.

## Local development

1. Install dependencies:

   ```bash
   npm install
   ```

2. Link the project to Vercel and add a Redis/KV store:

   ```bash
   npx vercel link
   ```

   In the Vercel dashboard: **Storage → Create → Redis** (or an existing KV/Upstash store), then link it to this project.

3. Pull environment variables:

   ```bash
   npx vercel env pull .env.local
   ```

4. Run the dev server:

   ```bash
   npm run dev
   ```

   For API routes with KV, prefer:

   ```bash
   npx vercel dev
   ```

## Deploy

1. Push to GitHub and import the repo in Vercel.
2. Create and link a Redis/KV store to the project.
3. Deploy. Vercel injects `KV_REST_API_URL` and `KV_REST_API_TOKEN` automatically.

## Environment variables

| Variable | Description |
|---|---|
| `KV_REST_API_URL` | REST URL for Vercel KV / Upstash Redis |
| `KV_REST_API_TOKEN` | Auth token for the store |

Copy `.env.example` to `.env.local` and fill in values when testing locally.

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
