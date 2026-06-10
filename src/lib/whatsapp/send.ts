// WhatsApp Cloud API sender — shared by the webhook auto-reply and the
// quote-action endpoint (Accept → send proposal to client).

export async function sendWhatsAppText(to: string, message: string): Promise<boolean> {
  const accessToken   = process.env.WHATSAPP_ACCESS_TOKEN
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID
  if (!accessToken || !phoneNumberId) return false

  try {
    const res = await fetch(`https://graph.facebook.com/v19.0/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        Authorization:  `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to,
        type: 'text',
        text: { body: message, preview_url: true },
      }),
    })
    return res.ok
  } catch {
    return false
  }
}
