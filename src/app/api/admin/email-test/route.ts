import { type NextRequest, NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase/admin-auth'
import { sendMail } from '@/lib/email/smtp'

export const runtime = 'edge'

/**
 * Admin-only diagnostic endpoint for the Hostinger SMTP email pipeline.
 *
 * Sends a test email to the authenticated admin's address via the SMTP
 * wrapper (worker-mailer over Cloudflare TCP sockets). Returns explicit
 * JSON for each failure mode so missing-creds vs auth-rejected vs
 * connect-timeout are easy to tell apart.
 *
 * GET /api/admin/email-test
 *  → 401 if not signed in as admin
 *  → 500 with diagnostic message if SMTP_PASSWORD missing or send fails
 *  → 200 with { ok: true, id, sentTo } on success
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

  if (!process.env.SMTP_PASSWORD) {
    return NextResponse.json(
      {
        ok: false,
        reason: 'missing_smtp_password',
        message: 'SMTP_PASSWORD is NOT set in Cloudflare Pages env vars. This is why no emails are being sent. Set SMTP_PASSWORD (Hostinger mailbox password) in Cloudflare Dashboard → Pages → fotografosantodomingo → Settings → Environment Variables for both Production AND Preview, then redeploy.',
      },
      { status: 500 }
    )
  }

  // Determine which test mode based on ?mode= query param.
  // Default = simple HTML; mode=booking = larger HTML + replyTo to
  // mimic the actual booking confirmation send and surface failures
  // that affect that specific code path.
  const url = new URL(_request.url)
  const mode = url.searchParams.get('mode') ?? 'simple'
  const subject =
    mode === 'booking'
      ? 'SMTP booking-confirmation simulation'
      : 'SMTP email pipeline test — Hostinger via worker-mailer'
  const bookingStyleHtml = `
    <div style="font-family:Arial,sans-serif;background:#f8fafc;padding:24px 12px">
      <div style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:14px;overflow:hidden">
        <div style="background:linear-gradient(135deg,#0ea5e9,#0369a1);padding:22px 24px;text-align:center">
          <p style="margin:0;color:#e0f2fe;font-size:12px;letter-spacing:.08em;text-transform:uppercase;font-weight:700">Babula Shots</p>
          <h2 style="margin:8px 0 0;color:#ffffff;font-size:22px;line-height:1.2">SMTP Booking Confirmation Simulation</h2>
        </div>
        <div style="padding:20px 24px;color:#334155;line-height:1.6">
          <p>This is a simulation of the booking-confirmation HTML body to surface any SMTP rejection that is specific to the larger payload.</p>
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
  const result = await sendMail({
    to: user.email,
    ...(mode === 'booking' ? { replyTo: user.email } : {}),
    subject,
    html:
      mode === 'booking'
        ? bookingStyleHtml
        : `<p>Hello,</p>
<p>If you're reading this, your Hostinger SMTP credentials are correct, the <code>cloudflare:sockets</code> TCP connection is working, and the <code>worker-mailer</code> path on Cloudflare Pages is functional.</p>
<p>Configuration in use:</p>
<ul>
  <li>Host: <code>${process.env.SMTP_HOST ?? 'smtp.hostinger.com'}</code></li>
  <li>Port: <code>${process.env.SMTP_PORT ?? '465'}</code></li>
  <li>User: <code>${process.env.SMTP_USER ?? process.env.SMTP_FROM_EMAIL ?? 'noreply@fotografosantodomingo.com'}</code></li>
  <li>From: <code>${process.env.SMTP_FROM_EMAIL ?? 'noreply@fotografosantodomingo.com'}</code></li>
</ul>
<p>Booking confirmations, quote-request notifications, contact form submissions, and newsletter welcomes will all deliver from the same configuration.</p>
<p>Sent at: ${new Date().toISOString()}</p>`,
  })

  if (!result.ok) {
    return NextResponse.json(
      {
        ok: false,
        reason: 'smtp_failed',
        message: `SMTP send failed: ${result.error ?? 'unknown error'}. Check Hostinger mailbox password, sender domain MX/SPF, and Cloudflare Pages function logs for the underlying [email/smtp] error.`,
        smtpError: result.error,
      },
      { status: 500 }
    )
  }

  return NextResponse.json({
    ok: true,
    id: result.id,
    sentTo: user.email,
    message: 'Test email sent via Hostinger SMTP. Check your inbox (and spam folder). If it arrives, all email paths will work.',
  })
}
