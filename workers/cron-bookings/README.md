# cron-bookings — Cloudflare Worker

Hourly cron trigger that calls `/api/cron/booking-reminders` on the main app
to dispatch booking reminder emails.

## What it does

The Next.js app deploys to **Cloudflare Pages**, which has no native cron.
This standalone **Worker** uses `[triggers].crons` to fire every hour, and
makes one authenticated HTTP request to the app endpoint. All booking +
email logic lives in the Next.js side; the worker is a 50-line shim.

## One-time setup

```bash
cd workers/cron-bookings
npm install
npx wrangler login            # if you haven't already
npx wrangler deploy           # deploys the worker

# Set the two secrets the worker needs to call your app
npx wrangler secret put CRON_SECRET    # paste the same value you set in Cloudflare Pages env
npx wrangler secret put APP_URL        # paste:  https://www.fotografosantodomingo.com
```

## Verifying connectivity (smoke test)

After deploy, trigger the worker manually with curl. The worker URL is shown
at the end of `wrangler deploy` (something like
`https://cron-bookings.<your-account>.workers.dev`).

```bash
curl -H "authorization: Bearer <CRON_SECRET>" https://cron-bookings.<your>.workers.dev
```

Expected response:

```json
{
  "ok": true,
  "status": 200,
  "body": {
    "ok": true,
    "stale_released": 0,
    "reminder_24h_sent": 0,
    "reminder_same_day_sent": 0,
    "post_session_sent": 0,
    "errors": []
  }
}
```

If `status` is 401 → `CRON_SECRET` mismatch between the worker and the Pages app.
If `status` is 500 with "Cron secret not configured" → the Pages app is missing `CRON_SECRET`.

## Watching it run

```bash
npx wrangler tail
```

Streams logs each time the cron fires (top of every hour) or you hit the
manual endpoint.

## Schedule

```toml
[triggers]
crons = ["0 * * * *"]    # hourly at :00
```

The Next.js endpoint then handles all three reminder types in one pass:

- **24h reminder** — bookings starting in 23–25h
- **Same-day reminder** — today's bookings, only fires after 8:00 AST
- **Post-session** — bookings whose ends_at was 2-4h ago, includes Google
  Review CTA

Each booking is gated by a flag column (`reminder_24h_sent`,
`reminder_same_day_sent`, `post_session_sent`) so duplicate cron firings
won't re-send emails.
