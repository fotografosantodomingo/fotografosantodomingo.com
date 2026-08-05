/**
 * Client gallery emails — sent by the "mark ready" admin action and the
 * expiration cron's T-2-day reminder pass. Style matches bookings.ts (sky
 * gradient header, slate body).
 */

import { sendMail } from './smtp'
import type { SupabaseClient } from '@supabase/supabase-js'
import { signPhotoPreviewToken } from '@/lib/gallery/crypto'
import { gallerySessionSecret } from '@/lib/gallery/session'

const FROM = { name: 'Babula Shots', email: 'noreply@fotografosantodomingo.com' }
const BASE_URL = 'https://www.fotografosantodomingo.com'

// Same header/footer fragments as bookings.ts, so gallery emails read as the
// same system as booking confirmations/reminders, not a different product.
function shellOpen(title: string, subtitle: string, accent: string = '#0ea5e9') {
  const dark = accent === '#0ea5e9' ? '#0369a1' : '#9a3412'
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
            <a href="https://wa.me/18097789547" style="color:#0284c7">WhatsApp +1 (809) 778-9547</a>
          </p>
        </div>
      </div>
    </div>
  `
}

const THUMBNAIL_COUNT = 5

async function thumbnailStrip(
  slug: string,
  expiresAt: string,
  photos: { id: string }[],
  photoCount: number
): Promise<string> {
  if (photos.length === 0) return ''

  const secret = gallerySessionSecret()
  const shown = photos.slice(0, THUMBNAIL_COUNT)
  const cells = await Promise.all(
    shown.map(async (p) => {
      const token = await signPhotoPreviewToken(slug, p.id, expiresAt, secret)
      const src = `${BASE_URL}/api/gallery/${slug}/photo/${p.id}/email-preview?token=${token}`
      return `<td style="padding:0 4px">
        <img src="${src}" width="88" height="88" alt=""
             style="display:block;width:88px;height:88px;object-fit:cover;border-radius:8px;border:1px solid #e2e8f0" />
      </td>`
    })
  )

  const remaining = photoCount - shown.length
  if (remaining > 0) {
    cells.push(`<td style="padding:0 4px">
      <div style="display:flex;align-items:center;justify-content:center;width:88px;height:88px;border-radius:8px;background:#f1f5f9;color:#64748b;font-size:13px;font-weight:700">
        +${remaining}
      </div>
    </td>`)
  }

  return `
    <table role="presentation" style="margin:0 auto 20px;border-collapse:collapse">
      <tr>${cells.join('')}</tr>
    </table>
  `
}

function fmtDate(iso: string, locale: 'es' | 'en' = 'es') {
  return new Date(iso).toLocaleDateString(locale === 'es' ? 'es-DO' : 'en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

// ═══════════════════════════════════════════════════════════════════════════
// 1. Gallery ready — sent when admin marks a gallery 'ready'
// ═══════════════════════════════════════════════════════════════════════════

export async function sendGalleryReady(
  _supabase: SupabaseClient,
  ctx: {
    galleryId: string
    slug: string
    clientName: string
    clientEmail: string
    clientEmail2?: string | null
    topic?: string | null
    expiresAt: string
    password: string | null // null on a repeat "ready" — password already sent previously
    previewPhotos: { id: string }[] // first few photos, for the thumbnail strip
    photoCount: number
  }
): Promise<boolean> {
  const recipients = ctx.clientEmail2 ? [ctx.clientEmail, ctx.clientEmail2] : ctx.clientEmail
  const topic = ctx.topic || ctx.clientName
  const url = `${BASE_URL}/g/${ctx.slug}`
  const expiresLabel = fmtDate(ctx.expiresAt)
  const thumbnails = await thumbnailStrip(ctx.slug, ctx.expiresAt, ctx.previewPhotos, ctx.photoCount)

  const passwordBlock = ctx.password
    ? `
      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:14px 16px;margin-bottom:20px;text-align:center">
        <p style="margin:0 0 4px;color:#166534;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.04em">Contraseña</p>
        <p style="margin:0;color:#14532d;font-size:20px;font-weight:800;letter-spacing:.03em;font-family:monospace">${ctx.password}</p>
      </div>`
    : `
      <p style="margin:0 0 20px;color:#64748b;font-size:13px;text-align:center">Usa la misma contraseña que te compartimos anteriormente.</p>`

  const result = await sendMail({
    from: FROM,
    to: recipients,
    subject: `📸 Tus fotos están listas — ${topic}`,
    html: `
      ${shellOpen('Tu galería está lista', `Hola ${ctx.clientName}, ya puedes ver y descargar tus fotos de ${topic}.`)}
      <p style="margin:0 0 18px;color:#334155;line-height:1.65;font-size:15px">
        Todas tus fotos en resolución completa están disponibles para descargar individualmente o todas juntas en un ZIP.
      </p>

      ${thumbnails}

      ${passwordBlock}

      <div style="text-align:center;margin:6px 0 20px">
        <a href="${url}"
           style="display:inline-block;background:#0ea5e9;color:#ffffff;padding:14px 28px;border-radius:50px;text-decoration:none;font-weight:700;font-size:15px">
          Ver mi galería
        </a>
      </div>

      <p style="margin:0;color:#94a3b8;line-height:1.6;font-size:13px;text-align:center">
        Disponible hasta el ${expiresLabel}. Después de esa fecha las fotos se eliminan automáticamente — descárgalas antes de que expire el enlace.
      </p>
      ${shellClose()}
    `,
  })

  if (!result.ok) console.error('sendGalleryReady failed:', result.error)
  return result.ok
}

// ═══════════════════════════════════════════════════════════════════════════
// 2. Expiration reminder — sent by cron at T-2 days
// ═══════════════════════════════════════════════════════════════════════════

export async function sendGalleryReminder(
  _supabase: SupabaseClient,
  ctx: {
    slug: string
    clientName: string
    clientEmail: string
    clientEmail2?: string | null
    topic?: string | null
    expiresAt: string
  }
): Promise<void> {
  const url = `${BASE_URL}/g/${ctx.slug}`
  const expiresLabel = fmtDate(ctx.expiresAt)
  const recipients = ctx.clientEmail2 ? [ctx.clientEmail, ctx.clientEmail2] : ctx.clientEmail
  const topic = ctx.topic || ctx.clientName

  const result = await sendMail({
    from: FROM,
    to: recipients,
    subject: `⏳ Tu galería expira pronto — ${topic}`,
    html: `
      ${shellOpen('Tu galería expira en 48 horas', `Hola ${ctx.clientName}, no olvides descargar tus fotos de ${topic}.`, '#f59e0b')}
      <p style="margin:0 0 20px;color:#334155;line-height:1.65;font-size:15px">
        Tu galería se elimina automáticamente el <strong>${expiresLabel}</strong>. Si aún no has descargado tus fotos en resolución completa, hazlo antes de esa fecha — después no podremos recuperarlas.
      </p>
      <div style="text-align:center;margin:6px 0 6px">
        <a href="${url}"
           style="display:inline-block;background:#f59e0b;color:#ffffff;padding:14px 28px;border-radius:50px;text-decoration:none;font-weight:700;font-size:15px">
          Descargar mis fotos
        </a>
      </div>
      ${shellClose()}
    `,
  })

  if (!result.ok) console.error('sendGalleryReminder failed:', result.error)
}

// ═══════════════════════════════════════════════════════════════════════════
// 3. Selection ready — sent when admin opens the proofing/selection phase
// ═══════════════════════════════════════════════════════════════════════════

export async function sendGallerySelectionReady(
  _supabase: SupabaseClient,
  ctx: {
    slug: string
    clientName: string
    clientEmail: string
    clientEmail2?: string | null
    topic?: string | null
    includedPhotoCount: number
    password: string | null
  }
): Promise<boolean> {
  const recipients = ctx.clientEmail2 ? [ctx.clientEmail, ctx.clientEmail2] : ctx.clientEmail
  const topic = ctx.topic || ctx.clientName
  const url = `${BASE_URL}/g/${ctx.slug}`

  const passwordBlock = ctx.password
    ? `
      <div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:14px 16px;margin-bottom:20px;text-align:center">
        <p style="margin:0 0 4px;color:#166534;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.04em">Contraseña</p>
        <p style="margin:0;color:#14532d;font-size:20px;font-weight:800;letter-spacing:.03em;font-family:monospace">${ctx.password}</p>
      </div>`
    : `
      <p style="margin:0 0 20px;color:#64748b;font-size:13px;text-align:center">Usa la misma contraseña que te compartimos anteriormente.</p>`

  const result = await sendMail({
    from: FROM,
    to: recipients,
    subject: `👉 Elige tus fotos favoritas — ${topic}`,
    html: `
      ${shellOpen('Elige tus favoritas', `Hola ${ctx.clientName}, ya puedes seleccionar tus fotos de ${topic}.`)}
      <p style="margin:0 0 12px;color:#334155;line-height:1.65;font-size:15px">
        Desliza cada foto: a la derecha si te gusta, a la izquierda si no.
        ${
          ctx.includedPhotoCount > 0
            ? `Tu paquete incluye <strong>${ctx.includedPhotoCount} fotos</strong> — si eliges más, te mostraremos el costo adicional antes de confirmar.`
            : 'Elige todas las que quieras — no hay límite ni costo adicional.'
        }
      </p>

      ${passwordBlock}

      <div style="text-align:center;margin:6px 0 6px">
        <a href="${url}"
           style="display:inline-block;background:#0ea5e9;color:#ffffff;padding:14px 28px;border-radius:50px;text-decoration:none;font-weight:700;font-size:15px">
          Elegir mis fotos
        </a>
      </div>
      ${shellClose()}
    `,
  })

  if (!result.ok) console.error('sendGallerySelectionReady failed:', result.error)
  return result.ok
}

// ═══════════════════════════════════════════════════════════════════════════
// 4. Selection submitted — notifies the photographer with the picked filenames
// ═══════════════════════════════════════════════════════════════════════════

export async function sendPhotographerSelectionNotice(ctx: {
  slug: string
  clientName: string
  topic: string | null
  selectedFilenames: string[]
  includedPhotoCount: number
  overageTier: number
  overageAmountUsd: number | null
}): Promise<boolean> {
  const topic = ctx.topic || ctx.clientName
  const adminUrl = `${BASE_URL}/admin/galleries`
  const overCount = Math.max(0, ctx.selectedFilenames.length - ctx.includedPhotoCount)

  const overageLine =
    ctx.overageTier > 0
      ? `<p style="margin:0 0 14px;color:#166534;font-weight:700;font-size:14px">
           +${overCount} sobre el límite · recargo del ${ctx.overageTier}% (${
          ctx.overageAmountUsd != null ? `$${ctx.overageAmountUsd.toFixed(2)} USD` : 'pendiente'
        }) — pagado
         </p>`
      : `<p style="margin:0 0 14px;color:#64748b;font-size:14px">Dentro del límite incluido — sin cargo adicional.</p>`

  const result = await sendMail({
    from: FROM,
    to: 'info@fotografosantodomingo.com',
    subject: `✅ Selección lista — ${topic} (${ctx.selectedFilenames.length} fotos)`,
    html: `
      ${shellOpen('Cliente eligió sus fotos', `${ctx.clientName} — ${topic}`)}
      <p style="margin:0 0 10px;color:#334155;font-size:14px">
        ${
          ctx.includedPhotoCount > 0
            ? `<strong>${ctx.selectedFilenames.length}</strong> de <strong>${ctx.includedPhotoCount}</strong> incluidas.`
            : `<strong>${ctx.selectedFilenames.length}</strong> fotos seleccionadas.`
        }
      </p>
      ${overageLine}
      <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:14px 16px;margin-bottom:18px;max-height:320px;overflow-y:auto">
        <p style="margin:0 0 8px;color:#64748b;font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.04em">Archivos seleccionados</p>
        <ul style="margin:0;padding-left:18px;color:#334155;font-size:13px;line-height:1.8">
          ${ctx.selectedFilenames.map((f) => `<li>${f}</li>`).join('')}
        </ul>
      </div>
      <div style="text-align:center;margin:6px 0 6px">
        <a href="${adminUrl}"
           style="display:inline-block;background:#0ea5e9;color:#ffffff;padding:12px 24px;border-radius:50px;text-decoration:none;font-weight:700;font-size:14px">
          Abrir en admin
        </a>
      </div>
      ${shellClose()}
    `,
  })

  if (!result.ok) console.error('sendPhotographerSelectionNotice failed:', result.error)
  return result.ok
}

// ═══════════════════════════════════════════════════════════════════════════
// 5. Selection confirmed — client-facing receipt
// ═══════════════════════════════════════════════════════════════════════════

export async function sendClientSelectionConfirmation(ctx: {
  clientName: string
  clientEmail: string
  clientEmail2?: string | null
  topic: string | null
  selectedCount: number
  includedPhotoCount: number
  overageTier: number
  overageAmountUsd: number | null
}): Promise<boolean> {
  const recipients = ctx.clientEmail2 ? [ctx.clientEmail, ctx.clientEmail2] : ctx.clientEmail
  const topic = ctx.topic || ctx.clientName

  const chargeLine =
    ctx.overageTier > 0
      ? `<div style="background:#f0fdf4;border:1px solid #bbf7d0;border-radius:10px;padding:14px 16px;margin-bottom:18px;text-align:center">
           <p style="margin:0;color:#166534;font-size:14px">
             Cargo adicional del ${ctx.overageTier}%${
          ctx.overageAmountUsd != null ? ` — $${ctx.overageAmountUsd.toFixed(2)} USD` : ''
        } procesado correctamente.
           </p>
         </div>`
      : ''

  const result = await sendMail({
    from: FROM,
    to: recipients,
    subject: `✅ Selección confirmada — ${topic}`,
    html: `
      ${shellOpen('¡Selección confirmada!', `Gracias ${ctx.clientName} — recibimos tus favoritas de ${topic}.`)}
      <p style="margin:0 0 14px;color:#334155;line-height:1.65;font-size:15px">
        Elegiste <strong>${ctx.selectedCount}</strong> fotos. Ahora las editaremos y te avisaremos por email en cuanto
        tu galería final esté lista para descargar.
      </p>
      ${chargeLine}
      ${shellClose()}
    `,
  })

  if (!result.ok) console.error('sendClientSelectionConfirmation failed:', result.error)
  return result.ok
}
