import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { sendMail } from '@/lib/email/smtp'
import { getAdminRecipients } from '@/lib/email/admin-recipients'

export const runtime = 'edge'

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.fotografosantodomingo.com'

/**
 * 1x1 tracking pixel for the auto-generated final quote EMAIL (see
 * sendCustomerFinalQuoteEmail in src/lib/email/quote-proposal.ts) — separate
 * signal from ../ping/route.ts, which only fires once the customer clicks
 * through to the hosted /quotations/[slug] page. This fires as soon as their
 * mail client renders the email, whether or not they ever click anything.
 */
export async function GET(
  _req: NextRequest,
  { params }: { params: { slug: string } }
) {
  const { slug } = params
  if (!slug) return new NextResponse(null, { status: 400 })

  const supabase = createServiceClient()

  const { data: quote, error } = await supabase
    .from('quotes')
    .select('id, full_name, service_type, email_opened_at, whatsapp_phone, email')
    .eq('proposal_slug', slug)
    .single()

  if (error || !quote) return new NextResponse(null, { status: 404 })

  if (!quote.email_opened_at) {
    await supabase
      .from('quotes')
      .update({ email_opened_at: new Date().toISOString() })
      .eq('id', quote.id)

    const adminUrl = `${BASE_URL}/admin/quotes/${quote.id}`
    const clientName = quote.full_name ?? 'Cliente'
    const service = quote.service_type?.replace(/_/g, ' ') ?? 'Photography service'
    const waPhone = quote.whatsapp_phone?.replace(/\D/g, '') ?? null

    const cardRows = [
      { label: 'CLIENTE', value: clientName },
      { label: 'SERVICIO', value: service },
      ...(quote.email ? [{ label: 'EMAIL', value: `<a href="mailto:${quote.email}" style="color:#c8a96e;text-decoration:none">${quote.email}</a>` }] : []),
      ...(quote.whatsapp_phone ? [{ label: 'WHATSAPP', value: quote.whatsapp_phone }] : []),
    ]

    const card = `
      <table style="width:100%;border-collapse:collapse;background:#1a1815;border:1px solid #2e2c29;margin:20px 0">
        ${cardRows.map((r, i) => `
          <tr>
            <td bgcolor="#1a1815" style="padding:11px 20px;${i < cardRows.length - 1 ? 'border-bottom:1px solid #2e2c29;' : ''}color:#8a8680;font-size:12px;letter-spacing:.03em;width:46%">${r.label}</td>
            <td bgcolor="#1a1815" style="padding:11px 20px;${i < cardRows.length - 1 ? 'border-bottom:1px solid #2e2c29;' : ''}color:#f0ede6;font-size:14px">${r.value}</td>
          </tr>
        `).join('')}
      </table>`

    await sendMail({
      to: getAdminRecipients(),
      subject: `📧 ${clientName} just opened your quote email`,
      html: `
        <div style="font-family:Arial,'Helvetica Neue',Helvetica,sans-serif;background:#0e0e0d;padding:24px 12px">
          <div style="max-width:640px;margin:0 auto;background:#161513;border:1px solid #2e2c29;overflow:hidden">
            <div style="background:#c8a96e;height:3px;font-size:1px;line-height:1px;">&nbsp;</div>
            <div style="background:#111110;padding:32px 28px;text-align:center;border-bottom:1px solid #2e2c29">
              <p style="margin:0 0 14px;color:#c8a96e;font-size:10px;letter-spacing:.4em;text-transform:uppercase;font-weight:700">BABULA SHOTS</p>
              <h2 style="margin:0;color:#f0ede6;font-size:24px;line-height:1.3;font-weight:400;letter-spacing:.03em">Quote email opened</h2>
              <p style="margin:12px 0 0;color:#8a8680;font-size:14px">${clientName} just opened the quote you sent — they haven't clicked through yet</p>
            </div>
            <div style="background:#111110;padding:30px 28px 36px">
              ${card}
              <table width="100%" cellpadding="0" cellspacing="0" style="margin:26px 0 8px">
                <tr>
                  <td align="center">
                    <a href="${adminUrl}" style="display:inline-block;background:#c8a96e;color:#0e0e0d;padding:13px 30px;text-decoration:none;font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase">
                      View quote →
                    </a>
                    ${waPhone ? `&nbsp;&nbsp;<a href="https://wa.me/${waPhone}" style="display:inline-block;background:transparent;border:1px solid #c8a96e;color:#c8a96e;padding:12px 24px;text-decoration:none;font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase">WhatsApp ↗</a>` : ''}
                  </td>
                </tr>
              </table>
            </div>
            <div style="background:#0a0a09;border-top:1px solid #2e2c29;padding:18px 28px;text-align:center">
              <p style="margin:0;color:#3d3b38;font-size:11px;letter-spacing:.06em;text-transform:uppercase;line-height:2.2">
                BABULA SHOTS &nbsp;·&nbsp; SANTO DOMINGO, REPÚBLICA DOMINICANA<br>
                <a href="https://www.fotografosantodomingo.com" style="color:#5a5753;text-decoration:none">fotografosantodomingo.com</a>
              </p>
            </div>
          </div>
        </div>
      `,
    }).catch(err => console.error('[email-open] admin notification failed:', err))
  }

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
