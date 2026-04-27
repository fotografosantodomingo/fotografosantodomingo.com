/**
 * Booking system emails — sent by the booking webhook, admin actions, and cron.
 * Style matches the existing resend.ts emails (sky-blue gradient header, slate
 * body, sans-serif, white card on f8fafc background).
 *
 * All functions log to public.booking_email_log on success/failure, and respect
 * the per-row reminder flags so cron callers can dedupe before invoking.
 */

import { sendMail } from './smtp'
import type { SupabaseClient } from '@supabase/supabase-js'
import { BOOKING_TIMEZONE, REVIEW_LINKS } from '@/lib/bookings/constants'
import type { BookingEmailType } from '@/lib/bookings/constants'

// ─── SMTP transport (Hostinger via worker-mailer; see ./smtp.ts) ─────────────

const FROM = { name: 'Babula Shots', email: 'noreply@fotografosantodomingo.com' }
const PRIMARY_ADMIN_EMAIL = 'info@fotografosantodomingo.com'
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || PRIMARY_ADMIN_EMAIL

function getAdminBcc(): string | undefined {
  const a = ADMIN_EMAIL.trim().toLowerCase()
  const p = PRIMARY_ADMIN_EMAIL.trim().toLowerCase()
  return a && a !== p ? ADMIN_EMAIL.trim() : undefined
}

// ─── Email log helper ────────────────────────────────────────────────────────

export async function logBookingEmail(
  supabase: SupabaseClient,
  params: {
    bookingId: string
    emailType: BookingEmailType
    recipientEmail: string
    locale: string
    resendId?: string | null
    error?: string | null
  }
) {
  const { error } = await supabase.from('booking_email_log').insert({
    booking_id: params.bookingId,
    email_type: params.emailType,
    recipient_email: params.recipientEmail,
    locale: params.locale,
    resend_id: params.resendId ?? null,
    error: params.error ?? null,
  })
  if (error) console.error('booking_email_log insert failed:', error)
}

// ─── Shared input shape ──────────────────────────────────────────────────────

export type BookingEmailContext = {
  bookingId: string
  customerName: string
  customerEmail: string
  locale: 'es' | 'en'
  serviceNameEs: string
  serviceNameEn: string
  serviceIcon: string
  durationMin: number
  startsAt: string // ISO
  endsAt: string // ISO
  staffName: string
  fullPriceUsd: number
  depositUsd: number
}

// ─── Formatting helpers ──────────────────────────────────────────────────────

function fmtDateAst(iso: string, locale: 'es' | 'en') {
  return new Intl.DateTimeFormat(locale === 'es' ? 'es-DO' : 'en-US', {
    timeZone: BOOKING_TIMEZONE,
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(iso))
}

function fmtTimeAst(iso: string) {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: BOOKING_TIMEZONE,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(new Date(iso))
}

function serviceName(ctx: BookingEmailContext) {
  return ctx.locale === 'es' ? ctx.serviceNameEs : ctx.serviceNameEn
}

const BASE_URL = 'https://www.fotografosantodomingo.com'

// ─── Reusable header / footer fragments ──────────────────────────────────────

function shellOpen(title: string, subtitle: string, accent: string = '#0ea5e9') {
  const dark = accent === '#0ea5e9' ? '#0369a1' : '#9a3412' // fallback for amber accent
  return `
    <div style="font-family:Arial,'Helvetica Neue',Helvetica,sans-serif;background:#f8fafc;padding:24px 12px">
      <div style="max-width:640px;margin:0 auto;background:#ffffff;border:1px solid #e2e8f0;border-radius:14px;overflow:hidden">
        <div style="background:linear-gradient(135deg,${accent},${dark});padding:26px 24px;text-align:center">
          <p style="margin:0;color:#e0f2fe;font-size:12px;letter-spacing:.09em;text-transform:uppercase;font-weight:700">Babula Shots</p>
          <h2 style="margin:10px 0 0;color:#ffffff;font-size:24px;line-height:1.25">${title}</h2>
          <p style="margin:10px 0 0;color:#e0f2fe;font-size:15px">${subtitle}</p>
        </div>
        <div style="padding:26px 24px">
  `
}

function shellClose() {
  return `
        </div>
        <div style="padding:14px 24px;border-top:1px solid #e2e8f0;background:#f8fafc;text-align:center">
          <p style="margin:0;color:#94a3b8;font-size:12px;line-height:1.6">
            Fotógrafo Santo Domingo — Babula Shots · Santo Domingo, República Dominicana<br/>
            <a href="${BASE_URL}" style="color:#0284c7">fotografosantodomingo.com</a>
            &nbsp;·&nbsp;
            <a href="https://wa.me/18097209547" style="color:#0284c7">WhatsApp +1 (809) 720-9547</a>
          </p>
        </div>
      </div>
    </div>
  `
}

function appointmentCard(ctx: BookingEmailContext) {
  const isEs = ctx.locale === 'es'
  return `
    <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:18px 20px;margin:12px 0 22px">
      <table style="width:100%;border-collapse:collapse;font-size:14px">
        <tr>
          <td style="padding:6px 0;color:#64748b;width:140px">${isEs ? 'Servicio' : 'Service'}</td>
          <td style="padding:6px 0;font-weight:600;color:#0f172a">${ctx.serviceIcon} ${serviceName(ctx)}</td>
        </tr>
        <tr>
          <td style="padding:6px 0;color:#64748b">${isEs ? 'Fecha' : 'Date'}</td>
          <td style="padding:6px 0;font-weight:600;color:#0f172a">${fmtDateAst(ctx.startsAt, ctx.locale)}</td>
        </tr>
        <tr>
          <td style="padding:6px 0;color:#64748b">${isEs ? 'Hora' : 'Time'}</td>
          <td style="padding:6px 0;font-weight:600;color:#0f172a">${fmtTimeAst(ctx.startsAt)} – ${fmtTimeAst(ctx.endsAt)} <span style="font-weight:400;color:#64748b">AST</span></td>
        </tr>
        <tr>
          <td style="padding:6px 0;color:#64748b">${isEs ? 'Duración' : 'Duration'}</td>
          <td style="padding:6px 0;color:#334155">${ctx.durationMin} ${isEs ? 'minutos' : 'minutes'}</td>
        </tr>
        <tr>
          <td style="padding:6px 0;color:#64748b">${isEs ? 'Fotógrafo' : 'Photographer'}</td>
          <td style="padding:6px 0;color:#334155">${ctx.staffName}</td>
        </tr>
      </table>
    </div>
  `
}

// ═══════════════════════════════════════════════════════════════════════════
// 1. Booking confirmation (customer) — sent from webhook on payment_intent.succeeded
// ═══════════════════════════════════════════════════════════════════════════

export async function sendBookingConfirmation(
  supabase: SupabaseClient,
  ctx: BookingEmailContext
): Promise<void> {

  const isEs = ctx.locale === 'es'
  const balance = (ctx.fullPriceUsd - ctx.depositUsd).toFixed(2)

  try {
    const result = await sendMail({
      from: FROM,
      to: ctx.customerEmail,
      subject: isEs
        ? `✅ Tu reserva está confirmada — ${serviceName(ctx)}`
        : `✅ Your booking is confirmed — ${serviceName(ctx)}`,
      html: `
        ${shellOpen(
          isEs ? 'Reserva confirmada' : 'Booking confirmed',
          isEs ? `Hola ${ctx.customerName}, todo está listo.` : `Hi ${ctx.customerName}, everything is set.`
        )}
        <p style="margin:0 0 18px;color:#334155;line-height:1.65;font-size:15px">
          ${isEs
            ? '¡Gracias por tu reserva! Hemos recibido tu depósito y tu cita está confirmada.'
            : 'Thanks for your booking! We received your deposit and your appointment is confirmed.'}
        </p>

        ${appointmentCard(ctx)}

        <div style="background:#ecfdf5;border:1px solid #a7f3d0;border-radius:10px;padding:14px 16px;margin-bottom:22px">
          <p style="margin:0 0 6px;color:#065f46;font-size:13px;font-weight:700;text-transform:uppercase;letter-spacing:.04em">${isEs ? 'Pago' : 'Payment'}</p>
          <table style="width:100%;border-collapse:collapse;font-size:14px">
            <tr>
              <td style="padding:4px 0;color:#047857">${isEs ? 'Depósito pagado (50%)' : 'Deposit paid (50%)'}</td>
              <td style="padding:4px 0;font-weight:700;color:#065f46;text-align:right">$${ctx.depositUsd.toFixed(2)} USD</td>
            </tr>
            <tr>
              <td style="padding:4px 0;color:#047857">${isEs ? 'Saldo a pagar el día de la sesión' : 'Balance due on session day'}</td>
              <td style="padding:4px 0;color:#065f46;text-align:right">$${balance} USD</td>
            </tr>
          </table>
        </div>

        <p style="margin:0 0 14px;color:#334155;line-height:1.6;font-size:14px">
          ${isEs
            ? 'Te enviaremos un recordatorio 24 horas antes y otro la mañana del día. Si necesitas reagendar o tienes preguntas, simplemente responde este email o escríbenos por WhatsApp.'
            : 'We will send you a reminder 24 hours before and another on the morning of the session. To reschedule or ask anything, just reply to this email or message us on WhatsApp.'}
        </p>

        <div style="text-align:center;margin:22px 0 6px">
          <a href="https://wa.me/18097209547"
             style="display:inline-block;background:#22c55e;color:#ffffff;padding:12px 22px;border-radius:50px;text-decoration:none;font-weight:700;font-size:14px">
            ${isEs ? 'Escribir por WhatsApp' : 'Message us on WhatsApp'}
          </a>
        </div>
        ${shellClose()}
      `,
    })

    if (result.error) throw new Error(result.error)
    await logBookingEmail(supabase, {
      bookingId: ctx.bookingId,
      emailType: 'CONFIRMATION',
      recipientEmail: ctx.customerEmail,
      locale: ctx.locale,
      resendId: result.id,
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('sendBookingConfirmation failed:', msg)
    await logBookingEmail(supabase, {
      bookingId: ctx.bookingId,
      emailType: 'CONFIRMATION',
      recipientEmail: ctx.customerEmail,
      locale: ctx.locale,
      error: msg,
    })
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// 2. Booking admin alert — sent from webhook on payment_intent.succeeded
// ═══════════════════════════════════════════════════════════════════════════

export async function sendBookingAdminAlert(
  supabase: SupabaseClient,
  ctx: BookingEmailContext & { customerPhone: string | null }
): Promise<void> {
  const adminUrl = `${BASE_URL}/admin/bookings/${ctx.bookingId}`

  try {
    const result = await sendMail({
      from: FROM,
      to: PRIMARY_ADMIN_EMAIL,
      ...(getAdminBcc() ? { bcc: getAdminBcc() } : {}),
      replyTo: ctx.customerEmail,
      subject: `📅 Nueva reserva — ${ctx.serviceNameEs} · ${ctx.customerName}`,
      html: `
        ${shellOpen('Nueva reserva pagada', `${ctx.customerName} · ${ctx.serviceNameEs}`)}
        <p style="margin:0 0 16px;color:#334155;line-height:1.65;font-size:15px">
          Se confirmó una nueva reserva con depósito pagado.
        </p>

        ${appointmentCard({ ...ctx, locale: 'es' })}

        <table style="width:100%;border-collapse:collapse;font-size:14px;margin-bottom:18px">
          <tr>
            <td style="padding:6px 0;color:#64748b;width:140px">Cliente</td>
            <td style="padding:6px 0;font-weight:700;color:#0f172a">${ctx.customerName}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#64748b">Email</td>
            <td style="padding:6px 0"><a href="mailto:${ctx.customerEmail}" style="color:#0284c7;text-decoration:none">${ctx.customerEmail}</a></td>
          </tr>
          ${ctx.customerPhone ? `
          <tr>
            <td style="padding:6px 0;color:#64748b">Teléfono</td>
            <td style="padding:6px 0"><a href="tel:${ctx.customerPhone}" style="color:#0284c7;text-decoration:none">${ctx.customerPhone}</a></td>
          </tr>` : ''}
          <tr>
            <td style="padding:6px 0;color:#64748b">Idioma</td>
            <td style="padding:6px 0;color:#334155">${ctx.locale.toUpperCase()}</td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#64748b">Depósito (50%)</td>
            <td style="padding:6px 0;font-weight:700;color:#065f46">$${ctx.depositUsd.toFixed(2)} USD</td>
          </tr>
          <tr>
            <td style="padding:6px 0;color:#64748b">Saldo</td>
            <td style="padding:6px 0;color:#334155">$${(ctx.fullPriceUsd - ctx.depositUsd).toFixed(2)} USD</td>
          </tr>
        </table>

        <div style="text-align:center">
          <a href="${adminUrl}"
             style="display:inline-block;background:#0ea5e9;color:#ffffff;padding:12px 24px;border-radius:50px;text-decoration:none;font-weight:700;font-size:14px">
            Ver en panel admin →
          </a>
        </div>
        ${shellClose()}
      `,
    })

    if (result.error) throw new Error(result.error)
    await logBookingEmail(supabase, {
      bookingId: ctx.bookingId,
      emailType: 'ADMIN_ALERT',
      recipientEmail: PRIMARY_ADMIN_EMAIL,
      locale: 'es',
      resendId: result.id,
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('sendBookingAdminAlert failed:', msg)
    await logBookingEmail(supabase, {
      bookingId: ctx.bookingId,
      emailType: 'ADMIN_ALERT',
      recipientEmail: PRIMARY_ADMIN_EMAIL,
      locale: 'es',
      error: msg,
    })
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// 3. 24h reminder (customer)
// ═══════════════════════════════════════════════════════════════════════════

export async function sendBookingReminder24h(
  supabase: SupabaseClient,
  ctx: BookingEmailContext
): Promise<void> {
  const isEs = ctx.locale === 'es'

  try {
    const result = await sendMail({
      from: FROM,
      to: ctx.customerEmail,
      subject: isEs
        ? `⏰ Tu sesión es mañana — ${serviceName(ctx)}`
        : `⏰ Your session is tomorrow — ${serviceName(ctx)}`,
      html: `
        ${shellOpen(
          isEs ? 'Tu sesión es mañana' : 'Your session is tomorrow',
          isEs ? `Hola ${ctx.customerName}` : `Hi ${ctx.customerName}`
        )}
        <p style="margin:0 0 18px;color:#334155;line-height:1.65;font-size:15px">
          ${isEs
            ? 'Solo un recordatorio amistoso de que tu sesión es en menos de 24 horas. ¡Estamos emocionados!'
            : "Just a friendly reminder that your session is in less than 24 hours. We're excited!"}
        </p>

        ${appointmentCard(ctx)}

        <p style="margin:0 0 14px;color:#334155;line-height:1.6;font-size:14px">
          ${isEs
            ? 'Si necesitas cambiar algo o tienes alguna duda, contáctanos cuanto antes para que podamos coordinar.'
            : 'If you need to change anything or have a question, get in touch ASAP so we can sort it out.'}
        </p>

        <div style="text-align:center;margin:22px 0 6px">
          <a href="https://wa.me/18097209547"
             style="display:inline-block;background:#22c55e;color:#ffffff;padding:12px 22px;border-radius:50px;text-decoration:none;font-weight:700;font-size:14px">
            ${isEs ? 'WhatsApp directo' : 'Message us on WhatsApp'}
          </a>
        </div>
        ${shellClose()}
      `,
    })

    if (result.error) throw new Error(result.error)
    await supabase.from('bookings').update({ reminder_24h_sent: true }).eq('id', ctx.bookingId)
    await logBookingEmail(supabase, {
      bookingId: ctx.bookingId,
      emailType: 'REMINDER_24H',
      recipientEmail: ctx.customerEmail,
      locale: ctx.locale,
      resendId: result.id,
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('sendBookingReminder24h failed:', msg)
    await logBookingEmail(supabase, {
      bookingId: ctx.bookingId,
      emailType: 'REMINDER_24H',
      recipientEmail: ctx.customerEmail,
      locale: ctx.locale,
      error: msg,
    })
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// 4. Same-day reminder (customer)
// ═══════════════════════════════════════════════════════════════════════════

export async function sendBookingReminderSameDay(
  supabase: SupabaseClient,
  ctx: BookingEmailContext
): Promise<void> {
  const isEs = ctx.locale === 'es'

  try {
    const result = await sendMail({
      from: FROM,
      to: ctx.customerEmail,
      subject: isEs
        ? `📸 Hoy es tu sesión — ${fmtTimeAst(ctx.startsAt)}`
        : `📸 Today is your session — ${fmtTimeAst(ctx.startsAt)}`,
      html: `
        ${shellOpen(
          isEs ? '¡Hoy es el día!' : 'Today is the day!',
          isEs ? `Hola ${ctx.customerName}` : `Hi ${ctx.customerName}`
        )}
        <p style="margin:0 0 18px;color:#334155;line-height:1.65;font-size:15px">
          ${isEs
            ? `Nos vemos hoy a las <strong>${fmtTimeAst(ctx.startsAt)} AST</strong>. Llega 5 minutos antes si puedes.`
            : `We meet today at <strong>${fmtTimeAst(ctx.startsAt)} AST</strong>. Arrive 5 minutes early if you can.`}
        </p>

        ${appointmentCard(ctx)}

        <p style="margin:0 0 14px;color:#334155;line-height:1.6;font-size:14px">
          ${isEs
            ? 'Recuerda traer el saldo restante. Si surge cualquier imprevisto, llámanos por WhatsApp.'
            : 'Remember to bring the remaining balance. If anything comes up, message us on WhatsApp.'}
        </p>

        <div style="text-align:center;margin:22px 0 6px">
          <a href="https://wa.me/18097209547"
             style="display:inline-block;background:#22c55e;color:#ffffff;padding:12px 22px;border-radius:50px;text-decoration:none;font-weight:700;font-size:14px">
            ${isEs ? 'WhatsApp directo' : 'Message us on WhatsApp'}
          </a>
        </div>
        ${shellClose()}
      `,
    })

    if (result.error) throw new Error(result.error)
    await supabase.from('bookings').update({ reminder_same_day_sent: true }).eq('id', ctx.bookingId)
    await logBookingEmail(supabase, {
      bookingId: ctx.bookingId,
      emailType: 'REMINDER_SAME_DAY',
      recipientEmail: ctx.customerEmail,
      locale: ctx.locale,
      resendId: result.id,
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('sendBookingReminderSameDay failed:', msg)
    await logBookingEmail(supabase, {
      bookingId: ctx.bookingId,
      emailType: 'REMINDER_SAME_DAY',
      recipientEmail: ctx.customerEmail,
      locale: ctx.locale,
      error: msg,
    })
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// 5. Post-session review request (customer)
// ═══════════════════════════════════════════════════════════════════════════

export async function sendBookingPostSession(
  supabase: SupabaseClient,
  ctx: BookingEmailContext
): Promise<void> {
  const isEs = ctx.locale === 'es'

  try {
    const result = await sendMail({
      from: FROM,
      to: ctx.customerEmail,
      subject: isEs
        ? '🙏 Gracias — ¿nos compartes tu experiencia?'
        : '🙏 Thank you — would you share your experience?',
      html: `
        ${shellOpen(
          isEs ? '¡Gracias!' : 'Thank you!',
          isEs ? `Hola ${ctx.customerName}` : `Hi ${ctx.customerName}`
        )}
        <p style="margin:0 0 18px;color:#334155;line-height:1.65;font-size:15px">
          ${isEs
            ? 'Fue un placer trabajar contigo hoy. Si la experiencia te gustó, una reseña corta nos ayuda muchísimo a llegar a más personas.'
            : "It was a pleasure working with you today. If you enjoyed the experience, a short review helps us a lot to reach more people."}
        </p>

        <div style="text-align:center;margin:22px 0">
          <a href="${REVIEW_LINKS.google}"
             style="display:inline-block;background:#fbbc04;color:#1f2937;padding:14px 28px;border-radius:50px;text-decoration:none;font-weight:700;font-size:15px;margin:6px">
            ⭐ ${isEs ? 'Reseñarnos en Google' : 'Review us on Google'}
          </a>
        </div>

        <p style="margin:18px 0 0;color:#64748b;line-height:1.6;font-size:13px;text-align:center">
          ${isEs
            ? 'Tu galería editada estará lista en los próximos días. Te avisaremos por email tan pronto esté disponible.'
            : 'Your edited gallery will be ready in the next few days. We will email you as soon as it is available.'}
        </p>
        ${shellClose()}
      `,
    })

    if (result.error) throw new Error(result.error)
    await supabase.from('bookings').update({ post_session_sent: true }).eq('id', ctx.bookingId)
    await logBookingEmail(supabase, {
      bookingId: ctx.bookingId,
      emailType: 'POST_SESSION',
      recipientEmail: ctx.customerEmail,
      locale: ctx.locale,
      resendId: result.id,
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('sendBookingPostSession failed:', msg)
    await logBookingEmail(supabase, {
      bookingId: ctx.bookingId,
      emailType: 'POST_SESSION',
      recipientEmail: ctx.customerEmail,
      locale: ctx.locale,
      error: msg,
    })
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// 6. Cancellation (customer) — sent from admin cancel action
// ═══════════════════════════════════════════════════════════════════════════

export async function sendBookingCancellation(
  supabase: SupabaseClient,
  ctx: BookingEmailContext & { reason: string; refundUsd: number }
): Promise<void> {
  const isEs = ctx.locale === 'es'

  try {
    const result = await sendMail({
      from: FROM,
      to: ctx.customerEmail,
      subject: isEs
        ? `Reserva cancelada — ${serviceName(ctx)}`
        : `Booking cancelled — ${serviceName(ctx)}`,
      html: `
        ${shellOpen(
          isEs ? 'Reserva cancelada' : 'Booking cancelled',
          isEs ? `Hola ${ctx.customerName}` : `Hi ${ctx.customerName}`,
          '#f97316' // amber accent for cancellation
        )}
        <p style="margin:0 0 18px;color:#334155;line-height:1.65;font-size:15px">
          ${isEs
            ? `Tu reserva ha sido cancelada. Razón: <em>${ctx.reason}</em>.`
            : `Your booking has been cancelled. Reason: <em>${ctx.reason}</em>.`}
        </p>

        ${appointmentCard(ctx)}

        ${ctx.refundUsd > 0 ? `
        <div style="background:#fef3c7;border:1px solid #fcd34d;border-radius:10px;padding:14px 16px;margin-bottom:22px">
          <p style="margin:0;color:#78350f;font-size:14px">
            <strong>${isEs ? 'Reembolso:' : 'Refund:'}</strong>
            $${ctx.refundUsd.toFixed(2)} USD
            ${isEs
              ? '— procesado a tu método de pago original. Puede tardar 5–10 días en aparecer en tu cuenta.'
              : '— processed to your original payment method. May take 5–10 days to appear in your account.'}
          </p>
        </div>` : ''}

        <p style="margin:0 0 14px;color:#334155;line-height:1.6;font-size:14px">
          ${isEs
            ? 'Si fue un malentendido o quieres reagendar para otra fecha, escríbenos — siempre estamos disponibles para conversar.'
            : 'If this was a misunderstanding or you would like to reschedule, get in touch — we are always available to chat.'}
        </p>

        <div style="text-align:center;margin:22px 0 6px">
          <a href="https://wa.me/18097209547"
             style="display:inline-block;background:#22c55e;color:#ffffff;padding:12px 22px;border-radius:50px;text-decoration:none;font-weight:700;font-size:14px">
            ${isEs ? 'Hablar por WhatsApp' : 'Message on WhatsApp'}
          </a>
        </div>
        ${shellClose()}
      `,
    })

    if (result.error) throw new Error(result.error)
    await logBookingEmail(supabase, {
      bookingId: ctx.bookingId,
      emailType: 'CANCELLATION',
      recipientEmail: ctx.customerEmail,
      locale: ctx.locale,
      resendId: result.id,
    })
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error('sendBookingCancellation failed:', msg)
    await logBookingEmail(supabase, {
      bookingId: ctx.bookingId,
      emailType: 'CANCELLATION',
      recipientEmail: ctx.customerEmail,
      locale: ctx.locale,
      error: msg,
    })
  }
}
