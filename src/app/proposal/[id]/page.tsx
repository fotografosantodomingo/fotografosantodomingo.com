import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { createServiceClient } from '@/lib/supabase/service'
import { generateJsonLd, schemaGenerators } from '@/components/seo/JsonLd'
import ProposalCheckoutButton from './ProposalCheckoutButton'
import crypto from 'crypto'

export const dynamic = 'force-dynamic'
export const metadata: Metadata = {
  title: 'Your Proposal — Babula Shots',
  robots: { index: false, follow: false },
}

const BASE_URL = 'https://www.fotografosantodomingo.com'

function hashToken(raw: string): string {
  return crypto.createHash('sha256').update(raw).digest('hex')
}

const SERVICE_LABELS: Record<string, { es: string; en: string }> = {
  WEDDINGS: { es: 'Fotografía de Bodas', en: 'Wedding Photography' },
  ENGAGEMENT_SESSION: { es: 'Sesión de Compromiso', en: 'Engagement Session' },
  QUINCEANERAS: { es: 'Quinceañera', en: 'Quinceañera' },
  MATERNITY: { es: 'Maternidad', en: 'Maternity' },
  FAMILY: { es: 'Sesión Familiar', en: 'Family Session' },
  BIRTHDAY_PARTY: { es: 'Fiesta de Cumpleaños', en: 'Birthday Party' },
  BAPTISMS: { es: 'Bautizo', en: 'Baptism' },
  GRADUATION: { es: 'Graduación', en: 'Graduation' },
  CHILDRENS_SESSIONS: { es: 'Sesión Infantil', en: "Children's Session" },
  ARCHITECTURE: { es: 'Arquitectura', en: 'Architecture' },
  PORTRAITS: { es: 'Retratos', en: 'Portraits' },
  CORPORATE_EVENTS: { es: 'Evento Corporativo', en: 'Corporate Event' },
  CORPORATE_PORTRAITS: { es: 'Retratos Corporativos', en: 'Corporate Portraits' },
  FOOD_AND_BEVERAGE: { es: 'Alimentos y Bebidas', en: 'Food and Beverage' },
  VIDEO_PRODUCTION: { es: 'Producción de Video', en: 'Video Production' },
  DRONE_AERIAL: { es: 'Fotografía con Drone', en: 'Drone Photography' },
  OTHER: { es: 'Servicio Fotográfico', en: 'Photography Service' },
}

function serviceLabel(type: string | null, isEs: boolean): string {
  if (!type) return isEs ? 'Servicio Fotográfico' : 'Photography Service'
  const entry = SERVICE_LABELS[type]
  if (!entry) return type.replace(/_/g, ' ')
  return isEs ? entry.es : entry.en
}

type Props = {
  params: { id: string }
  searchParams: { token?: string; paid?: string; cancelled?: string }
}

export default async function ProposalPage({ params, searchParams }: Props) {
  const { id } = params
  const rawToken = searchParams.token ?? ''

  // ─── Token validation ──────────────────────────────────────────────────────
  if (!rawToken || rawToken.length > 128 || !/^[0-9a-f]+$/i.test(rawToken)) {
    notFound()
  }

  const tokenHash = hashToken(rawToken)
  const supabase = createServiceClient()

  const { data: quote, error } = await supabase
    .from('quotes')
    .select(
      'id, locale, full_name, service_type, event_date, city, country, final_price_usd, admin_note_customer, status, proposal_expires_at'
    )
    .eq('id', id)
    .eq('proposal_token_hash', tokenHash)
    .single()

  if (error || !quote) {
    notFound()
  }

  const isEs = quote.locale === 'es'
  const isExpired =
    quote.proposal_expires_at && new Date(quote.proposal_expires_at) < new Date()
  const isAccepted = quote.status === 'ACCEPTED'
  const isCancelled = searchParams.cancelled === '1'
  const justPaid = searchParams.paid === '1'

  const breadcrumb = schemaGenerators.breadcrumb([
    { name: isEs ? 'Inicio' : 'Home', url: `${BASE_URL}/${isEs ? 'es' : 'en'}` },
    { name: isEs ? 'Mi presupuesto' : 'My proposal', url: `${BASE_URL}/proposal/${id}` },
  ])

  const expiryText = quote.proposal_expires_at
    ? new Date(quote.proposal_expires_at).toLocaleDateString(isEs ? 'es-DO' : 'en-US', {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
      })
    : null

  const price = quote.final_price_usd ? Number(quote.final_price_usd) : null
  const itbis = price ? Math.round(price * 0.18 * 100) / 100 : null
  const total = price && itbis ? Math.round((price + itbis) * 100) / 100 : null

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={generateJsonLd(breadcrumb)} />

      <div className="min-h-screen bg-slate-50 px-4 py-12 font-sans dark:bg-gray-950">
        <div className="mx-auto max-w-2xl">
          {/* Logo / brand */}
          <div className="mb-8 text-center">
            <Link href={`/${isEs ? 'es' : 'en'}`} className="text-xl font-bold text-slate-900 dark:text-white">
              📸 Babula Shots
            </Link>
            <p className="mt-1 text-sm text-slate-500 dark:text-gray-400">
              {isEs ? 'Fotógrafo Santo Domingo' : 'Photographer Santo Domingo'}
            </p>
          </div>

          {/* ── Accepted state ─────────────────────────────────────────────── */}
          {(isAccepted || justPaid) && (
            <div className="rounded-2xl border border-emerald-200 bg-white p-8 shadow-sm dark:border-emerald-400/20 dark:bg-gray-900">
              <div className="mb-4 text-4xl text-center">🎉</div>
              <h1 className="mb-2 text-center text-2xl font-bold text-slate-900 dark:text-white">
                {isEs ? '¡Reserva confirmada!' : 'Booking confirmed!'}
              </h1>
              <p className="text-center text-slate-600 dark:text-gray-300">
                {isEs
                  ? `Gracias, ${quote.full_name}. Tu pago fue procesado y la sesión está reservada. Te contactaremos pronto con los detalles finales.`
                  : `Thank you, ${quote.full_name}. Your payment was processed and the session is booked. We will reach out shortly with final details.`}
              </p>
              <div className="mt-6 flex justify-center gap-4">
                <Link
                  href={`/${isEs ? 'es' : 'en'}`}
                  className="rounded-full border border-slate-300 px-5 py-2 text-sm font-semibold text-slate-700 hover:border-slate-400 dark:border-white/20 dark:text-gray-200"
                >
                  {isEs ? 'Volver al inicio' : 'Back to home'}
                </Link>
                <a
                  href="https://wa.me/18097209547"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full bg-emerald-600 px-5 py-2 text-sm font-semibold text-white hover:bg-emerald-500"
                >
                  WhatsApp
                </a>
              </div>
            </div>
          )}

          {/* ── Expired state ──────────────────────────────────────────────── */}
          {!isAccepted && !justPaid && isExpired && (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 shadow-sm text-center dark:border-white/10 dark:bg-gray-900">
              <div className="mb-4 text-4xl">⏰</div>
              <h1 className="mb-2 text-2xl font-bold text-slate-900 dark:text-white">
                {isEs ? 'Este presupuesto expiró' : 'This proposal has expired'}
              </h1>
              <p className="text-slate-600 dark:text-gray-300">
                {isEs
                  ? 'El enlace no es válido: el presupuesto venció. Escríbenos para solicitar uno nuevo.'
                  : 'This link is no longer valid — the proposal expired. Reach out to request a fresh quote.'}
              </p>
              <a
                href="https://wa.me/18097209547"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-block rounded-full bg-sky-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-sky-500"
              >
                {isEs ? 'Contactar por WhatsApp' : 'Contact via WhatsApp'}
              </a>
            </div>
          )}

          {/* ── Active proposal ────────────────────────────────────────────── */}
          {!isAccepted && !justPaid && !isExpired && (
            <div className="rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-gray-900">
              {/* Header */}
              <div className="rounded-t-2xl bg-gradient-to-r from-sky-700 to-sky-500 px-8 py-8 text-white">
                <p className="text-xs font-semibold uppercase tracking-widest text-sky-100">
                  {isEs ? 'Presupuesto personalizado' : 'Personalized proposal'}
                </p>
                <h1 className="mt-2 text-3xl font-bold leading-tight">
                  {isEs ? `Hola, ${quote.full_name}` : `Hi, ${quote.full_name}`}
                </h1>
                <p className="mt-2 text-sky-100">
                  {isEs
                    ? 'Revisamos tu solicitud y preparamos esta propuesta exclusiva para ti.'
                    : 'We reviewed your request and prepared this exclusive proposal for you.'}
                </p>
              </div>

              <div className="p-8">
                {/* Cancelled banner */}
                {isCancelled && (
                  <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-400/20 dark:bg-amber-400/10 dark:text-amber-300">
                    {isEs
                      ? 'Pago cancelado. Tu propuesta sigue activa — puedes intentarlo de nuevo cuando quieras.'
                      : 'Payment cancelled. Your proposal is still active — you can try again whenever you are ready.'}
                  </div>
                )}

                {/* Service & event details */}
                <div className="mb-6 rounded-xl border border-slate-100 bg-slate-50 p-5 dark:border-white/10 dark:bg-white/5">
                  <h2 className="mb-3 text-xs font-bold uppercase tracking-wider text-slate-400">
                    {isEs ? 'Detalles del servicio' : 'Service details'}
                  </h2>
                  <dl className="grid grid-cols-2 gap-y-2 text-sm">
                    <dt className="text-slate-500 dark:text-gray-400">{isEs ? 'Servicio' : 'Service'}</dt>
                    <dd className="font-semibold text-slate-900 dark:text-white">
                      {serviceLabel(quote.service_type, isEs)}
                    </dd>
                    {quote.event_date && (
                      <>
                        <dt className="text-slate-500 dark:text-gray-400">{isEs ? 'Fecha' : 'Date'}</dt>
                        <dd className="font-semibold text-slate-900 dark:text-white">{quote.event_date}</dd>
                      </>
                    )}
                    {(quote.city || quote.country) && (
                      <>
                        <dt className="text-slate-500 dark:text-gray-400">{isEs ? 'Ubicación' : 'Location'}</dt>
                        <dd className="font-semibold text-slate-900 dark:text-white">
                          {[quote.city, quote.country].filter(Boolean).join(', ')}
                        </dd>
                      </>
                    )}
                  </dl>
                </div>

                {/* Admin note to client */}
                {quote.admin_note_customer && (
                  <div className="mb-6 rounded-xl border border-sky-100 bg-sky-50 p-5 dark:border-sky-400/20 dark:bg-sky-400/10">
                    <p className="mb-1 text-xs font-bold uppercase tracking-wider text-sky-500">
                      {isEs ? 'Nota del fotógrafo' : "Photographer's note"}
                    </p>
                    <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-800 dark:text-gray-200">
                      {quote.admin_note_customer}
                    </p>
                  </div>
                )}

                {/* Pricing */}
                {price !== null && (
                  <div className="mb-6 rounded-xl border border-slate-200 p-5 dark:border-white/10">
                    <h2 className="mb-4 text-xs font-bold uppercase tracking-wider text-slate-400">
                      {isEs ? 'Inversión total' : 'Total investment'}
                    </h2>
                    <div className="space-y-2 text-sm">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600 dark:text-gray-400">
                          {serviceLabel(quote.service_type, isEs)}
                        </span>
                        <span className="font-semibold text-slate-900 dark:text-white">
                          ${price.toLocaleString('en-US')} USD
                        </span>
                      </div>
                      {itbis !== null && (
                        <div className="flex items-center justify-between text-slate-500 dark:text-gray-400">
                          <span>ITBIS 18%</span>
                          <span>${itbis.toLocaleString('en-US')}</span>
                        </div>
                      )}
                      {total !== null && (
                        <>
                          <div className="border-t border-slate-200 pt-2 dark:border-white/10" />
                          <div className="flex items-center justify-between">
                            <span className="font-bold text-slate-900 dark:text-white">
                              {isEs ? 'Total' : 'Total'}
                            </span>
                            <span className="text-2xl font-extrabold text-sky-600 dark:text-sky-400">
                              ${total.toLocaleString('en-US')} USD
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                )}

                {/* Checkout CTA */}
                <div className="mb-4">
                  <ProposalCheckoutButton quoteId={id} token={rawToken} isEs={isEs} />
                </div>

                <p className="text-xs text-slate-400 dark:text-gray-500">
                  {isEs
                    ? `Pago seguro procesado por Stripe. ${expiryText ? `Esta propuesta vence el ${expiryText}.` : ''}`
                    : `Secure payment processed by Stripe. ${expiryText ? `This proposal expires on ${expiryText}.` : ''}`}
                </p>
              </div>
            </div>
          )}

          {/* Footer */}
          <p className="mt-8 text-center text-xs text-slate-400 dark:text-gray-500">
            Babula Shots · Santo Domingo, República Dominicana ·{' '}
            <a href="https://wa.me/18097209547" className="underline hover:text-sky-500">
              WhatsApp +1 (809) 720-9547
            </a>
          </p>
        </div>
      </div>
    </>
  )
}
