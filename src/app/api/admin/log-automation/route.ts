import { NextRequest, NextResponse } from 'next/server'
import { ZodError } from 'zod'
import { createServiceClient } from '@/lib/supabase/service'
import { LogAutomationSchema } from '@/lib/automation/schemas'

function isAuthorized(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  const expectedSecret = process.env.ADMIN_SECRET

  if (!authHeader?.startsWith('Bearer ') || !expectedSecret) {
    return false
  }

  const token = authHeader.slice('Bearer '.length)
  return token === expectedSecret
}

export async function POST(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const rawBody = await request.json()
    const body = LogAutomationSchema.parse(rawBody)
    const supabase = createServiceClient()

    const { error } = await supabase
      .from('automation_logs')
      .upsert(body, { onConflict: 'idempotency_key' })

    if (error) {
      console.error('log-automation upsert failed:', error)
      return NextResponse.json(
        { success: false, error: 'Log upsert failed' },
        { status: 200 }
      )
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Validation failed', details: error.issues },
        { status: 422 }
      )
    }

    console.error('log-automation unexpected error:', error)
    return NextResponse.json(
      { success: false, error: 'Unexpected logging error' },
      { status: 200 }
    )
  }
}