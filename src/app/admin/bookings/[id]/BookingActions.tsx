'use client'

import { useEffect, useState, useTransition } from 'react'
import { useFormState, useFormStatus } from 'react-dom'
import { cancelBooking, markBookingStatus, rescheduleBooking } from './actions'

type Props = {
  bookingId: string
  staffId: string
  durationMin: number
  status: string
  depositCents: number
  alreadyRefundedUsd: number
}

function SubmitButton({ label, variant = 'primary' }: { label: string; variant?: 'primary' | 'danger' | 'neutral' }) {
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
      className={`rounded-full px-4 py-1.5 text-sm font-semibold transition disabled:opacity-50 ${cls}`}
    >
      {pending ? 'Working…' : label}
    </button>
  )
}

export default function BookingActions(props: Props) {
  const [showCancel, setShowCancel] = useState(false)
  const [showReschedule, setShowReschedule] = useState(false)

  const isCancelled = props.status === 'CANCELLED'
  const isFinal = isCancelled || props.status === 'COMPLETED' || props.status === 'NO_SHOW'

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        {!isFinal && (
          <>
            <button
              onClick={() => setShowReschedule(true)}
              className="rounded-full border border-slate-300 px-4 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-100 dark:border-white/20 dark:text-gray-200 dark:hover:bg-white/5"
            >
              Reschedule
            </button>
            <button
              onClick={() => setShowCancel(true)}
              className="rounded-full bg-red-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-red-500"
            >
              Cancel + refund
            </button>
          </>
        )}
        {props.status === 'CONFIRMED' && (
          <>
            <StatusForm bookingId={props.bookingId} status="COMPLETED" label="Mark completed" />
            <StatusForm bookingId={props.bookingId} status="NO_SHOW" label="Mark no-show" />
          </>
        )}
      </div>

      {showCancel && (
        <CancelDialog
          bookingId={props.bookingId}
          depositCents={props.depositCents}
          alreadyRefundedUsd={props.alreadyRefundedUsd}
          onClose={() => setShowCancel(false)}
        />
      )}

      {showReschedule && (
        <RescheduleDialog
          bookingId={props.bookingId}
          staffId={props.staffId}
          durationMin={props.durationMin}
          onClose={() => setShowReschedule(false)}
        />
      )}
    </div>
  )
}

function StatusForm({ bookingId, status, label }: { bookingId: string; status: string; label: string }) {
  const [, action] = useFormState(markBookingStatus, { error: null, success: false })
  return (
    <form action={action}>
      <input type="hidden" name="bookingId" value={bookingId} />
      <input type="hidden" name="status" value={status} />
      <SubmitButton label={label} variant="neutral" />
    </form>
  )
}

function CancelDialog({
  bookingId,
  depositCents,
  alreadyRefundedUsd,
  onClose,
}: {
  bookingId: string
  depositCents: number
  alreadyRefundedUsd: number
  onClose: () => void
}) {
  const [state, action] = useFormState(cancelBooking, { error: null, success: false })
  const [refundUsd, setRefundUsd] = useState((depositCents - alreadyRefundedUsd * 100) / 100)
  const refundCents = Math.round(refundUsd * 100)

  useEffect(() => {
    if (state.success) onClose()
  }, [state.success, onClose])

  return (
    <Modal onClose={onClose} title="Cancel booking + refund">
      <form action={action} className="space-y-4">
        <input type="hidden" name="bookingId" value={bookingId} />
        <input type="hidden" name="refundCents" value={refundCents} />

        <label className="block text-sm">
          <span className="font-medium text-slate-700 dark:text-gray-200">
            Reason (sent to customer if email is enabled later)
          </span>
          <textarea
            name="reason"
            rows={3}
            defaultValue="Cancelled by admin"
            className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-white/20 dark:bg-gray-800 dark:text-white"
          />
        </label>

        <label className="block text-sm">
          <span className="font-medium text-slate-700 dark:text-gray-200">
            Refund amount (USD)
          </span>
          <div className="mt-1 flex items-center gap-2">
            <span className="text-slate-500">$</span>
            <input
              type="number"
              step="0.01"
              min="0"
              max={(depositCents / 100).toFixed(2)}
              value={refundUsd}
              onChange={e => setRefundUsd(Number(e.target.value))}
              className="w-32 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-white/20 dark:bg-gray-800 dark:text-white"
            />
            <span className="text-xs text-slate-500 dark:text-gray-400">
              max ${(depositCents / 100).toFixed(2)}
              {alreadyRefundedUsd > 0 && ` (already refunded $${alreadyRefundedUsd.toFixed(2)})`}
            </span>
          </div>
        </label>

        {state.error && (
          <div className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
            {state.error}
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-300 px-4 py-1.5 text-sm text-slate-700 hover:bg-slate-100 dark:border-white/20 dark:text-gray-200 dark:hover:bg-white/5"
          >
            Cancel
          </button>
          <SubmitButton
            label={refundCents > 0 ? `Cancel + refund $${refundUsd.toFixed(2)}` : 'Cancel (no refund)'}
            variant="danger"
          />
        </div>
      </form>
    </Modal>
  )
}

function RescheduleDialog({
  bookingId,
  staffId,
  durationMin,
  onClose,
}: {
  bookingId: string
  staffId: string
  durationMin: number
  onClose: () => void
}) {
  const [state, action] = useFormState(rescheduleBooking, { error: null, success: false })
  const today = new Date()
  const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString().slice(0, 10)
  const [date, setDate] = useState(tomorrow)
  const [slots, setSlots] = useState<{ time: string; startsAtUtc: string }[]>([])
  const [selected, setSelected] = useState<string | null>(null)
  const [loading, startTransition] = useTransition()

  useEffect(() => {
    if (!date) return
    const ctrl = new AbortController()
    startTransition(() => {
      fetch(
        `/api/bookings/availability?staff_id=${staffId}&date=${date}&duration_min=${durationMin}`,
        { signal: ctrl.signal }
      )
        .then(r => r.json())
        .then(data => {
          setSlots(data.slots ?? [])
          setSelected(null)
        })
        .catch(() => {
          setSlots([])
        })
    })
    return () => ctrl.abort()
  }, [date, staffId, durationMin])

  useEffect(() => {
    if (state.success) onClose()
  }, [state.success, onClose])

  return (
    <Modal onClose={onClose} title="Reschedule booking">
      <form action={action} className="space-y-4">
        <input type="hidden" name="bookingId" value={bookingId} />
        {selected && <input type="hidden" name="startsAt" value={selected} />}

        <label className="block text-sm">
          <span className="font-medium text-slate-700 dark:text-gray-200">New date (AST)</span>
          <input
            type="date"
            value={date}
            min={tomorrow}
            onChange={e => setDate(e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm dark:border-white/20 dark:bg-gray-800 dark:text-white"
          />
        </label>

        <div>
          <div className="mb-2 text-sm font-medium text-slate-700 dark:text-gray-200">Available slots</div>
          {loading ? (
            <div className="text-sm text-slate-500 dark:text-gray-400">Loading…</div>
          ) : slots.length === 0 ? (
            <div className="rounded-md border border-dashed border-slate-300 p-3 text-sm text-slate-500 dark:border-white/10 dark:text-gray-400">
              No slots available on this date.
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
              {slots.map(s => (
                <button
                  type="button"
                  key={s.startsAtUtc}
                  onClick={() => setSelected(s.startsAtUtc)}
                  className={
                    selected === s.startsAtUtc
                      ? 'rounded-md bg-emerald-600 px-3 py-2 text-sm font-semibold text-white'
                      : 'rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-100 dark:border-white/20 dark:text-gray-200 dark:hover:bg-white/5'
                  }
                >
                  {s.time}
                </button>
              ))}
            </div>
          )}
        </div>

        {state.error && (
          <div className="rounded-md border border-red-300 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
            {state.error}
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-300 px-4 py-1.5 text-sm text-slate-700 hover:bg-slate-100 dark:border-white/20 dark:text-gray-200 dark:hover:bg-white/5"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={!selected}
            className="rounded-full bg-emerald-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
          >
            Reschedule
          </button>
        </div>
      </form>
    </Modal>
  )
}

function Modal({
  title,
  children,
  onClose,
}: {
  title: string
  children: React.ReactNode
  onClose: () => void
}) {
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={onClose}
    >
      <div
        className="w-full max-w-lg rounded-xl border border-slate-200 bg-white p-6 shadow-xl dark:border-white/10 dark:bg-gray-900"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">{title}</h2>
        {children}
      </div>
    </div>
  )
}
