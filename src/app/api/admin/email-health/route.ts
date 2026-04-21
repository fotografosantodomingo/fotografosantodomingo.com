import { NextRequest, NextResponse } from 'next/server'
import nodemailer from 'nodemailer'

export const runtime = 'nodejs'

function isAuthorized(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const expectedSecret = process.env.ADMIN_SECRET

  if (!authHeader?.startsWith('Bearer ') || !expectedSecret) {
    return false
  }

  const token = authHeader.slice('Bearer '.length)
  return token === expectedSecret
}

function getSmtpConfig() {
  const host = process.env.SMTP_HOST || 'smtp.hostinger.com'
  const port = Number(process.env.SMTP_PORT || 465)
  const secure = (process.env.SMTP_SECURE || 'true').toLowerCase() !== 'false'
  const user = process.env.SMTP_USER
  const pass = process.env.SMTP_PASS || process.env.SMTP_PASSWORD

  return { host, port, secure, user, pass }
}

function maskEmail(value?: string) {
  if (!value) return null
  const [name, domain] = value.split('@')
  if (!domain) return '***'
  const head = name.length > 2 ? name.slice(0, 2) : name.slice(0, 1)
  return `${head}***@${domain}`
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { host, port, secure, user, pass } = getSmtpConfig()
  const adminEmail = process.env.ADMIN_EMAIL || 'info@fotografosantodomingo.com'

  let to = adminEmail
  try {
    const body = await request.json().catch(() => null)
    if (body?.to && typeof body.to === 'string') {
      to = body.to.trim()
    }
  } catch {
    // Ignore malformed body and keep default recipient.
  }

  if (!user || !pass) {
    return NextResponse.json(
      {
        ok: false,
        error: 'SMTP credentials are missing',
        config: {
          host,
          port,
          secure,
          user: maskEmail(user),
          hasPassword: Boolean(pass),
        },
      },
      { status: 500 },
    )
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port,
      secure,
      auth: { user, pass },
    })

    await transporter.verify()

    const from = `Babula Shots <${user}>`
    const info = await transporter.sendMail({
      from,
      to,
      subject: `SMTP Health Check - ${new Date().toISOString()}`,
      html: `
        <div style="font-family:Arial,sans-serif;line-height:1.5">
          <h2>SMTP Health Check OK</h2>
          <p>This is a test email from fotografosantodomingo.com.</p>
          <p><strong>Host:</strong> ${host}:${port}</p>
          <p><strong>Secure:</strong> ${secure ? 'true' : 'false'}</p>
          <p><strong>Time:</strong> ${new Date().toISOString()}</p>
        </div>
      `,
    })

    return NextResponse.json({
      ok: true,
      messageId: info.messageId,
      accepted: info.accepted,
      rejected: info.rejected,
      config: {
        host,
        port,
        secure,
        user: maskEmail(user),
      },
    })
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        error: error?.message || 'SMTP test failed',
        code: error?.code || null,
        response: error?.response || null,
        config: {
          host,
          port,
          secure,
          user: maskEmail(user),
        },
      },
      { status: 500 },
    )
  }
}
