import { createServiceClient } from '@/lib/supabase/service'
import { AddOverrideForm, OverrideRow, WeeklyRuleRow } from './AvailabilityEditor'

export const dynamic = 'force-dynamic'

const DAYS_ORDER = [1, 2, 3, 4, 5, 6, 0] as const // Mon → Sun for display

export default async function AdminAvailabilityPage() {
  const supabase = createServiceClient()

  // Solo-staff mode: pick the first active staff member
  const { data: staff } = await supabase
    .from('staff_members')
    .select('id, name')
    .eq('active', true)
    .order('sort_order', { ascending: true })
    .limit(1)
    .single()

  if (!staff) {
    return (
      <div className="rounded-lg border border-amber-300 bg-amber-50 p-6 text-amber-900 dark:border-amber-900 dark:bg-amber-950/40 dark:text-amber-200">
        No active staff member found. Add one in the database first.
      </div>
    )
  }

  const { data: rules } = await supabase
    .from('availability_rules')
    .select('day_of_week, start_time, end_time, active')
    .eq('staff_id', staff.id)

  const ruleByDay: Record<number, { day_of_week: number; start_time: string; end_time: string; active: boolean } | null> = {}
  for (let d = 0; d < 7; d++) ruleByDay[d] = null
  for (const r of rules ?? []) ruleByDay[r.day_of_week] = r

  const todayIso = new Date().toISOString().slice(0, 10)
  const { data: overrides } = await supabase
    .from('availability_overrides')
    .select('id, override_date, is_blocked, custom_start, custom_end, note')
    .eq('staff_id', staff.id)
    .gte('override_date', todayIso)
    .order('override_date', { ascending: true })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 dark:text-white">Availability</h1>
        <p className="mt-1 text-sm text-slate-500 dark:text-gray-400">
          Working hours for {staff.name}. Times in AST (America/Santo_Domingo).
        </p>
      </div>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-gray-900">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-gray-400">
          Weekly schedule
        </h2>
        <div className="grid grid-cols-12 gap-3 border-b border-slate-200 pb-2 text-xs uppercase tracking-wide text-slate-500 dark:border-white/10 dark:text-gray-400">
          <div className="col-span-3">Day</div>
          <div className="col-span-3">Start</div>
          <div className="col-span-3">End</div>
          <div className="col-span-2">Active</div>
          <div className="col-span-1"></div>
        </div>
        {DAYS_ORDER.map(d => (
          <WeeklyRuleRow key={d} staffId={staff.id} dayOfWeek={d} rule={ruleByDay[d]} />
        ))}
      </section>

      <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-gray-900">
        <h2 className="mb-4 text-sm font-semibold uppercase tracking-wide text-slate-500 dark:text-gray-400">
          Date overrides ({overrides?.length ?? 0} upcoming)
        </h2>

        <p className="mb-4 text-sm text-slate-600 dark:text-gray-400">
          Block specific dates (vacation, holidays) or set custom hours for a one-off day.
          Overrides take precedence over the weekly schedule.
        </p>

        <AddOverrideForm staffId={staff.id} />

        {overrides && overrides.length > 0 && (
          <ul className="mt-6">
            {overrides.map(o => (
              <OverrideRow key={o.id} override={o} />
            ))}
          </ul>
        )}
      </section>
    </div>
  )
}
