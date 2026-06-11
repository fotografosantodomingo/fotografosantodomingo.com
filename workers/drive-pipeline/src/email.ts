import type { CrossPostResult, Env } from './types'

async function resendSend(apiKey: string, payload: { from: string; to: string[]; subject: string; html: string }): Promise<void> {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: { Authorization: `Bearer ${apiKey}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) {
    const body = await res.text()
    throw new Error(`Resend error ${res.status}: ${body}`)
  }
}

function goldBar() {
  return `<div style="background:#c8a96e;height:3px;font-size:1px;line-height:1px;">&nbsp;</div>`
}

function shell(content: string): string {
  return `
<div style="font-family:Arial,'Helvetica Neue',Helvetica,sans-serif;background:#0e0e0d;padding:24px 12px">
  <div style="max-width:640px;margin:0 auto;background:#161513;border:1px solid #2e2c29;overflow:hidden">
    ${goldBar()}
    <div style="background:#111110;padding:32px 28px;text-align:center;border-bottom:1px solid #2e2c29">
      <p style="margin:0 0 14px;color:#c8a96e;font-size:10px;letter-spacing:.4em;text-transform:uppercase;font-weight:700">BABULA SHOTS</p>
    </div>
    <div style="background:#111110;padding:30px 28px 36px">${content}</div>
    <div style="background:#0a0a09;border-top:1px solid #2e2c29;padding:18px 28px;text-align:center">
      <p style="margin:0;color:#3d3b38;font-size:11px;letter-spacing:.06em;text-transform:uppercase;line-height:2.2">
        BABULA SHOTS &nbsp;·&nbsp; SANTO DOMINGO, REPÚBLICA DOMINICANA<br>
        <a href="https://www.fotografosantodomingo.com" style="color:#5a5753;text-decoration:none">fotografosantodomingo.com</a>
      </p>
    </div>
  </div>
</div>`
}

function btn(href: string, label: string, outlined = false): string {
  if (outlined) {
    return `<a href="${href}" style="display:inline-block;background:transparent;border:1px solid #c8a96e;color:#c8a96e;padding:12px 24px;text-decoration:none;font-size:11px;font-weight:700;letter-spacing:.1em;text-transform:uppercase">${label}</a>`
  }
  return `<a href="${href}" style="display:inline-block;background:#c8a96e;color:#0e0e0d;padding:13px 30px;text-decoration:none;font-size:11px;font-weight:700;letter-spacing:.12em;text-transform:uppercase">${label}</a>`
}

function infoRow(label: string, value: string, border = true): string {
  return `<tr>
    <td bgcolor="#1a1815" style="padding:11px 20px;${border ? 'border-bottom:1px solid #2e2c29;' : ''}color:#8a8680;font-size:12px;letter-spacing:.03em;width:40%">${label}</td>
    <td bgcolor="#1a1815" style="padding:11px 20px;${border ? 'border-bottom:1px solid #2e2c29;' : ''}color:#f0ede6;font-size:14px">${value}</td>
  </tr>`
}

// ── HMAC helpers ──────────────────────────────────────────────────────────────

async function hmacSign(secret: string, message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(message))
  return btoa(String.fromCharCode(...new Uint8Array(sig)))
    .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
}

export async function verifyHmac(secret: string, message: string, sig: string): Promise<boolean> {
  const expected = await hmacSign(secret, message)
  return expected === sig
}

export async function buildMagicLinks(
  secret: string,
  workerBaseUrl: string,
  postId: string,
): Promise<{ approveUrl: string; rejectUrl: string }> {
  const ts = Math.floor(Date.now() / 1000)
  const approveSig = await hmacSign(secret, `${postId}:approve:${ts}`)
  const rejectSig = await hmacSign(secret, `${postId}:reject:${ts}`)

  const base = (action: string, sig: string) =>
    `${workerBaseUrl}/${action}?post_id=${postId}&ts=${ts}&sig=${encodeURIComponent(sig)}`

  return { approveUrl: base('approve', approveSig), rejectUrl: base('reject', rejectSig) }
}

// ── Review email ──────────────────────────────────────────────────────────────

export async function sendReviewEmail(
  env: Env,
  postId: string,
  titleEs: string,
  coverImageUrl: string,
  approveUrl: string,
  rejectUrl: string,
): Promise<void> {
  const content = `
    <h2 style="margin:0 0 8px;color:#f0ede6;font-size:22px;font-weight:400;letter-spacing:.03em">Nuevo borrador listo para publicar</h2>
    <p style="margin:0 0 20px;color:#8a8680;font-size:14px;line-height:1.7">
      El pipeline generó un post bilingüe y está esperando tu aprobación. Revísalo abajo.
    </p>
    ${coverImageUrl ? `<img src="${coverImageUrl}" alt="${titleEs}" style="width:100%;max-height:320px;object-fit:cover;display:block;margin:0 0 20px">` : ''}
    <table style="width:100%;border-collapse:collapse;background:#1a1815;border:1px solid #2e2c29;margin:0 0 24px">
      ${infoRow('TÍTULO', titleEs, false)}
    </table>
    <table width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 8px">
      <tr>
        <td align="center">
          ${btn(approveUrl, 'Aprobar y publicar →')}
          &nbsp;&nbsp;
          ${btn(rejectUrl, 'Rechazar', true)}
        </td>
      </tr>
    </table>
    <p style="margin:16px 0 0;color:#5a5753;font-size:11px;text-align:center">
      Este enlace expira en 7 días. Una vez aprobado, el post se publica y se comparte en redes sociales.
    </p>`

  await resendSend(env.RESEND_API_KEY, {
    from: 'Babula Shots <info@fotografosantodomingo.com>',
    to: [env.REVIEW_EMAIL_TO],
    subject: `📸 Nuevo post listo: ${titleEs}`,
    html: shell(content),
  })
}

// ── Results email ─────────────────────────────────────────────────────────────

export async function sendResultsEmail(
  env: Env,
  titleEs: string,
  postUrl: string,
  results: CrossPostResult[],
): Promise<void> {
  const rows = results.map((r) => {
    const icon = r.status === 'posted' ? '✓' : r.status === 'skipped' ? '—' : '✗'
    const color = r.status === 'posted' ? '#4ade80' : r.status === 'skipped' ? '#8a8680' : '#f87171'
    const label = r.platform === 'fb' ? 'Facebook' : r.platform === 'ig' ? 'Instagram' : r.platform === 'li' ? 'LinkedIn' : r.platform === 'pi' ? 'Pinterest' : 'Google Business'
    const detail = r.status === 'posted' ? (r.postId ?? 'ok') : (r.error ?? r.status)
    return `<tr>
      <td style="padding:10px 20px;color:#8a8680;font-size:12px;border-bottom:1px solid #2e2c29">${label}</td>
      <td style="padding:10px 20px;color:${color};font-size:13px;border-bottom:1px solid #2e2c29">${icon} ${detail}</td>
    </tr>`
  }).join('')

  const content = `
    <h2 style="margin:0 0 8px;color:#f0ede6;font-size:22px;font-weight:400">Post publicado</h2>
    <p style="margin:0 0 20px;color:#8a8680;font-size:14px">${titleEs}</p>
    <table style="width:100%;border-collapse:collapse;background:#1a1815;border:1px solid #2e2c29;margin:0 0 24px">
      ${rows}
    </table>
    <table width="100%" cellpadding="0" cellspacing="0">
      <tr><td align="center">${btn(postUrl, 'Ver post en el blog →')}</td></tr>
    </table>`

  await resendSend(env.RESEND_API_KEY, {
    from: 'Babula Shots <info@fotografosantodomingo.com>',
    to: [env.REVIEW_EMAIL_TO],
    subject: `✅ Publicado: ${titleEs}`,
    html: shell(content),
  })
}
