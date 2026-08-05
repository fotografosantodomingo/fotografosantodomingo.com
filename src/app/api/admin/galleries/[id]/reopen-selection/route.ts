import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/service'
import { isAdminSession } from '@/lib/supabase/admin-auth'

export const runtime = 'edge'

type Params = { params: { id: string } }

/**
 * POST /api/admin/galleries/[id]/reopen-selection
 *
 * Recovery for "client submitted, then realized they want to change
 * something." Client's prior picks stay intact (SwipeSelector resumes from
 * server state) — this just flips status back so they can adjust and
 * resubmit.
 *
 * Deliberately refuses once an overage was actually paid: submit-selection
 * always charges the FULL tier amount, not an incremental difference, so a
 * reopen-then-resubmit after a paid overage could double-charge the client
 * if their new selection crosses into a higher tier. That case needs a
 * human (refund/adjust manually), not this automated path.
 */
export async function POST(req: NextRequest, { params }: Params) {
  if (!(await isAdminSession(req))) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const supabase = createServiceClient()
  const { data: gallery } = await supabase
    .from('galleries')
    .select('id, status, selection_payment_status')
    .eq('id', params.id)
    .single()

  if (!gallery) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  if (gallery.status !== 'selected') {
    return NextResponse.json({ error: 'Gallery is not in a submitted-selection state' }, { status: 409 })
  }
  if (gallery.selection_payment_status === 'paid') {
    return NextResponse.json(
      {
        error:
          'An overage was already paid for this selection — reopening could cause a double charge if they select more. Handle this one manually.',
      },
      { status: 409 }
    )
  }

  const { error } = await supabase
    .from('galleries')
    .update({ status: 'selecting', selection_submitted_at: null, updated_at: new Date().toISOString() })
    .eq('id', params.id)

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}
