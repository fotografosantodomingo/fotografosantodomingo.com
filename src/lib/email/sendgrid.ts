// SendGrid email utilities

import sgMail from '@sendgrid/mail'
import type { MailDataRequired } from '@sendgrid/helpers/classes/mail'

if (process.env.SENDGRID_API_KEY) {
  sgMail.setApiKey(process.env.SENDGRID_API_KEY)
}

export interface EmailData {
  to: string
  from: string
  subject: string
  text?: string
  html?: string
  templateId?: string
  dynamicTemplateData?: Record<string, any>
}

// Send email using SendGrid
export async function sendEmail(data: EmailData): Promise<boolean> {
  if (!process.env.SENDGRID_API_KEY) {
    console.warn('SendGrid API key not configured')
    return false
  }

  try {
    const msg: MailDataRequired = {
      to: data.to,
      from: data.from,
      subject: data.subject,
      content: [
        {
          type: 'text/html',
          value: data.html ?? data.text ?? '',
        },
      ],
      templateId: data.templateId,
      dynamicTemplateData: data.dynamicTemplateData,
    }

    await sgMail.send(msg)
    return true
  } catch (error) {
    console.error('SendGrid email error:', error)
    return false
  }
}

// Send contact form notification
export async function sendContactNotification(contactData: {
  id: string
  name: string
  email: string
  phone?: string
  service?: string
  message: string
  eventDate?: string
  location?: string
  submittedAt: string
  locale: string
}): Promise<boolean> {
  const adminEmail = process.env.NEXT_PUBLIC_CONTACT_EMAIL || 'admin@fotografosantodomingo.com'

  const serviceLabels: Record<string, string> = {
    wedding: 'Wedding Photography',
    corporate: 'Corporate Portraits',
    drone: 'Drone Photography',
    event: 'Special Events',
    family: 'Family Sessions',
    commercial: 'Commercial Photography',
    other: 'Other'
  }

  const htmlContent = `
    <h2>New Contact Form Submission</h2>
    <p><strong>ID:</strong> ${contactData.id}</p>
    <p><strong>Name:</strong> ${contactData.name}</p>
    <p><strong>Email:</strong> ${contactData.email}</p>
    ${contactData.phone ? `<p><strong>Phone:</strong> ${contactData.phone}</p>` : ''}
    ${contactData.service ? `<p><strong>Service:</strong> ${serviceLabels[contactData.service] || contactData.service}</p>` : ''}
    ${contactData.eventDate ? `<p><strong>Event Date:</strong> ${contactData.eventDate}</p>` : ''}
    ${contactData.location ? `<p><strong>Location:</strong> ${contactData.location}</p>` : ''}
    <p><strong>Language:</strong> ${contactData.locale}</p>
    <p><strong>Submitted:</strong> ${new Date(contactData.submittedAt).toLocaleString()}</p>
    <h3>Message:</h3>
    <p style="white-space: pre-wrap;">${contactData.message}</p>
    <hr>
    <p><small>This message was sent from the contact form on fotografosantodomingo.com</small></p>
  `

  return await sendEmail({
    to: adminEmail,
    from: 'noreply@fotografosantodomingo.com',
    subject: `New Contact: ${contactData.name} - ${contactData.service || 'General Inquiry'}`,
    html: htmlContent,
  })
}

// Send confirmation email to client
export async function sendContactConfirmation(clientEmail: string, clientName: string, locale: string = 'es'): Promise<boolean> {
  const subject = locale === 'es'
    ? 'Gracias por contactarnos - Fotografo Santo Domingo'
    : 'Thank you for contacting us - Fotografo Santo Domingo'

  const htmlContent = locale === 'es' ? `
    <h2>¡Gracias por contactarnos!</h2>
    <p>Hola ${clientName},</p>
    <p>Hemos recibido tu mensaje y te responderemos dentro de las próximas 24 horas.</p>
    <p>Mientras tanto, puedes:</p>
    <ul>
      <li>Ver nuestro portafolio: <a href="https://fotografosantodomingo.com/portfolio">Portafolio</a></li>
      <li>Agendar una consulta gratuita: <a href="https://calendly.com/info-vym7">Calendly</a></li>
      <li>Contactarnos por WhatsApp: <a href="https://wa.me/18097209547">WhatsApp</a></li>
    </ul>
    <p>¡Esperamos trabajar contigo pronto!</p>
    <p>Saludos,<br>Equipo de Fotografo Santo Domingo</p>
  ` : `
    <h2>Thank you for contacting us!</h2>
    <p>Hello ${clientName},</p>
    <p>We have received your message and will respond within the next 24 hours.</p>
    <p>In the meantime, you can:</p>
    <ul>
      <li>View our portfolio: <a href="https://fotografosantodomingo.com/en/portfolio">Portfolio</a></li>
      <li>Schedule a free consultation: <a href="https://calendly.com/info-vym7">Calendly</a></li>
      <li>Contact us on WhatsApp: <a href="https://wa.me/18097209547">WhatsApp</a></li>
    </ul>
    <p>We look forward to working with you soon!</p>
    <p>Best regards,<br>Fotografo Santo Domingo Team</p>
  `

  return await sendEmail({
    to: clientEmail,
    from: 'noreply@fotografosantodomingo.com',
    subject,
    html: htmlContent,
  })
}

// Send newsletter subscription confirmation
export async function sendNewsletterConfirmation(email: string, locale: string = 'es'): Promise<boolean> {
  const subject = locale === 'es'
    ? 'Bienvenido a nuestro boletín - Fotografo Santo Domingo'
    : 'Welcome to our newsletter - Fotografo Santo Domingo'

  const htmlContent = locale === 'es' ? `
    <h2>¡Bienvenido a nuestro boletín!</h2>
    <p>Gracias por suscribirte a nuestro boletín informativo.</p>
    <p>Recibirás:</p>
    <ul>
      <li>Tips de fotografía profesional</li>
      <li>Novedades de nuestros servicios</li>
      <li>Ofertas exclusivas para suscriptores</li>
      <li>Historias detrás de las fotos</li>
    </ul>
    <p>Si tienes alguna pregunta, no dudes en contactarnos.</p>
    <p>¡Feliz fotografía!</p>
    <p>Equipo de Fotografo Santo Domingo</p>
    <p><small>Si no te suscribiste a este boletín, puedes ignorar este email.</small></p>
  ` : `
    <h2>Welcome to our newsletter!</h2>
    <p>Thank you for subscribing to our newsletter.</p>
    <p>You will receive:</p>
    <ul>
      <li>Professional photography tips</li>
      <li>Updates on our services</li>
      <li>Exclusive offers for subscribers</li>
      <li>Stories behind the photos</li>
    </ul>
    <p>If you have any questions, feel free to contact us.</p>
    <p>Happy photographing!</p>
    <p>Fotografo Santo Domingo Team</p>
    <p><small>If you didn't subscribe to this newsletter, you can ignore this email.</small></p>
  `

  return await sendEmail({
    to: email,
    from: 'noreply@fotografosantodomingo.com',
    subject,
    html: htmlContent,
  })
}

// Send newsletter welcome email (alias for confirmation)
export async function sendNewsletterWelcome(data: {
  email: string
  name?: string
  locale: string
}): Promise<boolean> {
  return await sendNewsletterConfirmation(data.email, data.locale)
}