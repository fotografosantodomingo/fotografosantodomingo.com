import nodemailer from 'nodemailer'

const FROM_EMAIL = process.env.SMTP_FROM_EMAIL || 'info@fotografosantodomingo.com'
const FROM = `Fotografo Santo Domingo <${FROM_EMAIL}>`
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || FROM_EMAIL

function getTransporter() {
  const pass = process.env.SMTP_PASSWORD
  if (!pass) return null
  return nodemailer.createTransport({
    host: 'smtp.hostinger.com',
    port: 465,
    secure: true, // SSL
    auth: {
      user: FROM_EMAIL,
      pass,
    },
  })
}

export interface ContactData {
  id: string
  name: string
  email: string
  phone?: string | null
  service?: string | null
  message: string
  eventDate?: string | null
  location?: string | null
  submittedAt: string
  locale: string
}

export async function sendContactNotification(data: ContactData) {
  const transporter = getTransporter()
  if (!transporter) {
    console.warn('SMTP_PASSWORD not set — email notification skipped')
    return
  }

  const serviceLabel = data.service
    ? data.service.charAt(0).toUpperCase() + data.service.slice(1)
    : 'Not specified'

  await transporter.sendMail({
    from: FROM,
    to: ADMIN_EMAIL,
    replyTo: data.email,
    subject: `📸 Nueva consulta de ${data.name} — ${serviceLabel}`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
        <h2 style="color:#0f172a;border-bottom:2px solid #0ea5e9;padding-bottom:12px">
          Nueva Consulta — Fotógrafo Santo Domingo
        </h2>
        <table style="width:100%;border-collapse:collapse">
          <tr><td style="padding:8px 0;color:#64748b;width:140px">Nombre</td>
              <td style="padding:8px 0;font-weight:600">${data.name}</td></tr>
          <tr><td style="padding:8px 0;color:#64748b">Email</td>
              <td style="padding:8px 0"><a href="mailto:${data.email}">${data.email}</a></td></tr>
          ${data.phone ? `<tr><td style="padding:8px 0;color:#64748b">Teléfono</td>
              <td style="padding:8px 0"><a href="tel:${data.phone}">${data.phone}</a></td></tr>` : ''}
          <tr><td style="padding:8px 0;color:#64748b">Servicio</td>
              <td style="padding:8px 0">${serviceLabel}</td></tr>
          ${data.eventDate ? `<tr><td style="padding:8px 0;color:#64748b">Fecha evento</td>
              <td style="padding:8px 0">${data.eventDate}</td></tr>` : ''}
          ${data.location ? `<tr><td style="padding:8px 0;color:#64748b">Ubicación</td>
              <td style="padding:8px 0">${data.location}</td></tr>` : ''}
        </table>
        <div style="background:#f8fafc;border-left:4px solid #0ea5e9;padding:16px;margin-top:16px;border-radius:4px">
          <p style="margin:0;color:#0f172a;white-space:pre-wrap">${data.message}</p>
        </div>
        <p style="margin-top:24px">
          <a href="mailto:${data.email}?subject=Re: su consulta fotográfica"
             style="background:#0ea5e9;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600">
            Responder ahora
          </a>
          &nbsp;
          <a href="https://wa.me/1${data.phone?.replace(/\D/g, '') || ''}"
             style="background:#22c55e;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600">
            WhatsApp
          </a>
        </p>
        <p style="color:#94a3b8;font-size:12px;margin-top:24px">
          Enviado el ${new Date(data.submittedAt).toLocaleString('es-DO')} · ID: ${data.id}
        </p>
      </div>
    `,
  })
}

export async function sendContactConfirmation(data: ContactData) {
  const transporter = getTransporter()
  if (!transporter) return

  const isEs = data.locale === 'es'

  await transporter.sendMail({
    from: FROM,
    to: data.email,
    subject: isEs
      ? '✅ Recibimos tu mensaje — Fotógrafo Santo Domingo'
      : '✅ We received your message — Photographer Santo Domingo',
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
        <h2 style="color:#0f172a">
          ${isEs ? `Hola ${data.name},` : `Hi ${data.name},`}
        </h2>
        <p style="color:#374151;line-height:1.6">
          ${isEs
            ? 'Gracias por contactarme. Recibí tu mensaje y te responderé en las próximas 2-4 horas.'
            : 'Thank you for reaching out. I received your message and will reply within 2-4 hours.'}
        </p>
        <div style="background:#f0f9ff;border-left:4px solid #0ea5e9;padding:16px;border-radius:4px;margin:20px 0">
          <p style="margin:0;color:#0f172a;white-space:pre-wrap">${data.message}</p>
        </div>
        <p style="color:#374151">
          ${isEs
            ? 'Si necesitas una respuesta más rápida, escríbeme directamente por WhatsApp:'
            : 'For a faster response, message me directly on WhatsApp:'}
        </p>
        <p>
          <a href="https://wa.me/18097209547"
             style="background:#22c55e;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600">
            WhatsApp: +1 (809) 720-9547
          </a>
        </p>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0"/>
        <p style="color:#94a3b8;font-size:13px">
          Fotógrafo Santo Domingo — Babula Shots<br/>
          Santo Domingo, República Dominicana<br/>
          <a href="https://www.fotografosantodomingo.com" style="color:#0ea5e9">fotografosantodomingo.com</a>
        </p>
      </div>
    `,
  })
}

export async function sendNewsletterWelcome(data: {
  email: string
  name?: string
  locale?: string
}) {
  const transporter = getTransporter()
  if (!transporter) return

  const isEs = (data.locale ?? 'es') === 'es'
  const greeting = data.name ? (isEs ? `Hola ${data.name}` : `Hi ${data.name}`) : (isEs ? 'Hola' : 'Hi there')

  await transporter.sendMail({
    from: FROM,
    to: data.email,
    subject: isEs
      ? '📸 Bienvenido/a al boletín de Fotógrafo Santo Domingo'
      : '📸 Welcome to Photographer Santo Domingo newsletter',
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
        <h2 style="color:#0f172a">${greeting} 👋</h2>
        <p style="color:#374151;line-height:1.6">
          ${isEs
            ? 'Gracias por suscribirte. Recibirás tips de fotografía, behind-the-scenes de sesiones y ofertas exclusivas.'
            : 'Thanks for subscribing. You\'ll receive photography tips, behind-the-scenes content, and exclusive offers.'}
        </p>
        <p>
          <a href="https://www.fotografosantodomingo.com/${data.locale ?? 'es'}/portfolio"
             style="background:#0ea5e9;color:white;padding:12px 24px;border-radius:6px;text-decoration:none;font-weight:600">
            ${isEs ? 'Ver portafolio' : 'View portfolio'}
          </a>
        </p>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0"/>
        <p style="color:#94a3b8;font-size:13px">
          Fotógrafo Santo Domingo — Babula Shots<br/>
          <a href="https://www.fotografosantodomingo.com" style="color:#0ea5e9">fotografosantodomingo.com</a>
        </p>
      </div>
    `,
  })
}
