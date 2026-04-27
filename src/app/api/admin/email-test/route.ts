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

  const result = await sendMail({
    to: user.email,
    subject: 'SMTP email pipeline test — Hostinger via worker-mailer',
    html: `<p>Hello,</p>
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
