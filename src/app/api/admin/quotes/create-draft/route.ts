import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { createServiceClient } from '@/lib/supabase/service'
import { getChecklistTemplate } from '@/lib/quotes/checklist'

export const runtime = 'edge'

async function isAdminSession(req: NextRequest): Promise<boolean> {
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { get: (name: string) => req.cookies.get(name)?.value, set: () => {}, remove: () => {} } }
  )
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) return false
  const { data } = await supabase.from('admin_users').select('user_id').eq('user_id', session.user.id).single()
  return !!data
}

export async function POST(req: NextRequest) {
  if (!await isAdminSession(req)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: Record<string, unknown>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const full_name = typeof body.full_name === 'string' ? body.full_name.trim() || null : null
  const whatsapp_phone = typeof body.whatsapp_phone === 'string' ? body.whatsapp_phone.trim() || null : null
  const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() || null : null
  const service_type = typeof body.service_type === 'string' ? body.service_type || null : null
  const event_date = typeof body.event_date === 'string' ? body.event_date || null : null
  const city = typeof body.city === 'string' ? body.city.trim() || null : null
  const country = typeof body.country === 'string' ? body.country.trim() || null : null
  const description = typeof body.description === 'string' ? body.description.trim() || null : null
  const whatsapp_raw_text = typeof body.whatsapp_raw_text === 'string' ? body.whatsapp_raw_text.trim() || null : null
  const client_company = typeof body.client_company === 'string' ? body.client_company.trim() || null : null
  const locale = body.locale === 'en' ? 'en' : 'es'

  const scoping_checklist = getChecklistTemplate(service_type)

  const supabase = createServiceClient()
  const { data, error } = await supabase
    .from('quotes')
    .insert({
      status: 'DRAFT',
      locale,
      full_name,
      whatsapp_phone,
      email,
      service_type,
      event_date,
      city,
      country,
      description,
      whatsapp_raw_text,
      client_company,
      scoping_checklist,
      payment_mode: 'FULL',
    })
    .select('id')
    .single()

  if (error || !data) {
    console.error('[create-draft] DB insert error:', error)
    return NextResponse.json({ error: 'Failed to create draft' }, { status: 500 })
  }

  return NextResponse.json({ ok: true, id: data.id }, { status: 201 })
}
