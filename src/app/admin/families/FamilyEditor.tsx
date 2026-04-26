'use client'

import { useEffect, useState } from 'react'
import { useFormState, useFormStatus } from 'react-dom'
import { createFamily, toggleFamilyFlag, updateFamily } from './actions'

export type Family = {
  id: string
  slug: string
  title_es: string
  title_en: string
  tagline_es: string | null
  tagline_en: string | null
  icon: string
  seo_parent_url: string
  bookable: boolean
  quoteable: boolean
  active: boolean
  sort_order: number
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
  field: 'active' | 'bookable' | 'quoteable'
  current: boolean
  label: string
}) {
  const [, action] = useFormState(toggleFamilyFlag, { error: null, success: false })
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

export function NewFamilyButton() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="rounded-full bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-500"
      >
        + New family
      </button>
      {open && <FamilyDialog mode="create" onClose={() => setOpen(false)} />}
    </>
  )
}

export function EditFamilyButton({ family }: { family: Family }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="text-emerald-600 hover:text-emerald-500 dark:text-emerald-400"
      >
        Edit
      </button>
      {open && <FamilyDialog mode="edit" family={family} onClose={() => setOpen(false)} />}
    </>
  )
}

function FamilyDialog({
  mode,
  family,
  onClose,
}: {
  mode: 'create' | 'edit'
  family?: Family
  onClose: () => void
}) {
  const [state, action] = useFormState(
    mode === 'create' ? createFamily : updateFamily,
    { error: null, success: false }
  )

  useEffect(() => {
    if (state.success) onClose()
  }, [state.success, onClose])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" onClick={onClose}>
      <div
        className="w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl border border-slate-200 bg-white p-6 shadow-xl dark:border-white/10 dark:bg-gray-900"
        onClick={e => e.stopPropagation()}
      >
        <h2 className="mb-4 text-lg font-semibold text-slate-900 dark:text-white">
          {mode === 'create' ? 'New service family' : `Edit: ${family?.title_en}`}
        </h2>

        <form action={action} className="space-y-4 text-sm">
          {family && <input type="hidden" name="id" value={family.id} />}

          <div className="grid grid-cols-2 gap-3">
            <Field label="Slug" name="slug" defaultValue={family?.slug} required />
            <Field label="Icon (emoji)" name="icon" defaultValue={family?.icon ?? '📷'} maxLength={8} />
          </div>

          <Field label="SEO parent URL" name="seo_parent_url" defaultValue={family?.seo_parent_url} required placeholder="/services/wedding-photography" />

          <div className="grid grid-cols-2 gap-3">
            <Field label="Title (ES)" name="title_es" defaultValue={family?.title_es} required />
            <Field label="Title (EN)" name="title_en" defaultValue={family?.title_en} required />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <TextArea label="Tagline (ES)" name="tagline_es" defaultValue={family?.tagline_es ?? ''} />
            <TextArea label="Tagline (EN)" name="tagline_en" defaultValue={family?.tagline_en ?? ''} />
          </div>

          <Field label="Sort order" name="sort_order" type="number" defaultValue={family?.sort_order ?? 0} />

          <div className="flex flex-wrap gap-6">
            <Checkbox label="Active (visible)" name="active" defaultChecked={family?.active ?? true} />
            <Checkbox label="Bookable" name="bookable" defaultChecked={family?.bookable ?? true} />
            <Checkbox label="Quoteable" name="quoteable" defaultChecked={family?.quoteable ?? true} />
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
            <Submit label={mode === 'create' ? 'Create family' : 'Save changes'} />
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
}: { label: string; name: string; defaultValue?: string }) {
  return (
    <label className="block">
      <span className="font-medium text-slate-700 dark:text-gray-200">{label}</span>
      <textarea
        name={name}
        rows={2}
        defaultValue={defaultValue}
        className="mt-1 w-full rounded-md border border-slate-300 bg-white px-3 py-2 dark:border-white/20 dark:bg-gray-800 dark:text-white"
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
