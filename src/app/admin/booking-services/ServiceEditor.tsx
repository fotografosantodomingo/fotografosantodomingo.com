'use client'

import { useEffect, useState } from 'react'
import { useFormState, useFormStatus } from 'react-dom'
import { createService, toggleServiceFlag, updateService } from './actions'

export type Service = {
  id: string
  slug: string
  name_es: string
  name_en: string
  description_es: string | null
  description_en: string | null
  icon: string
  category: string
  duration_min: number
  price_usd: number
  deposit_percent: number
  sort_order: number
  bookable: boolean
  active: boolean
}

const CATEGORIES = [
  { key: 'celebrations', label: 'Celebrations' },
  { key: 'portraits', label: 'Portraits' },
  { key: 'commercial', label: 'Commercial' },
  { key: 'specialty', label: 'Specialty' },
]

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus()
  return (
    <button
      type="submit"
      disabled={pending}
      className="rounded-md bg-emerald-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-emerald-500 disabled:opacity-50"
    >
      {pending ? 'Saving…' : label}
    </button>
  )
}

export function ToggleFlag({
  id,
  field,
  current,
  label,
}: {
  id: string
  field: 'active' | 'bookable'
  current: boolean
  label: string
}) {
  const [, action] = useFormState(toggleServiceFlag, { error: null, success: false })
  return (
    <form action={action} className="inline">
      <input type="hidden" name="id" value={id} />
      <input type="hidden" name="field" value={field} />
      <input type="hidden" name="value" value={(!current).toString()} />
      <button
        type="submit"
        className={
          current
            ? 'inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300'
            : 'inline-flex items-center gap-1 rounded-full bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-500 hover:bg-slate-200 dark:bg-white/10 dark:text-gray-400'
        }
        title={`Click to ${current ? 'disable' : 'enable'} ${label}`}
      >
        {label}: {current ? 'on' : 'off'}
      </button>
    </form>
  )
}

export function EditServiceButton({ service }: { service: Service }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-emerald-600 hover:text-emerald-500 dark:text-emerald-400"
      >
        Edit
      </button>
      {open && <ServiceFormDialog mode="edit" service={service} onClose={() => setOpen(false)} />}
    </>
  )
}

export function NewServiceButton() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500"
      >
        + New service
      </button>
      {open && <ServiceFormDialog mode="create" onClose={() => setOpen(false)} />}
    </>
  )
}

function ServiceFormDialog({
  mode,
  service,
  onClose,
}: {
  mode: 'create' | 'edit'
  service?: Service
  onClose: () => void
}) {
  const [state, action] = useFormState(
    mode === 'create' ? createService : updateService,
    { error: null, success: false }
  )

  useEffect(() => {
    if (state.success) onClose()
  }, [state.success, onClose])

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
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl border border-slate-200 bg-white p-6 shadow-xl dark:border-white/10 dark:bg-gray-900"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
          {mode === 'create' ? 'New service' : `Edit: ${service?.name_en}`}
        </h2>

        <form action={action} className="space-y-4 text-sm">
          {service && <input type="hidden" name="id" value={service.id} />}

          <div className="grid grid-cols-2 gap-3">
            <Field label="Slug (URL-friendly)" name="slug" defaultValue={service?.slug} required />
            <Field label="Icon (emoji)" name="icon" defaultValue={service?.icon ?? '📷'} maxLength={4} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Name (ES)" name="nameEs" defaultValue={service?.name_es} required />
            <Field label="Name (EN)" name="nameEn" defaultValue={service?.name_en} required />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <TextArea label="Description (ES)" name="descriptionEs" defaultValue={service?.description_es ?? ''} />
            <TextArea label="Description (EN)" name="descriptionEn" defaultValue={service?.description_en ?? ''} />
          </div>

          <div className="grid grid-cols-4 gap-3">
            <Field label="Duration (min)" name="durationMin" type="number" defaultValue={service?.duration_min ?? 60} required />
            <Field label="Price USD" name="priceUsd" type="number" step="0.01" defaultValue={service?.price_usd ?? 0} required />
            <Field label="Deposit %" name="depositPercent" type="number" defaultValue={service?.deposit_percent ?? 50} required />
            <Field label="Sort order" name="sortOrder" type="number" defaultValue={service?.sort_order ?? 0} />
          </div>

          <label className="block">
            <span className="font-medium text-slate-700 dark:text-gray-200">Category</span>
            <select
              name="category"
              defaultValue={service?.category ?? 'portraits'}
              className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 dark:border-white/20 dark:bg-gray-800 dark:text-white"
            >
              {CATEGORIES.map(c => (
                <option key={c.key} value={c.key}>{c.label}</option>
              ))}
            </select>
          </label>

          <div className="flex gap-6">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="bookable"
                defaultChecked={service?.bookable ?? true}
                className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-slate-700 dark:text-gray-200">Bookable (online)</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                name="active"
                defaultChecked={service?.active ?? true}
                className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
              />
              <span className="text-slate-700 dark:text-gray-200">Active (visible)</span>
            </label>
          </div>

          {state.error && (
            <div className="rounded-md border border-red-300 bg-red-50 p-3 text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
              {state.error}
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md border border-slate-300 px-4 py-1.5 text-slate-700 hover:bg-slate-100 dark:border-white/20 dark:text-gray-200 dark:hover:bg-white/5"
            >
              Cancel
            </button>
            <Submit label={mode === 'create' ? 'Create service' : 'Save changes'} />
          </div>
        </form>
      </div>
    </div>
  )
}

function Field({
  label,
  name,
  ...rest
}: {
  label: string
  name: string
} & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="font-medium text-slate-700 dark:text-gray-200">{label}</span>
      <input
        {...rest}
        name={name}
        className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 dark:border-white/20 dark:bg-gray-800 dark:text-white"
      />
    </label>
  )
}

function TextArea({
  label,
  name,
  defaultValue,
}: {
  label: string
  name: string
  defaultValue?: string
}) {
  return (
    <label className="block">
      <span className="font-medium text-slate-700 dark:text-gray-200">{label}</span>
      <textarea
        name={name}
        rows={3}
        defaultValue={defaultValue}
        className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 dark:border-white/20 dark:bg-gray-800 dark:text-white"
      />
    </label>
  )
}
