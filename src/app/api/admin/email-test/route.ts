import { type NextRequest, NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase/admin-auth'
import { sendMail } from '@/lib/email/smtp'

export const runtime = 'edge'

/**
 * Admin-only diagnostic endpoint for the Brevo HTTP email pipeline.
 *
 * Sends a test email to the authenticated admin's address via the
 * transport in src/lib/email/smtp.ts (Brevo HTTP API). Returns explicit
 * JSON for each failure mode so missing-key vs Brevo-rejection vs
 * fetch-failure are easy to tell apart.
 *
 * GET /api/admin/email-test
 *  → 401 if not signed in as admin
 *  → 500 with diagnostic message if BREVO_API_KEY missing or send fails
 *  → 200 with { ok: true, id, sentTo } on success
 *
 * Query params:
 *   ?mode=booking   send a larger booking-confirmation-style payload to
 *                   surface failures specific to bigger HTML bodies
 */
export async function GET(_request: NextRequest) {
  const supabase = createAdminSupabaseClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user || !user.email) {
    return NextResponse.json(
      { ok: false, reason: 'unauthenticated', message: 'Sign in as admin first.' },
      { status: 401 }
    )
  }

  if (!process.env.BREVO_API_KEY) {
    return NextResponse.json(
      {
        ok: false,
        reason: 'missing_brevo_api_key',
        message: 'BREVO_API_KEY is not set in Cloudflare Pages env vars. Set it in Cloudflare Dashboard → Pages → fotografosantodomingo → Settings → Environment Variables for both Production AND Preview, then redeploy.',
      },
      { status: 500 }
    )
  }

  const url = new URL(_request.url)
  const mode = url.searchParams.get('mode') ?? 'simple'
  const subject =
    mode === 'booking'
      ? 'Brevo booking-confirmation simulation'
      : 'Brevo email pipeline test — Babula Shots'

  const bookingStyleHtml = `
    <div style="font-family:Arial,sans-serif;background:#f8fafc;padding:24px 12px">
      <div style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:14px;overflow:hidden">
        <div style="background:linear-gradient(135deg,#0ea5e9,#0369a1);padding:22px 24px;text-align:center">
          <p style="margin:0;color:#e0f2fe;font-size:12px;letter-spacing:.08em;text-transform:uppercase;font-weight:700">Babula Shots</p>
          <h2 style="margin:8px 0 0;color:#ffffff;font-size:22px;line-height:1.2">Booking Confirmation Simulation</h2>
        </div>
        <div style="padding:20px 24px;color:#334155;line-height:1.6">
          <p>This is a simulation of the booking-confirmation HTML body to confirm Brevo accepts the larger payload.</p>
          <table style="width:100%;border-collapse:collapse;font-size:14px;margin:14px 0">
            <tr><td style="padding:6px 0;color:#64748b;width:140px">Service</td><td style="padding:6px 0;font-weight:600;color:#0f172a">Test Wedding Coverage</td></tr>
            <tr><td style="padding:6px 0;color:#64748b">Date</td><td style="padding:6px 0;font-weight:600;color:#0f172a">Sample Date</td></tr>
            <tr><td style="padding:6px 0;color:#64748b">Time</td><td style="padding:6px 0;font-weight:600;color:#0f172a">10:00 – 14:00 AST</td></tr>
            <tr><td style="padding:6px 0;color:#64748b">Photographer</td><td style="padding:6px 0;color:#334155">Michal Babula</td></tr>
          </table>
          <div style="margin-top:16px;padding:14px 16px;background:#ecfdf5;border:1px solid #a7f3d0;border-radius:10px">
            <p style="margin:0;color:#065f46;font-size:13px">Deposit paid: $450 USD · Balance: $450 USD</p>
          </div>
          <p style="margin-top:16px;font-size:14px">Sent at: ${new Date().toISOString()}</p>
        </div>
        <div style="padding:14px 24px;border-top:1px solid #e2e8f0;background:#f8fafc;text-align:center">
          <p style="margin:0;color:#94a3b8;font-size:12px">Babula Shots · Santo Domingo, República Dominicana</p>
        </div>
      </div>
    </div>`

  const simpleHtml = `<p>Hello,</p>
<p>If you're reading this, the Brevo HTTP API transport is working from Cloudflare Pages — booking confirmations, quote-request notifications, contact form submissions, and newsletter welcomes will all deliver from the same configuration.</p>
<p>Configuration in use:</p>
<ul>
  <li>Provider: Brevo HTTP API (api.brevo.com/v3/smtp/email)</li>
  <li>From: <code>${process.env.EMAIL_FROM_ADDRESS ?? process.env.SMTP_FROM_EMAIL ?? 'noreply@fotografosantodomingo.com'}</code></li>
  <li>Sender name: <code>${process.env.EMAIL_FROM_NAME ?? 'Babula Shots'}</code></li>
</ul>
<p>Sent at: ${new Date().toISOString()}</p>`

  const result = await sendMail({
    to: user.email,
    ...(mode === 'booking' ? { replyTo: user.email } : {}),
    subject,
    html: mode === 'booking' ? bookingStyleHtml : simpleHtml,
  })

  if (!result.ok) {
    return NextResponse.json(
      {
        ok: false,
        reason: 'brevo_rejected',
        message: `Brevo send failed: ${result.error ?? 'unknown error'}. Common causes: sender domain DNS not yet verified (DKIM/SPF still propagating), API key revoked or wrong scope, or daily quota reached. Check Cloudflare Pages function logs for the [email/transport] error and verify the Brevo dashboard.`,
        brevoError: result.error,
      },
      { status: 500 }
    )
  }

  return NextResponse.json({
    ok: true,
    id: result.id,
    sentTo: user.email,
    message: 'Test email sent via Brevo HTTP API. Check your inbox (and spam folder). If it arrives, all email paths will work.',
  })
}
