'use client'

import { useEffect, useState } from 'react'
import { useFormState, useFormStatus } from 'react-dom'
import { createPackage, togglePackageFlag, updatePackage } from './actions'

export type FamilyOption = {
  id: string
  slug: string
  title_en: string
  icon: string
}

export type Package = {
  id: string
  family_id: string
  slug: string
  name_es: string
  name_en: string
  description_short_es: string | null
  description_short_en: string | null
  inclusions_es: string[]
  inclusions_en: string[]
  duration_min: number
  starting_price_usd: number | string
  deposit_percent: number
  photo_count: number | null
  minimum_billable_hours: number | null
  bookable_direct: boolean
  custom_quote_allowed: boolean
  featured: boolean
  popular_badge: 'most_booked' | 'best_value' | null
  active: boolean
  sort_order: number
  legacy_aliases: string[]
}

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
  field: 'active' | 'bookable_direct' | 'custom_quote_allowed' | 'featured'
  current: boolean
  label: string
}) {
  const [, action] = useFormState(togglePackageFlag, { error: null, success: false })
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
      >
        {label}: {current ? 'on' : 'off'}
      </button>
    </form>
  )
}

export function NewPackageButton({ families }: { families: FamilyOption[] }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500"
      >
        + New package
      </button>
      {open && <PackageDialog mode="create" families={families} onClose={() => setOpen(false)} />}
    </>
  )
}

export function EditPackageButton({
  pkg,
  families,
}: {
  pkg: Package
  families: FamilyOption[]
}) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-emerald-600 hover:text-emerald-500 dark:text-emerald-400"
      >
        Edit
      </button>
      {open && (
        <PackageDialog mode="edit" pkg={pkg} families={families} onClose={() => setOpen(false)} />
      )}
    </>
  )
}

function PackageDialog({
  mode,
  pkg,
  families,
  onClose,
}: {
  mode: 'create' | 'edit'
  pkg?: Package
  families: FamilyOption[]
  onClose: () => void
}) {
  const [state, action] = useFormState(
    mode === 'create' ? createPackage : updatePackage,
    { error: null, success: false }
  )

  useEffect(() => { if (state.success) onClose() }, [state.success, onClose])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  const inclusionsEsText = (pkg?.inclusions_es ?? []).join('\n')
  const inclusionsEnText = (pkg?.inclusions_en ?? []).join('\n')
  const priceNum = pkg ? Number(pkg.starting_price_usd) : 0

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-xl border border-slate-200 bg-white p-6 shadow-xl dark:border-white/10 dark:bg-gray-900"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
          {mode === 'create' ? 'New package' : `Edit: ${pkg?.name_en}`}
        </h2>

        <form action={action} className="space-y-4 text-sm">
          {pkg && <input type="hidden" name="id" value={pkg.id} />}

          <label className="block">
            <span className="font-medium text-slate-700 dark:text-gray-200">Family</span>
            <select
              name="family_id"
              defaultValue={pkg?.family_id ?? families[0]?.id}
              required
              className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 dark:border-white/20 dark:bg-gray-800 dark:text-white"
            >
              {families.map(f => (
                <option key={f.id} value={f.id}>{f.icon} {f.title_en} ({f.slug})</option>
              ))}
            </select>
          </label>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Slug (unique within family)" name="slug" defaultValue={pkg?.slug} required />
            <Field label="Sort order" name="sort_order" type="number" defaultValue={pkg?.sort_order ?? 0} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Name (ES)" name="name_es" defaultValue={pkg?.name_es} required />
            <Field label="Name (EN)" name="name_en" defaultValue={pkg?.name_en} required />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <TextArea label="Short description (ES)" name="description_short_es" defaultValue={pkg?.description_short_es ?? ''} />
            <TextArea label="Short description (EN)" name="description_short_en" defaultValue={pkg?.description_short_en ?? ''} />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <TextArea
              label="Inclusions (ES) — one per line"
              name="inclusions_es"
              rows={6}
              defaultValue={inclusionsEsText}
            />
            <TextArea
              label="Inclusions (EN) — one per line"
              name="inclusions_en"
              rows={6}
              defaultValue={inclusionsEnText}
            />
          </div>
          <p className="-mt-2 text-xs text-slate-500 dark:text-gray-400">
            ES and EN must have the same number of lines (parallel index alignment).
          </p>

          <div className="grid grid-cols-3 gap-3">
            <Field label="Duration (min)" name="duration_min" type="number" defaultValue={pkg?.duration_min ?? 60} required />
            <Field label="Starting price USD" name="starting_price_usd" type="number" step="0.01" defaultValue={priceNum} required />
            <Field label="Deposit %" name="deposit_percent" type="number" defaultValue={pkg?.deposit_percent ?? 50} required />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <Field
              label="Photo count (optional)"
              name="photo_count"
              type="number"
              defaultValue={pkg?.photo_count ?? ''}
              placeholder="leave blank if N/A"
            />
            <Field
              label="Minimum billable hours"
              name="minimum_billable_hours"
              type="number"
              defaultValue={pkg?.minimum_billable_hours ?? ''}
              placeholder="for hourly packages"
            />
            <label className="block">
              <span className="font-medium text-slate-700 dark:text-gray-200">Popular badge</span>
              <select
                name="popular_badge"
                defaultValue={pkg?.popular_badge ?? ''}
                className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 dark:border-white/20 dark:bg-gray-800 dark:text-white"
              >
                <option value="">— none —</option>
                <option value="most_booked">most_booked</option>
                <option value="best_value">best_value</option>
              </select>
            </label>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Checkbox label="Bookable direct (online wizard)" name="bookable_direct" defaultChecked={pkg?.bookable_direct ?? true} />
            <Checkbox label="Custom quote allowed" name="custom_quote_allowed" defaultChecked={pkg?.custom_quote_allowed ?? true} />
            <Checkbox label="Featured (elevated card)" name="featured" defaultChecked={pkg?.featured ?? false} />
            <Checkbox label="Active (visible)" name="active" defaultChecked={pkg?.active ?? true} />
          </div>

          {pkg && pkg.legacy_aliases.length > 0 && (
            <div className="rounded-md border border-slate-200 bg-slate-50 p-3 dark:border-white/10 dark:bg-white/5">
              <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-gray-400">
                Legacy aliases (read-only)
              </div>
              <div className="mt-1 font-mono text-xs text-slate-700 dark:text-gray-300">
                {pkg.legacy_aliases.join(', ')}
              </div>
            </div>
          )}

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
            <Submit label={mode === 'create' ? 'Create package' : 'Save changes'} />
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
}: { label: string; name: string } & React.InputHTMLAttributes<HTMLInputElement>) {
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
  rows = 3,
}: { label: string; name: string; defaultValue?: string; rows?: number }) {
  return (
    <label className="block">
      <span className="font-medium text-slate-700 dark:text-gray-200">{label}</span>
      <textarea
        name={name}
        rows={rows}
        defaultValue={defaultValue}
        className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 font-mono text-xs dark:border-white/20 dark:bg-gray-800 dark:text-white"
      />
    </label>
  )
}

function Checkbox({
  label,
  name,
  defaultChecked,
}: { label: string; name: string; defaultChecked?: boolean }) {
  return (
    <label className="flex items-center gap-2">
      <input
        type="checkbox"
        name={name}
        defaultChecked={defaultChecked}
        className="h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
      />
      <span className="text-slate-700 dark:text-gray-200">{label}</span>
    </label>
  )
}
