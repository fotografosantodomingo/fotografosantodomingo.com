/**
 * Cloudflare Worker — Booking reminders cron trigger.
 *
 * On the schedule defined in wrangler.toml (hourly), this worker calls
 * `${APP_URL}/api/cron/booking-reminders` with `Authorization: Bearer ${CRON_SECRET}`.
 * The Next.js endpoint does the actual work (DB query + Resend sends).
 *
 * Why a separate Worker?
 *   The main app deploys to Cloudflare Pages, which doesn't support cron
 *   triggers natively. A standalone Worker with a `[triggers].crons` schedule
 *   is the cleanest pattern.
 *
 * Manual trigger (smoke test): GET / on the worker URL with the same bearer
 * token will run the same logic. Useful for verifying connectivity before the
 * cron actually fires.
 */

export interface Env {
  CRON_SECRET: string
  APP_URL: string
}

async function runCron(env: Env): Promise<{ ok: boolean; status: number; body: unknown }> {
  if (!env.CRON_SECRET || !env.APP_URL) {
    return {
      ok: false,
      status: 500,
      body: { error: 'CRON_SECRET or APP_URL not configured on the worker' },
    }
  }

  const target = `${env.APP_URL.replace(/\/$/, '')}/api/cron/booking-reminders`

  let res: Response
  try {
    res = await fetch(target, {
      method: 'GET',
      headers: {
        authorization: `Bearer ${env.CRON_SECRET}`,
        'user-agent': 'cron-bookings-worker/1',
      },
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    return { ok: false, status: 0, body: { error: `fetch failed: ${msg}` } }
  }

  let body: unknown
  try {
    body = await res.json()
  } catch {
    body = await res.text().catch(() => null)
  }

  return { ok: res.ok, status: res.status, body }
}

export default {
  // Cron handler — fired by `[triggers].crons`
  async scheduled(_event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    ctx.waitUntil(
      (async () => {
        const result = await runCron(env)
        // Logs surface in `wrangler tail` and Cloudflare dashboard
        console.log(JSON.stringify({ source: 'cron', ...result }))
      })()
    )
  },

  // Manual trigger — `curl -H "authorization: Bearer <CRON_SECRET>" https://cron-bookings.<your>.workers.dev`
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url)
    if (url.pathname !== '/' && url.pathname !== '') {
      return new Response('not found', { status: 404 })
    }
    const auth = req.headers.get('authorization') ?? ''
    if (!env.CRON_SECRET || auth !== `Bearer ${env.CRON_SECRET}`) {
      return new Response('unauthorized', { status: 401 })
    }
    const result = await runCron(env)
    return Response.json(result, { status: result.ok ? 200 : 502 })
  },
}
