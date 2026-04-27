import { type NextRequest, NextResponse } from 'next/server'
import { createAdminSupabaseClient } from '@/lib/supabase/admin-auth'
import { Resend } from 'resend'

export const runtime = 'edge'

/**
 * Admin-only diagnostic endpoint for the Resend email pipeline.
 *
 * Sends a test email to the authenticated admin's email address and
 * returns the Resend response (or the failure reason). Use this after
 * setting RESEND_API_KEY in Cloudflare Pages env vars to confirm the
 * key works and the domain is verified.
 *
 * GET /api/admin/email-test
 *  → 401 if not signed in as admin
 *  → 500 with diagnostic message if RESEND_API_KEY missing or send fails
 *  → 200 with { ok: true, id: 'resend-message-id', sentTo: '...' } on success
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

  if (!process.env.RESEND_API_KEY) {
    return NextResponse.json(
      {
        ok: false,
        reason: 'missing_api_key',
        message: 'RESEND_API_KEY is NOT set in Cloudflare Pages env vars. This is why no emails are being sent. Set it in Cloudflare Dashboard → Pages → fotografosantodomingo → Settings → Environment Variables for both Production AND Preview, then redeploy.',
      },
      { status: 500 }
    )
  }

  const client = new Resend(process.env.RESEND_API_KEY)

  try {
    const result = await client.emails.send({
      from: 'Babula Shots <noreply@fotografosantodomingo.com>',
      to: user.email,
      subject: 'Email pipeline test — RESEND_API_KEY works',
      html: `<p>Hello,</p>
<p>If you're reading this, your <code>RESEND_API_KEY</code> is correctly set in Cloudflare Pages and the <code>fotografosantodomingo.com</code> sender domain is verified in Resend.</p>
<p>Booking confirmations, quote-request notifications, and newsletter welcomes will all deliver from the same configuration.</p>
<p>Sent at: ${new Date().toISOString()}</p>`,
    })

    if (result.error) {
      return NextResponse.json(
        {
          ok: false,
          reason: 'resend_rejected',
          message: `Resend API rejected the send. This usually means the sender domain isn't verified or the API key is invalid. Resend error: ${result.error.message}`,
          resendError: result.error,
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      ok: true,
      id: result.data?.id ?? null,
      sentTo: user.email,
      message: 'Test email sent. Check your inbox (and spam folder). If it arrives, all email paths will work.',
    })
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e)
    return NextResponse.json(
      {
        ok: false,
        reason: 'exception',
        message: `Unexpected error sending test email: ${msg}`,
      },
      { status: 500 }
    )
  }
}
