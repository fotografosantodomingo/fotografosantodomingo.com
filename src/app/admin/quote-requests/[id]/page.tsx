import Link from 'next/link'
import { notFound } from 'next/navigation'
import { createServiceClient } from '@/lib/supabase/service'
import { NotesEditor, StatusSelect } from '../QuoteRequestClient'

export const dynamic = 'force-dynamic'

const STATUS_COLORS: Record<string, string> = {
  NEW: 'bg-amber-100 text-amber-800 dark:bg-amber-400/10 dark:text-amber-300',
  REVIEWING: 'bg-sky-100 text-sky-800 dark:bg-sky-400/10 dark:text-sky-300',
  QUOTED: 'bg-violet-100 text-violet-800 dark:bg-violet-400/10 dark:text-violet-300',
  WON: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-400/10 dark:text-emerald-300',
  LOST: 'bg-slate-100 text-slate-600 dark:bg-white/5 dark:text-gray-400',
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <tr className="border-b border-slate-100 dark:border-white/5">
      <td className="w-44 py-2 pr-4 text-sm text-slate-500 dark:text-gray-400">{label}</td>
      <td className="py-2 text-sm text-slate-800 dark:text-gray-200">{children || '—'}</td>
    </tr>
  )
}

export default async function QuoteRequestDetailPage({
  params,
}: {
  params: { id: string }
}) {
  const supabase = createServiceClient()

  const { data: req, error } = await supabase
    .from('quote_requests')
    .select(
      'id, created_at, updated_at, customer_name, customer_email, customer_phone, locale, status, details, event_date, budget_usd, source_page, source_cta, admin_notes, family_id, package_id'
    )
    .eq('id', params.id)
    .single()

  if (error || !req) notFound()

  const [familyRes, packageRes] = await Promise.all([
    req.family_id
      ? supabase.from('service_families').select('id, slug, title_en, icon').eq('id', req.family_id).maybeSingle()
      : Promise.resolve({ data: null }),
    req.package_id
      ? supabase
          .from('service_packages')
          .select('id, slug, name_en, starting_price_usd, family_id')
          .eq('id', req.package_id)
          .maybeSingle()
      : Promise.resolve({ data: null }),
  ])

  const family = familyRes.data as { slug: string; title_en: string; icon: string } | null
  const pkg = packageRes.data as { slug: string; name_en: string; starting_price_usd: number } | null

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <Link href="/admin/quote-requests" className="text-sm text-sky-600 hover:underline dark:text-sky-400">
          ← All requests
        </Link>
        <div className="ml-auto">
          <span className={`rounded-full px-3 py-1 text-sm font-semibold ${STATUS_COLORS[req.status] ?? ''}`}>
            {req.status}
          </span>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-gray-900">
            <h2 className="mb-4 text-lg font-bold text-slate-900 dark:text-white">Request</h2>
            <table className="w-full border-collapse">
              <tbody>
                <Row label="ID"><code className="text-xs">{req.id}</code></Row>
                <Row label="Submitted">{new Date(req.created_at).toLocaleString()}</Row>
                <Row label="Updated">{new Date(req.updated_at).toLocaleString()}</Row>
                <Row label="Locale">{req.locale}</Row>
                <Row label="Family">{family ? `${family.icon} ${family.title_en} (${family.slug})` : ''}</Row>
                <Row label="Package">{pkg ? `${pkg.name_en} — $${Number(pkg.starting_price_usd).toFixed(2)}` : ''}</Row>
                <Row label="Event date">{req.event_date}</Row>
                <Row label="Budget USD">{req.budget_usd ? `$${Number(req.budget_usd).toFixed(2)}` : ''}</Row>
                <Row label="Source page">{req.source_page ? <code className="text-xs">{req.source_page}</code> : ''}</Row>
                <Row label="Source CTA">{req.source_cta}</Row>
              </tbody>
            </table>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-gray-900">
            <h2 className="mb-3 text-lg font-bold text-slate-900 dark:text-white">Customer message</h2>
            <pre className="whitespace-pre-wrap rounded-md bg-slate-50 p-4 text-sm text-slate-800 dark:bg-white/5 dark:text-gray-200">
              {req.details}
            </pre>
          </section>
        </div>

        <div className="space-y-6">
          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-gray-900">
            <h2 className="mb-3 text-lg font-bold text-slate-900 dark:text-white">Customer</h2>
            <table className="w-full border-collapse">
              <tbody>
                <Row label="Name">{req.customer_name}</Row>
                <Row label="Email">
                  <a href={`mailto:${req.customer_email}`} className="text-sky-600 hover:underline dark:text-sky-400">
                    {req.customer_email}
                  </a>
                </Row>
                <Row label="Phone">{req.customer_phone}</Row>
              </tbody>
            </table>
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-gray-900">
            <h2 className="mb-3 text-lg font-bold text-slate-900 dark:text-white">Status</h2>
            <StatusSelect id={req.id} current={req.status} />
          </section>

          <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-gray-900">
            <h2 className="mb-3 text-lg font-bold text-slate-900 dark:text-white">Internal notes</h2>
            <NotesEditor id={req.id} current={req.admin_notes ?? ''} />
          </section>
        </div>
      </div>
    </div>
  )
}
