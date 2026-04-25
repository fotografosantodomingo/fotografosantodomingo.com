'use client'

import { useFormState, useFormStatus } from 'react-dom'
import { useState } from 'react'
import { upsertWeeklyRule, addDateOverride, deleteDateOverride } from './actions'

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

type Rule = {
  day_of_week: number
  start_time: string // 'HH:MM:SS'
  end_time: string
  active: boolean
}

type Override = {
  id: string
  override_date: string
  is_blocked: boolean
  custom_start: string | null
  custom_end: string | null
  note: string | null
}

function Submit({ label, variant = 'primary' }: { label: string; variant?: 'primary' | 'danger' | 'neutral' }) {
  const { pending } = useFormStatus()
  const cls =
    variant === 'danger'
      ? 'bg-red-600 hover:bg-red-500 text-white'
      : variant === 'neutral'
        ? 'border border-slate-300 hover:bg-slate-100 text-slate-700 dark:border-white/20 dark:text-gray-200 dark:hover:bg-white/5'
        : 'bg-emerald-600 hover:bg-emerald-500 text-white'
  return (
    <button
      type="submit"
      disabled={pending}
      className={`rounded-md px-3 py-1.5 text-sm font-semibold transition disabled:opacity-50 ${cls}`}
    >
      {pending ? '…' : label}
    </button>
  )
}

export function WeeklyRuleRow({
  staffId,
  dayOfWeek,
  rule,
}: {
  staffId: string
  dayOfWeek: number
  rule: Rule | null
}) {
  const [state, action] = useFormState(upsertWeeklyRule, { error: null, success: false })
  const start = rule?.start_time?.slice(0, 5) ?? ''
  const end = rule?.end_time?.slice(0, 5) ?? ''
  const active = rule?.active ?? false

  return (
    <form action={action} className="grid grid-cols-12 items-center gap-3 border-b border-slate-100 py-3 dark:border-white/5">
      <input type="hidden" name="staffId" value={staffId} />
      <input type="hidden" name="dayOfWeek" value={dayOfWeek} />

      <div className="col-span-3 font-medium text-slate-900 dark:text-white">
        {DAYS[dayOfWeek]}
      </div>

      <label className="col-span-3 flex items-center gap-2 text-sm">
        <input
          type="time"
          name="startTime"
          defaultValue={start}
          required
          className="w-full rounded-md border border-slate-300 bg-white px-2 py-1 dark:border-white/20 dark:bg-gray-800 dark:text-white"
        />
      </label>

      <label className="col-span-3 flex items-center gap-2 text-sm">
        <input
          type="time"
          name="endTime"
          defaultValue={end}
          required
          className="w-full rounded-md border border-slate-300 bg-white px-2 py-1 dark:border-white/20 dark:bg-gray-800 dark:text-white"
        />
      </label>

      <label className="col-span-2 flex items-center gap-2 text-sm text-slate-700 dark:text-gray-200">
        <input
          type="checkbox"
          name="active"
          defaultChecked={active}
          className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
        />
        Active
      </label>

      <div className="col-span-1 text-right">
        <Submit label="Save" />
      </div>

      {state.error && (
        <div className="col-span-12 text-xs text-red-600 dark:text-red-400">{state.error}</div>
      )}
    </form>
  )
}

export function AddOverrideForm({ staffId }: { staffId: string }) {
  const [state, action] = useFormState(addDateOverride, { error: null, success: false })
  const [mode, setMode] = useState<'block' | 'custom'>('block')

  return (
    <form action={action} className="space-y-3 rounded-lg border border-dashed border-slate-300 p-4 dark:border-white/10">
      <input type="hidden" name="staffId" value={staffId} />

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        <label className="block text-sm">
          <span className="font-medium text-slate-700 dark:text-gray-200">Date</span>
          <input
            type="date"
            name="date"
            required
            className="mt-1 w-full rounded-md border border-slate-300 bg-white px-2 py-1 dark:border-white/20 dark:bg-gray-800 dark:text-white"
          />
        </label>

        <label className="block text-sm">
          <span className="font-medium text-slate-700 dark:text-gray-200">Mode</span>
          <select
            name="mode"
            value={mode}
            onChange={e => setMode(e.target.value as 'block' | 'custom')}
            className="mt-1 w-full rounded-md border border-slate-300 bg-white px-2 py-1 dark:border-white/20 dark:bg-gray-800 dark:text-white"
          >
            <option value="block">Block (no slots)</option>
            <option value="custom">Custom hours</option>
          </select>
        </label>

        <label className="block text-sm">
          <span className="font-medium text-slate-700 dark:text-gray-200">Note (optional)</span>
          <input
            type="text"
            name="note"
            placeholder="Vacation, holiday, etc."
            className="mt-1 w-full rounded-md border border-slate-300 bg-white px-2 py-1 dark:border-white/20 dark:bg-gray-800 dark:text-white"
          />
        </label>
      </div>

      {mode === 'custom' && (
        <div className="grid grid-cols-2 gap-3">
          <label className="block text-sm">
            <span className="font-medium text-slate-700 dark:text-gray-200">Custom start</span>
            <input
              type="time"
              name="customStart"
              required
              className="mt-1 w-full rounded-md border border-slate-300 bg-white px-2 py-1 dark:border-white/20 dark:bg-gray-800 dark:text-white"
            />
          </label>
          <label className="block text-sm">
            <span className="font-medium text-slate-700 dark:text-gray-200">Custom end</span>
            <input
              type="time"
              name="customEnd"
              required
              className="mt-1 w-full rounded-md border border-slate-300 bg-white px-2 py-1 dark:border-white/20 dark:bg-gray-800 dark:text-white"
            />
          </label>
        </div>
      )}

      {state.error && (
        <div className="text-xs text-red-600 dark:text-red-400">{state.error}</div>
      )}

      <div className="flex justify-end">
        <Submit label="Add override" />
      </div>
    </form>
  )
}

export function OverrideRow({ override }: { override: Override }) {
  const [state, action] = useFormState(deleteDateOverride, { error: null, success: false })
  return (
    <li className="flex items-center justify-between border-b border-slate-100 py-2 text-sm dark:border-white/5">
      <div>
        <span className="font-medium text-slate-900 dark:text-white">{override.override_date}</span>
        {override.is_blocked ? (
          <span className="ml-2 inline-flex rounded-full bg-red-100 px-2 py-0.5 text-xs text-red-700 dark:bg-red-950/40 dark:text-red-300">
            Blocked
          </span>
        ) : (
          <span className="ml-2 inline-flex rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700 dark:bg-amber-950/40 dark:text-amber-300">
            Custom: {override.custom_start?.slice(0, 5)} – {override.custom_end?.slice(0, 5)}
          </span>
        )}
        {override.note && (
          <span className="ml-2 text-slate-500 dark:text-gray-400">— {override.note}</span>
        )}
      </div>
      <form action={action}>
        <input type="hidden" name="overrideId" value={override.id} />
        <button
          type="submit"
          className="text-xs text-red-600 hover:underline dark:text-red-400"
        >
          Remove
        </button>
        {state.error && <span className="ml-2 text-xs text-red-600">{state.error}</span>}
      </form>
    </li>
  )
}
