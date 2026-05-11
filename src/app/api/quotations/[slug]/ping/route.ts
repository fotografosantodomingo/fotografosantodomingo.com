import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { sendMail } from '@/lib/email/smtp'
import { getAdminRecipients } from '@/lib/email/admin-recipients'

export const runtime = 'edge'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.fotografosantodomingo.com'

export async function GET(
  _req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const { slug } = params
  if (!slug) {
    return new NextResponse(null, { status: 400 })
  }

  const supabase = createServiceClient()

  const { data: quote, error } = await supabase
    .from('quotes')
    .select('id, full_name, service_type, first_viewed_at, whatsapp_phone, email')
    .eq('proposal_slug', slug)
    .single()

  if (error || !quote) {
    return new NextResponse(null, { status: 404 })
  }

  // Only fire notification on the very first open
  if (!quote.first_viewed_at) {
    await supabase
      .from('quotes')
      .update({ first_viewed_at: new Date().toISOString() })
      .eq('id', quote.id)

    const proposalUrl = `${BASE_URL}/quotations/${slug}`
    const clientName = quote.full_name ?? 'Cliente'
    const service = quote.service_type?.replace(/_/g, ' ') ?? 'Photography service'

    const waLink = quote.whatsapp_phone
      ? `<a href="https://wa.me/${quote.whatsapp_phone.replace(/\D/g, '')}" style="display:inline-block;background:#22c55e;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none;font-weight:700;margin-top:12px">Abrir WhatsApp ↗</a>`
      : ''

    await sendMail({
      to: getAdminRecipients(),
      subject: `👁 ${clientName} acaba de abrir tu cotización`,
      html: `
        <div style="font-family:Arial,sans-serif;background:#f8fafc;padding:24px 12px">
          <div style="max-width:600px;margin:0 auto;background:#fff;border:1px solid #e2e8f0;border-radius:14px;overflow:hidden">
            <div style="background:linear-gradient(135deg,#0ea5e9,#0369a1);padding:20px 24px">
              <p style="margin:0;color:#e0f2fe;font-size:11px;letter-spacing:.08em;text-transform:uppercase;font-weight:700">Propuesta abierta</p>
              <h2 style="margin:6px 0 0;color:#fff;font-size:20px">${clientName} acaba de ver tu cotización</h2>
            </div>
            <div style="padding:20px 24px">
              <table style="width:100%;font-size:14px;border-collapse:collapse">
                <tr><td style="padding:6px 0;color:#64748b;width:120px">Cliente</td><td style="padding:6px 0;font-weight:700">${clientName}</td></tr>
                <tr><td style="padding:6px 0;color:#64748b">Servicio</td><td style="padding:6px 0">${service}</td></tr>
                ${quote.email ? `<tr><td style="padding:6px 0;color:#64748b">Email</td><td style="padding:6px 0"><a href="mailto:${quote.email}" style="color:#0284c7">${quote.email}</a></td></tr>` : ''}
                ${quote.whatsapp_phone ? `<tr><td style="padding:6px 0;color:#64748b">WhatsApp</td><td style="padding:6px 0">${quote.whatsapp_phone}</td></tr>` : ''}
              </table>
              <div style="margin-top:16px">
                <a href="${proposalUrl}" style="display:inline-block;background:#0ea5e9;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none;font-weight:700">Ver cotización ↗</a>
                ${waLink}
              </div>
              <p style="margin-top:16px;font-size:12px;color:#94a3b8">Este es el momento ideal para hacer seguimiento — están leyendo tu propuesta ahora mismo.</p>
            </div>
          </div>
        </div>
      `,
    }).catch(err => console.error('[ping] email failed:', err))
  }

  // 1×1 transparent GIF so the browser img src request resolves cleanly
  const gif = Uint8Array.from([
    0x47,0x49,0x46,0x38,0x39,0x61,0x01,0x00,0x01,0x00,0x80,0x00,0x00,
    0xff,0xff,0xff,0x00,0x00,0x00,0x21,0xf9,0x04,0x00,0x00,0x00,0x00,
    0x00,0x2c,0x00,0x00,0x00,0x00,0x01,0x00,0x01,0x00,0x00,0x02,0x02,
    0x44,0x01,0x00,0x3b,
  ])

  return new NextResponse(gif, {
    headers: {
      'Content-Type': 'image/gif',
      'Cache-Control': 'no-store, no-cache, must-revalidate',
    },
  })
}
