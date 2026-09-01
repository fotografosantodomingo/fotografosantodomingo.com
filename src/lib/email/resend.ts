/**
 * Contact / newsletter / quote-submission / proposal email senders.
 *
 * Renamed-but-not-renamed: the file is still called resend.ts to avoid
 * touching every import site in the app, but the actual transport is now
 * Hostinger SMTP via worker-mailer (see ./smtp.ts). The public function
 * names + signatures are unchanged.
 */

import { sendMail } from './smtp'
import { getAdminRecipients } from './admin-recipients'

export const FROM = 'Babula Shots <noreply@fotografosantodomingo.com>'

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
  const serviceLabel = data.service
    ? data.service.charAt(0).toUpperCase() + data.service.slice(1)
    : 'Not specified'

  await sendMail({
    from: FROM,
    to: getAdminRecipients(),
    replyTo: data.email,
    subject: `📸 Nueva consulta de ${data.name} — ${serviceLabel}`,
    html: `
      <div style="font-family:Arial,'Helvetica Neue',Helvetica,sans-serif;background:#f8fafc;padding:24px 12px">
        <div style="max-width:680px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:14px;overflow:hidden">
          <div style="background:linear-gradient(135deg,#0ea5e9,#0369a1);padding:22px 24px">
            <p style="margin:0;color:#e0f2fe;font-size:12px;letter-spacing:.08em;text-transform:uppercase;font-weight:700">Admin Alert</p>
            <h2 style="margin:8px 0 0;color:#ffffff;font-size:22px;line-height:1.2">Nueva consulta recibida</h2>
            <p style="margin:10px 0 0;color:#e0f2fe;font-size:14px">${data.name} · ${serviceLabel}</p>
          </div>

          <div style="padding:20px 24px">
            <table style="width:100%;border-collapse:collapse;font-size:14px">
              <tr>
                <td style="padding:8px 0;color:#64748b;width:140px">Nombre</td>
                <td style="padding:8px 0;font-weight:700;color:#0f172a">${data.name}</td>
              </tr>
              <tr>
                <td style="padding:8px 0;color:#64748b">Email</td>
                <td style="padding:8px 0"><a href="mailto:${data.email}" style="color:#0284c7;text-decoration:none">${data.email}</a></td>
              </tr>
              ${data.phone ? `<tr>
                <td style="padding:8px 0;color:#64748b">Teléfono</td>
                <td style="padding:8px 0"><a href="tel:${data.phone}" style="color:#0284c7;text-decoration:none">${data.phone}</a></td>
              </tr>` : ''}
              <tr>
                <td style="padding:8px 0;color:#64748b">Servicio</td>
                <td style="padding:8px 0;color:#334155">${serviceLabel}</td>
              </tr>
              ${data.eventDate ? `<tr>
                <td style="padding:8px 0;color:#64748b">Fecha evento</td>
                <td style="padding:8px 0;color:#334155">${data.eventDate}</td>
              </tr>` : ''}
              ${data.location ? `<tr>
                <td style="padding:8px 0;color:#64748b">Ubicación</td>
                <td style="padding:8px 0;color:#334155">${data.location}</td>
              </tr>` : ''}
            </table>

            <div style="margin-top:16px;padding:14px 16px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px">
              <p style="margin:0 0 8px;color:#0f172a;font-size:12px;letter-spacing:.06em;text-transform:uppercase;font-weight:700">Mensaje</p>
              <p style="margin:0;color:#334155;white-space:pre-wrap;line-height:1.6">${data.message}</p>
            </div>

            <div style="margin-top:18px">
              <a href="mailto:${data.email}?subject=Re: su consulta fotográfica"
                 style="display:inline-block;background:#0ea5e9;color:#ffffff;padding:11px 16px;border-radius:8px;text-decoration:none;font-weight:700">
                Responder por email
              </a>
              ${data.phone ? `&nbsp;
              <a href="https://wa.me/1${data.phone.replace(/\D/g, '')}"
                 style="display:inline-block;background:#22c55e;color:#ffffff;padding:11px 16px;border-radius:8px;text-decoration:none;font-weight:700">
                Abrir WhatsApp
              </a>` : ''}
            </div>
          </div>

          <div style="padding:14px 24px;border-top:1px solid #e2e8f0;background:#f8fafc">
            <p style="margin:0;color:#94a3b8;font-size:12px">Enviado el ${new Date(data.submittedAt).toLocaleString('es-DO')} · ID: ${data.id}</p>
          </div>
        </div>
      </div>
    `,
  })
}

export async function sendContactConfirmation(data: ContactData) {
  const isEs = data.locale === 'es'

  await sendMail({
    from: FROM,
    to: data.email,
    subject: isEs
      ? '✅ Recibimos tu mensaje — Fotógrafo Santo Domingo'
      : '✅ We received your message — Photographer Santo Domingo',
    html: `
      <div style="font-family:Arial,'Helvetica Neue',Helvetica,sans-serif;background:#f8fafc;padding:24px 12px">
        <div style="max-width:620px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:14px;overflow:hidden">
          <div style="background:linear-gradient(135deg,#0ea5e9,#0369a1);padding:24px 22px">
            <p style="margin:0;color:#e0f2fe;font-size:12px;letter-spacing:.08em;text-transform:uppercase;font-weight:700">Babula Shots</p>
            <h2 style="margin:8px 0 0;color:#ffffff;font-size:24px;line-height:1.2">${isEs ? 'Recibimos tu consulta' : 'We received your inquiry'}</h2>
            <p style="margin:10px 0 0;color:#e0f2fe;font-size:14px">${isEs ? `Hola ${data.name}, gracias por escribirnos.` : `Hi ${data.name}, thank you for reaching out.`}</p>
          </div>

          <div style="padding:22px">
            <p style="margin:0;color:#334155;line-height:1.65;font-size:15px">
              ${isEs
                ? 'Tu mensaje ya está en nuestra bandeja y te responderemos en un plazo aproximado de 2 a 4 horas con los próximos pasos.'
                : 'Your message is in our inbox and we will respond within approximately 2 to 4 hours with next steps.'}
            </p>

            <div style="margin:18px 0 0;padding:14px 16px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px">
              <p style="margin:0 0 8px;color:#0f172a;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.04em">${isEs ? 'Resumen de tu mensaje' : 'Message summary'}</p>
              <p style="margin:0;color:#334155;white-space:pre-wrap;line-height:1.6">${data.message}</p>
            </div>

            <div style="margin-top:18px">
              <a href="https://wa.me/18097789547"
                 style="display:inline-block;background:#22c55e;color:#ffffff;padding:12px 18px;border-radius:8px;text-decoration:none;font-weight:700">
                ${isEs ? 'WhatsApp directo: +1 (809) 778-9547' : 'Direct WhatsApp: +1 (809) 778-9547'}
              </a>
            </div>
          </div>

          <div style="padding:16px 22px;border-top:1px solid #e2e8f0;background:#f8fafc">
            <p style="margin:0 0 8px;color:#64748b;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.06em">${isEs ? 'Enlaces rápidos' : 'Quick links'}</p>
            <p style="margin:0;font-size:13px;line-height:1.8">
              <a href="https://www.fotografosantodomingo.com/${isEs ? 'es' : 'en'}" style="color:#0284c7;text-decoration:none;font-weight:600">${isEs ? 'Inicio' : 'Home'}</a>
              &nbsp;·&nbsp;
              <a href="https://www.fotografosantodomingo.com/${isEs ? 'es' : 'en'}/portfolio" style="color:#0284c7;text-decoration:none;font-weight:600">${isEs ? 'Portafolio' : 'Portfolio'}</a>
              &nbsp;·&nbsp;
              <a href="https://www.fotografosantodomingo.com/${isEs ? 'es' : 'en'}/services" style="color:#0284c7;text-decoration:none;font-weight:600">${isEs ? 'Servicios' : 'Services'}</a>
              &nbsp;·&nbsp;
              <a href="https://www.fotografosantodomingo.com/${isEs ? 'es' : 'en'}/contact" style="color:#0284c7;text-decoration:none;font-weight:600">${isEs ? 'Contacto' : 'Contact'}</a>
            </p>
            <p style="margin:10px 0 0;color:#94a3b8;font-size:12px">
              Fotógrafo Santo Domingo — Babula Shots · Santo Domingo, República Dominicana
            </p>
          </div>
        </div>
      </div>
    `,
  })
}

export async function sendNewsletterWelcome(data: {
  email: string
  name?: string
  locale?: string
}) {
  const isEs = (data.locale ?? 'es') === 'es'
  const greeting = data.name
    ? (isEs ? `Hola ${data.name}` : `Hi ${data.name}`)
    : (isEs ? 'Hola' : 'Hi there')

  await sendMail({
    from: FROM,
    to: data.email,
    subject: isEs
      ? '📸 Bienvenido/a al boletín de Fotógrafo Santo Domingo'
      : '📸 Welcome to Photographer Santo Domingo newsletter',
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px;background:#ffffff">
        <div style="background:linear-gradient(135deg,#0ea5e9,#6366f1);padding:32px 24px;border-radius:12px;text-align:center;margin-bottom:24px">
          <h1 style="color:white;margin:0;font-size:24px">📸 Babula Shots</h1>
          <p style="color:rgba(255,255,255,0.85);margin:8px 0 0">Fotógrafo Profesional · Santo Domingo, RD</p>
        </div>
        <h2 style="color:#0f172a">${greeting} 👋</h2>
        <p style="color:#374151;line-height:1.6">
          ${isEs
            ? 'Gracias por suscribirte al boletín. Recibirás tips de fotografía, historias detrás de cámaras y ofertas exclusivas directamente en tu bandeja de entrada.'
            : "Thanks for subscribing to the newsletter. You'll receive photography tips, behind-the-scenes stories and exclusive offers straight to your inbox."}
        </p>
        <div style="background:#f0f9ff;border-radius:8px;padding:16px;margin:20px 0">
          <p style="margin:0;color:#0369a1;font-size:14px">
            ${isEs
              ? '📍 Trabajamos en Santo Domingo, Punta Cana y toda República Dominicana.'
              : '📍 We work in Santo Domingo, Punta Cana and all of Dominican Republic.'}
          </p>
        </div>
        <p style="text-align:center;margin:28px 0">
          <a href="https://www.fotografosantodomingo.com/${data.locale ?? 'es'}/portfolio"
             style="background:#0ea5e9;color:white;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;display:inline-block">
            ${isEs ? '🖼️ Ver portafolio' : '🖼️ View portfolio'}
          </a>
        </p>
        <hr style="border:none;border-top:1px solid #e5e7eb;margin:24px 0"/>
        <p style="color:#94a3b8;font-size:12px;text-align:center">
          Fotógrafo Santo Domingo — Babula Shots · C. El Conde 142, Santo Domingo 11111<br/>
          <a href="https://www.fotografosantodomingo.com" style="color:#0ea5e9">fotografosantodomingo.com</a>
          &nbsp;·&nbsp;
          <a href="https://instagram.com/babulashotsrd" style="color:#0ea5e9">@babulashotsrd</a>
        </p>
      </div>
    `,
  })
}

type QuoteEmailPayload = {
  id: string
  locale: string
  serviceType: string
  participantsCount: number
  addDrone: boolean
  eventDate: string
  country: string
  state: string
  city: string
  fullName: string
  email: string
  whatsappPhone: string
  preferredContactMethod: string
  callbackTimePreference?: string | null
  description: string
}

function formatServiceLabel(serviceType: string, locale: string) {
  const labels: Record<string, { es: string; en: string }> = {
    WEDDINGS: { es: 'Bodas', en: 'Weddings' },
    ENGAGEMENT_SESSION: { es: 'Sesion de compromiso', en: 'Engagement Session' },
    QUINCEANERAS: { es: 'Quinceaneras', en: 'Quinceaneras' },
    MATERNITY: { es: 'Maternidad', en: 'Maternity' },
    FAMILY: { es: 'Familiar', en: 'Family' },
    BIRTHDAY_PARTY: { es: 'Fiesta de cumpleanos', en: 'Birthday Party' },
    BAPTISMS: { es: 'Bautizos', en: 'Baptisms' },
    GRADUATION: { es: 'Graduacion', en: 'Graduation' },
    CHILDRENS_SESSIONS: { es: 'Sesiones infantiles', en: "Children's Sessions" },
    ARCHITECTURE: { es: 'Arquitectura', en: 'Architecture' },
    PORTRAITS: { es: 'Retratos', en: 'Portraits' },
    CORPORATE_EVENTS: { es: 'Eventos corporativos', en: 'Corporate Events' },
    CORPORATE_PORTRAITS: { es: 'Retratos corporativos', en: 'Corporate Portraits' },
    FOOD_AND_BEVERAGE: { es: 'Alimentos y bebidas', en: 'Food and Beverage' },
    PRODUCT_PHOTOGRAPHY: { es: 'Fotografía de producto', en: 'Product Photography' },
    VIDEO_PRODUCTION: { es: 'Produccion de video', en: 'Video Production' },
    DRONE_AERIAL: { es: 'Drone aereo', en: 'Drone Aerial' },
    OTHER: { es: 'Otro', en: 'Other' },
  }

  const fallback = serviceType.replace(/_/g, ' ')
  if (!labels[serviceType]) return fallback
  return locale === 'es' ? labels[serviceType].es : labels[serviceType].en
}

export async function sendQuoteSubmissionNotification(data: QuoteEmailPayload) {
  const serviceLabel = formatServiceLabel(data.serviceType, data.locale)

  await sendMail({
    from: FROM,
    to: getAdminRecipients(),
    replyTo: data.email,
    subject: `Nueva solicitud de presupuesto: ${data.fullName} - ${serviceLabel}`,
    html: `
      <div style="font-family:Arial,'Helvetica Neue',Helvetica,sans-serif;background:#f8fafc;padding:24px 12px">
        <div style="max-width:700px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:14px;overflow:hidden">
          <div style="background:linear-gradient(135deg,#0ea5e9,#0369a1);padding:22px 24px">
            <p style="margin:0;color:#e0f2fe;font-size:12px;letter-spacing:.08em;text-transform:uppercase;font-weight:700">Admin Alert</p>
            <h2 style="margin:8px 0 0;color:#ffffff;font-size:22px;line-height:1.2">Nueva solicitud de presupuesto</h2>
            <p style="margin:10px 0 0;color:#e0f2fe;font-size:14px">${data.fullName} · ${serviceLabel}</p>
          </div>

          <div style="padding:20px 24px">
            <table style="width:100%;border-collapse:collapse;font-size:14px">
              <tr><td style="padding:8px 0;color:#64748b;width:170px">ID</td><td style="padding:8px 0;font-weight:700;color:#0f172a">${data.id}</td></tr>
              <tr><td style="padding:8px 0;color:#64748b">Nombre</td><td style="padding:8px 0;color:#334155">${data.fullName}</td></tr>
              <tr><td style="padding:8px 0;color:#64748b">Email</td><td style="padding:8px 0"><a href="mailto:${data.email}" style="color:#0284c7;text-decoration:none">${data.email}</a></td></tr>
              <tr><td style="padding:8px 0;color:#64748b">WhatsApp</td><td style="padding:8px 0;color:#334155">${data.whatsappPhone}</td></tr>
              <tr><td style="padding:8px 0;color:#64748b">Servicio</td><td style="padding:8px 0;color:#334155">${serviceLabel}</td></tr>
              <tr><td style="padding:8px 0;color:#64748b">Personas</td><td style="padding:8px 0;color:#334155">${data.participantsCount}</td></tr>
              <tr><td style="padding:8px 0;color:#64748b">Drone</td><td style="padding:8px 0;color:#334155">${data.addDrone ? 'Si' : 'No'}</td></tr>
              <tr><td style="padding:8px 0;color:#64748b">Fecha evento</td><td style="padding:8px 0;color:#334155">${data.eventDate}</td></tr>
              <tr><td style="padding:8px 0;color:#64748b">Ubicacion</td><td style="padding:8px 0;color:#334155">${data.city}, ${data.state}, ${data.country}</td></tr>
              <tr><td style="padding:8px 0;color:#64748b">Metodo preferido</td><td style="padding:8px 0;color:#334155">${data.preferredContactMethod}</td></tr>
              ${data.callbackTimePreference ? `<tr><td style="padding:8px 0;color:#64748b">Horario llamada</td><td style="padding:8px 0;color:#334155">${data.callbackTimePreference}</td></tr>` : ''}
            </table>

            <div style="margin-top:16px;padding:14px 16px;background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px">
              <p style="margin:0 0 8px;color:#0f172a;font-size:12px;letter-spacing:.06em;text-transform:uppercase;font-weight:700">Detalles del proyecto</p>
              <p style="margin:0;color:#334155;white-space:pre-wrap;line-height:1.6">${data.description}</p>
            </div>

            <div style="margin-top:18px">
              <a href="mailto:${data.email}?subject=Re: tu solicitud de presupuesto"
                 style="display:inline-block;background:#0ea5e9;color:#ffffff;padding:11px 16px;border-radius:8px;text-decoration:none;font-weight:700">
                Responder por email
              </a>
              &nbsp;
              <a href="https://wa.me/${data.whatsappPhone.replace(/\D/g, '')}"
                 style="display:inline-block;background:#22c55e;color:#ffffff;padding:11px 16px;border-radius:8px;text-decoration:none;font-weight:700">
                Abrir WhatsApp
              </a>
            </div>
          </div>
        </div>
      </div>
    `,
  })
}

export async function sendQuoteSubmissionConfirmation(data: QuoteEmailPayload) {
  const isEs = data.locale === 'es'
  const serviceLabel = formatServiceLabel(data.serviceType, data.locale)

  await sendMail({
    from: FROM,
    to: data.email,
    subject: isEs ? 'Recibimos tu solicitud de presupuesto' : 'We received your quote request',
    html: `
      <div style="font-family:sans-serif;max-width:640px;margin:0 auto;padding:24px">
        <h2 style="color:#0f172a">${isEs ? `Hola ${data.fullName},` : `Hi ${data.fullName},`}</h2>
        <p style="color:#374151;line-height:1.6">
          ${isEs
            ? 'Gracias por tu solicitud. Estamos revisando tu proyecto y pronto te enviaremos un presupuesto personalizado.'
            : 'Thank you for your request. We are reviewing your project and will send your personalized quote soon.'}
        </p>
        <div style="background:#f0f9ff;border-left:4px solid #0ea5e9;padding:16px;border-radius:4px;margin:20px 0">
          <p style="margin:0;color:#0f172a"><strong>${isEs ? 'Servicio' : 'Service'}:</strong> ${serviceLabel}</p>
          <p style="margin:8px 0 0;color:#0f172a"><strong>${isEs ? 'Personas' : 'People'}:</strong> ${data.participantsCount}</p>
          <p style="margin:8px 0 0;color:#0f172a"><strong>${isEs ? 'Drone' : 'Drone'}:</strong> ${data.addDrone ? (isEs ? 'Si' : 'Yes') : (isEs ? 'No' : 'No')}</p>
          <p style="margin:8px 0 0;color:#0f172a"><strong>${isEs ? 'Fecha del evento' : 'Event date'}:</strong> ${data.eventDate}</p>
        </div>
      </div>
    `,
  })
}

// ─── Dark luxury email shell (matches /quotations/[slug] proposal page) ──────
// Used for all quote-related emails. Booking emails keep their own blue shell.

export function qdOpen(title: string, subtitle: string): string {
  return `
    <div style="font-family:Arial,'Helvetica Neue',Helvetica,sans-serif;background:#0e0e0d;padding:24px 12px">
      <div style="max-width:640px;margin:0 auto;background:#161513;border:1px solid #2e2c29;overflow:hidden">
        <div style="background:#c8a96e;height:3px;font-size:1px;line-height:1px;">&nbsp;</div>
        <div style="background:#111110;padding:32px 28px;text-align:center;border-bottom:1px solid #2e2c29">
          <p style="margin:0 0 14px;color:#c8a96e;font-size:10px;letter-spacing:.4em;text-transform:uppercase;font-weight:700">BABULA SHOTS</p>
          <h2 style="margin:0;color:#f0ede6;font-size:26px;line-height:1.3;font-weight:400;letter-spacing:.03em">${title}</h2>
          <p style="margin:12px 0 0;color:#8a8680;font-size:14px;line-height:1.5">${subtitle}</p>
        </div>
        <div style="background:#111110;padding:30px 28px 36px">
  `
}

export function qdClose(): string {
  return `
        </div>
        <div style="background:#0a0a09;border-top:1px solid #2e2c29;padding:18px 28px;text-align:center">
          <p style="margin:0;color:#3d3b38;font-size:11px;letter-spacing:.06em;text-transform:uppercase;line-height:2.2">
            BABULA SHOTS &nbsp;·&nbsp; SANTO DOMINGO, REPÚBLICA DOMINICANA<br>
            <a href="https://www.fotografosantodomingo.com" style="color:#5a5753;text-decoration:none">fotografosantodomingo.com</a>
            &nbsp;·&nbsp;
            <a href="https://wa.me/18097789547" style="color:#5a5753;text-decoration:none">+1 (809) 778-9547</a>
          </p>
        </div>
      </div>
    </div>
  `
}

export function qdCard(rows: Array<{ label: string; value: string; gold?: boolean }>): string {
  const last = rows.length - 1
  return `
    <table style="width:100%;border-collapse:collapse;background:#1a1815;border:1px solid #2e2c29;margin:20px 0">
      ${rows.map((r, i) => `
        <tr>
          <td bgcolor="#1a1815" style="padding:11px 20px;${i < last ? 'border-bottom:1px solid #2e2c29;' : ''}color:#8a8680;font-size:12px;letter-spacing:.03em;width:46%">${r.label}</td>
          <td bgcolor="#1a1815" style="padding:11px 20px;${i < last ? 'border-bottom:1px solid #2e2c29;' : ''}color:${r.gold ? '#c8a96e' : '#f0ede6'};font-size:${r.gold ? '17px' : '14px'};font-weight:${r.gold ? '700' : '400'}">${r.value}</td>
        </tr>
      `).join('')}
    </table>
  `
}

export function qdBtn(href: string, label: string): string {
  return `
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:26px 0">
      <tr>
        <td align="center">
          <a href="${href}" style="display:inline-block;background:#c8a96e;color:#0e0e0d;padding:14px 38px;text-decoration:none;font-size:11px;font-weight:700;letter-spacing:.14em;text-transform:uppercase">
            ${label}
          </a>
        </td>
      </tr>
    </table>
  `
}

// ─── Proposal email (client) — dark luxury redesign ──────────────────────────

export type ProposalEmailData = {
  id: string
  locale: string
  fullName: string
  email: string
  serviceType: string
  finalPriceUsd: number
  adminNoteCustomer: string | null
  proposalUrl: string
  proposalExpiresAt: string
  eventDate?: string | null
  eventTime?: string | null
  description?: string | null
}

export async function sendProposalEmail(data: ProposalEmailData): Promise<void> {
  const isEs = data.locale === 'es'
  const serviceLabel = formatServiceLabel(data.serviceType, data.locale)
  const expiryDate = new Date(data.proposalExpiresAt).toLocaleDateString(
    isEs ? 'es-DO' : 'en-US',
    { month: 'long', day: 'numeric', year: 'numeric' }
  )
  const eventDateFmt = data.eventDate
    ? new Date(data.eventDate + 'T00:00:00').toLocaleDateString(
        isEs ? 'es-DO' : 'en-US',
        { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }
      )
    : null

  const cardRows: Array<{ label: string; value: string; gold?: boolean }> = [
    { label: isEs ? 'SERVICIO' : 'SERVICE', value: serviceLabel },
    ...(eventDateFmt ? [{ label: isEs ? 'FECHA DEL EVENTO' : 'EVENT DATE', value: eventDateFmt }] : []),
    ...(data.eventTime ? [{ label: isEs ? 'HORA' : 'TIME', value: data.eventTime }] : []),
    { label: isEs ? 'INVERSIÓN' : 'INVESTMENT', value: `$${data.finalPriceUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD`, gold: true },
    { label: isEs ? 'VÁLIDO HASTA' : 'VALID UNTIL', value: expiryDate },
  ]

  await sendMail({
    from: FROM,
    to: data.email,
    subject: isEs
      ? `Tu cotización está lista — Babula Shots`
      : `Your quotation is ready — Babula Shots`,
    html: `
      ${qdOpen(
        isEs ? 'Tu cotización está lista' : 'Your quotation is ready',
        isEs ? `Hola, ${data.fullName}` : `Hi, ${data.fullName}`
      )}

      <p style="margin:0 0 8px;color:#5a5753;font-size:9px;letter-spacing:.35em;text-transform:uppercase;font-weight:700">
        ${isEs ? 'COTIZACIÓN PROFESIONAL' : 'PROFESSIONAL QUOTATION'}
      </p>
      <p style="margin:0 0 24px;color:#8a8680;line-height:1.7;font-size:14px">
        ${isEs
          ? 'Revisamos tu proyecto y preparamos una propuesta personalizada. El enlace es privado — solo está disponible para ti.'
          : 'We reviewed your project and prepared a personalized proposal. The link is private — available only to you.'}
      </p>

      ${data.description ? `
      <div style="border-left:2px solid #2e2c29;padding:10px 18px;margin:0 0 24px">
        <p style="margin:0;color:#8a8680;line-height:1.65;font-size:13px">${data.description}</p>
      </div>
      ` : ''}

      ${qdCard(cardRows)}

      ${data.adminNoteCustomer ? `
      <div style="border-left:2px solid #c8a96e;padding:12px 18px;margin:4px 0 22px">
        <p style="margin:0 0 6px;color:#c8a96e;font-size:9px;letter-spacing:.35em;text-transform:uppercase;font-weight:700">
          ${isEs ? 'NOTA DEL FOTÓGRAFO' : "PHOTOGRAPHER'S NOTE"}
        </p>
        <p style="margin:0;color:#8a8680;line-height:1.65;font-size:13px;white-space:pre-wrap">${data.adminNoteCustomer}</p>
      </div>
      ` : ''}

      ${qdBtn(data.proposalUrl, isEs ? 'VER MI COTIZACIÓN →' : 'VIEW MY QUOTATION →')}

      <p style="margin:0;color:#5a5753;font-size:11px;text-align:center;line-height:1.9;letter-spacing:.03em">
        ${isEs
          ? `Este enlace es exclusivo para ti y expira el ${expiryDate}.`
          : `This link is exclusive to you and expires on ${expiryDate}.`}
        <br>
        ${isEs
          ? 'Para cualquier consulta, responde a este correo o escríbenos por WhatsApp.'
          : 'For any questions, reply to this email or reach us on WhatsApp.'}
      </p>

      ${qdClose()}
    `,
  })
}

// ─── Quote payment confirmation (client) ─────────────────────────────────────

export type QuotePaymentConfirmationData = {
  locale: string
  fullName: string
  email: string
  serviceType: string
  amountPaidUsd: number
  paymentMode: 'DEPOSIT' | 'FULL'
  balanceUsd: number
}

export async function sendQuotePaymentConfirmation(data: QuotePaymentConfirmationData): Promise<void> {
  const isEs = data.locale === 'es'
  const isDeposit = data.paymentMode === 'DEPOSIT'
  const serviceLabel = formatServiceLabel(data.serviceType, data.locale)

  const title = isDeposit
    ? (isEs ? 'Depósito confirmado' : 'Deposit confirmed')
    : (isEs ? 'Pago recibido' : 'Payment received')

  const subtitle = isDeposit
    ? (isEs ? `Tu sesión está reservada, ${data.fullName}` : `Your session is booked, ${data.fullName}`)
    : (isEs ? `Todo confirmado, ${data.fullName}` : `All confirmed, ${data.fullName}`)

  const cardRows: Array<{ label: string; value: string; gold?: boolean }> = [
    { label: isEs ? 'SERVICIO' : 'SERVICE', value: serviceLabel },
    {
      label: isDeposit
        ? (isEs ? 'DEPÓSITO PAGADO (50%)' : 'DEPOSIT PAID (50%)')
        : (isEs ? 'TOTAL PAGADO' : 'TOTAL PAID'),
      value: `$${data.amountPaidUsd.toFixed(2)} USD`,
      gold: true,
    },
    ...(isDeposit && data.balanceUsd > 0
      ? [{ label: isEs ? 'SALDO EL DÍA DE LA SESIÓN' : 'BALANCE DUE SESSION DAY', value: `$${data.balanceUsd.toFixed(2)} USD` }]
      : []),
  ]

  await sendMail({
    from: FROM,
    to: data.email,
    subject: isDeposit
      ? (isEs ? `Depósito recibido — ${serviceLabel} · Babula Shots` : `Deposit received — ${serviceLabel} · Babula Shots`)
      : (isEs ? `Pago confirmado — ${serviceLabel} · Babula Shots` : `Payment confirmed — ${serviceLabel} · Babula Shots`),
    html: `
      ${qdOpen(title, subtitle)}

      <p style="margin:0 0 22px;color:#8a8680;line-height:1.7;font-size:14px">
        ${isDeposit
          ? (isEs
              ? 'Recibimos tu depósito. Tu sesión está reservada — te contactaremos por WhatsApp para coordinar los detalles finales.'
              : 'We received your deposit. Your session is booked — we will contact you on WhatsApp to coordinate final details.')
          : (isEs
              ? 'Recibimos tu pago completo. Tu sesión está confirmada — te contactaremos por WhatsApp con los detalles finales.'
              : 'We received your full payment. Your session is confirmed — we will contact you on WhatsApp with final details.')}
      </p>

      ${qdCard(cardRows)}

      ${isDeposit && data.balanceUsd > 0 ? `
      <div style="border-left:2px solid #2e2c29;padding:10px 16px;margin:4px 0 22px">
        <p style="margin:0;color:#5a5753;font-size:12px;line-height:1.65">
          ${isEs
            ? 'Recuerda traer el saldo restante el día de la sesión. Cualquier pregunta, estamos en WhatsApp.'
            : 'Remember to bring the remaining balance on session day. Any questions, we are on WhatsApp.'}
        </p>
      </div>
      ` : ''}

      ${qdBtn('https://wa.me/18097789547', isEs ? 'Escribir por WhatsApp →' : 'Message us on WhatsApp →')}

      ${qdClose()}
    `,
  })
}

// ─── Quote payment admin alert ────────────────────────────────────────────────

export type QuotePaymentAdminData = {
  quoteId: string
  fullName: string
  clientCompany: string | null
  serviceType: string
  amountPaidUsd: number
  paymentMode: 'DEPOSIT' | 'FULL'
  whatsappPhone: string | null
  email: string | null
}

export async function sendQuotePaymentAdminAlert(data: QuotePaymentAdminData): Promise<void> {
  const isDeposit = data.paymentMode === 'DEPOSIT'
  const serviceLabel = formatServiceLabel(data.serviceType, 'es')
  const BASE = process.env.NEXT_PUBLIC_BASE_URL || 'https://www.fotografosantodomingo.com'
  const adminUrl = `${BASE}/admin/quotes/${data.quoteId}`
  const waPhone = data.whatsappPhone?.replace(/\D/g, '') ?? null

  const cardRows: Array<{ label: string; value: string; gold?: boolean }> = [
    { label: 'CLIENTE', value: data.fullName },
    ...(data.clientCompany ? [{ label: 'EMPRESA', value: data.clientCompany }] : []),
    { label: 'SERVICIO', value: serviceLabel },
    {
      label: isDeposit ? 'DEPÓSITO PAGADO' : 'TOTAL PAGADO',
      value: `$${data.amountPaidUsd.toFixed(2)} USD`,
      gold: true,
    },
    ...(data.email ? [{ label: 'EMAIL', value: data.email }] : []),
    ...(data.whatsappPhone ? [{ label: 'WHATSAPP', value: data.whatsappPhone }] : []),
  ]

  await sendMail({
    from: FROM,
    to: getAdminRecipients(),
    subject: isDeposit
      ? `💰 Depósito recibido — ${data.fullName} · ${serviceLabel}`
      : `✅ Pago completo — ${data.fullName} · ${serviceLabel}`,
    html: `
      ${qdOpen(
        isDeposit ? 'Depósito recibido' : 'Pago completo recibido',
        `${data.fullName}${data.clientCompany ? ` · ${data.clientCompany}` : ''}`
      )}

      <p style="margin:0 0 22px;color:#8a8680;line-height:1.7;font-size:14px">
        ${isDeposit
          ? `Se recibió el depósito del 50%. Estado actualizado a <span style="color:#f0ede6;font-weight:700">DEPOSIT PAID</span>.`
          : `Se recibió el pago completo. Estado actualizado a <span style="color:#c8a96e;font-weight:700">ACCEPTED</span>.`}
      </p>

      ${qdCard(cardRows)}

      <table width="100%" cellpadding="0" cellspacing="0" style="margin:26px 0 8px">
        <tr>
          <td align="center">
            <a href="${adminUrl}" style="display:inline-block;background:#c8a96e;color:#0e0e0d;padding:13px 30px;text-decoration:none;font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase">
              Ver cotización →
            </a>
            ${waPhone ? `&nbsp;&nbsp;
            <a href="https://wa.me/${waPhone}" style="display:inline-block;background:transparent;border:1px solid #c8a96e;color:#c8a96e;padding:12px 24px;text-decoration:none;font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase">
              WhatsApp ↗
            </a>` : ''}
          </td>
        </tr>
      </table>

      ${qdClose()}
    `,
  })
}
