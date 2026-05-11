'use client'

import { useEffect, useRef, useState } from 'react'
import type { TermContent } from '@/lib/quotes/terms'

type LineItem = { description: string; amount_usd: number }

type Props = {
  slug: string
  quoteId: string
  clientName: string
  clientCompany: string | null
  serviceType: string | null
  description: string | null
  lineItems: LineItem[]
  totalUsd: number
  paymentMode: 'FULL' | 'DEPOSIT'
  depositUsd: number
  adminNote: string | null
  expiresAt: string | null
  status: string
  locale: 'es' | 'en'
  terms: TermContent[]
}

type Lang = 'es' | 'en'

const T = {
  es: {
    preparedFor: 'Preparada exclusivamente para',
    scope: 'ALCANCE DEL SERVICIO',
    investment: 'INVERSIÓN',
    total: 'TOTAL',
    expires: 'Esta oferta vence en',
    days: 'd', hrs: 'h', mins: 'm', secs: 's',
    expired: 'Esta propuesta ha expirado.',
    reserveTitle: 'Reserve su fecha ahora',
    depositCta: (amt: string) => `Reservar con el 50% — ${amt}`,
    depositNote: (bal: string) => `Saldo restante ${bal} — se liquida el día de la sesión`,
    fullCta: (amt: string) => `Pagar monto completo — ${amt}`,
    secure: 'Pago seguro con Stripe',
    terms: 'TÉRMINOS Y CONDICIONES',
    footer: 'Esta propuesta es privada y confidencial.',
    validUntil: 'Válida hasta',
    print: 'Guardar PDF',
    paid: '✓ Pago recibido — ¡su reserva está confirmada!',
    cancelled: 'Pago cancelado. Puede intentarlo de nuevo cuando desee.',
    depositPaid: '✓ Depósito recibido — su sesión está reservada.',
    depositPaidSub: (bal: string) => `Saldo restante ${bal} — se liquida el día de la sesión.`,
    payBalance: (amt: string) => `Pagar saldo completo — ${amt}`,
    accepted: '✓ Pago completo recibido — su reserva está confirmada.',
  },
  en: {
    preparedFor: 'Prepared exclusively for',
    scope: 'SCOPE OF SERVICE',
    investment: 'INVESTMENT',
    total: 'TOTAL',
    expires: 'This offer expires in',
    days: 'd', hrs: 'h', mins: 'm', secs: 's',
    expired: 'This proposal has expired.',
    reserveTitle: 'Reserve your date now',
    depositCta: (amt: string) => `Reserve with 50% deposit — ${amt}`,
    depositNote: (bal: string) => `Balance ${bal} — due on session day`,
    fullCta: (amt: string) => `Pay full amount — ${amt}`,
    secure: 'Secure payment via Stripe',
    terms: 'TERMS & CONDITIONS',
    footer: 'This proposal is private and confidential.',
    validUntil: 'Valid until',
    print: 'Save PDF',
    paid: '✓ Payment received — your booking is confirmed!',
    cancelled: 'Payment cancelled. You may try again when ready.',
    depositPaid: '✓ Deposit received — your session is booked.',
    depositPaidSub: (bal: string) => `Remaining balance ${bal} — due on session day.`,
    payBalance: (amt: string) => `Pay remaining balance — ${amt}`,
    accepted: '✓ Full payment received — your booking is confirmed.',
  },
}

function fmt(usd: number) {
  return '$' + usd.toLocaleString('en-US', { minimumFractionDigits: 2 })
}

function Countdown({ expiresAt, lang }: { expiresAt: string; lang: Lang }) {
  const t = T[lang]
  const [diff, setDiff] = useState<number | null>(null)

  useEffect(() => {
    const target = new Date(expiresAt).getTime()
    const tick = () => setDiff(Math.max(0, target - Date.now()))
    tick()
    const id = setInterval(tick, 1000)
    return () => clearInterval(id)
  }, [expiresAt])

  if (diff === null) return null
  if (diff === 0) return <p className="text-sm text-[#8a8680]">{t.expired}</p>

  const totalSecs = Math.floor(diff / 1000)
  const d = Math.floor(totalSecs / 86400)
  const h = Math.floor((totalSecs % 86400) / 3600)
  const m = Math.floor((totalSecs % 3600) / 60)
  const s = totalSecs % 60

  return (
    <p className="text-sm tracking-wide text-[#8a8680]">
      {t.expires}{' '}
      <span className="font-mono text-[#c8a96e]">
        {d}{t.days} {h}{t.hrs} {m}{t.mins} {String(s).padStart(2, '0')}{t.secs}
      </span>
    </p>
  )
}

function CheckoutButton({
  slug,
  quoteId,
  mode,
  label,
  primary,
}: {
  slug: string
  quoteId: string
  mode: 'deposit' | 'full'
  label: string
  primary: boolean
}) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function handleClick() {
    setError(null)
    setLoading(true)
    try {
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug, quoteId, paymentMode: mode }),
      })
      const json = await res.json()
      if (!res.ok || !json.url) {
        setError(json.error || 'Could not start checkout. Please try again.')
        return
      }
      window.location.href = json.url
    } catch {
      setError('Connection error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      {error && <p className="mb-2 text-xs text-red-400">{error}</p>}
      <button
        onClick={handleClick}
        disabled={loading}
        className={`w-full rounded-none py-4 text-sm font-semibold tracking-widest uppercase transition-opacity disabled:opacity-60 ${
          primary
            ? 'bg-[#c8a96e] text-[#0e0e0d] hover:opacity-90'
            : 'border border-[#2e2c29] text-[#8a8680] hover:border-[#c8a96e] hover:text-[#c8a96e]'
        }`}
      >
        {loading ? '…' : label}
      </button>
    </div>
  )
}

export default function ProposalView({
  slug, quoteId, clientName, clientCompany, serviceType,
  description, lineItems, totalUsd, paymentMode, depositUsd,
  adminNote, expiresAt, status, locale, terms,
}: Props) {
  const [lang, setLang] = useState<Lang>(locale)
  const t = T[lang]
  const pingFired = useRef(false)

  // Fire tracking pixel once on mount
  useEffect(() => {
    if (pingFired.current) return
    pingFired.current = true
    const img = new Image()
    img.src = `/api/quotations/${slug}/ping`
  }, [slug])

  const isExpired = expiresAt ? new Date(expiresAt) < new Date() : false
  const balanceUsd = Math.round((totalUsd - depositUsd) * 100) / 100
  const isDepositPaid = status === 'DEPOSIT_PAID'
  const isAccepted = status === 'ACCEPTED'

  // Read URL params for Stripe redirect messages
  const [urlMsg, setUrlMsg] = useState<{ type: 'paid' | 'cancelled'; text: string } | null>(null)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('paid') === '1') setUrlMsg({ type: 'paid', text: t.paid })
    else if (params.get('cancelled') === '1') setUrlMsg({ type: 'cancelled', text: t.cancelled })
  }, [t.paid, t.cancelled])

  const displayService = serviceType
    ? serviceType.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())
    : null

  return (
    <div className="min-h-screen bg-[#0e0e0d] text-[#f0ede6]">
      {/* Sticky top bar */}
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#1e1c1a] bg-[#0e0e0d]/95 px-6 py-3 backdrop-blur-sm print:hidden">
        <span className="text-xs tracking-[0.3em] text-[#8a8680]">BABULA SHOTS</span>
        <div className="flex items-center gap-4">
          <button
            onClick={() => setLang(l => l === 'es' ? 'en' : 'es')}
            className="text-xs tracking-widest text-[#8a8680] transition hover:text-[#c8a96e]"
          >
            {lang === 'es' ? 'EN' : 'ES'}
          </button>
          <button
            onClick={() => window.print()}
            className="text-xs tracking-widest text-[#8a8680] transition hover:text-[#c8a96e]"
          >
            {t.print}
          </button>
        </div>
      </div>

      {/* Main content */}
      <main className="mx-auto max-w-2xl px-6 py-20 print:py-8">

        {/* Paid/cancelled banner */}
        {urlMsg && (
          <div className={`mb-10 rounded-none border px-6 py-4 text-sm ${
            urlMsg.type === 'paid'
              ? 'border-emerald-800 bg-emerald-950/40 text-emerald-400'
              : 'border-[#2e2c29] bg-[#1a1917] text-[#8a8680]'
          }`}>
            {urlMsg.text}
          </div>
        )}

        {/* Brand + title */}
        <div className="mb-16 print:mb-8">
          <p className="mb-8 font-[family-name:var(--font-bugatti-display)] text-xs tracking-[0.4em] text-[#c8a96e] print:mb-4">
            BABULA SHOTS
          </p>
          <div className="mb-8 h-px bg-[#1e1c1a] print:mb-4" />
          <p className="mb-2 text-xs tracking-[0.25em] text-[#8a8680] uppercase">
            {lang === 'es' ? 'COTIZACIÓN PROFESIONAL' : 'PROFESSIONAL QUOTATION'}
          </p>
          <p className="text-xs tracking-[0.15em] text-[#8a8680]">{t.preparedFor}:</p>
          <h1 className="mt-2 font-[family-name:var(--font-bugatti-display)] text-2xl tracking-widest text-[#f0ede6]">
            {clientName.toUpperCase()}
            {clientCompany && (
              <span className="block text-base text-[#c8a96e]">{clientCompany}</span>
            )}
          </h1>
        </div>

        {/* Service scope */}
        {(displayService || description) && (
          <section className="mb-16 print:mb-8">
            <p className="mb-6 text-xs tracking-[0.3em] text-[#8a8680]">{t.scope}</p>
            <div className="h-px bg-[#1e1c1a] mb-6" />
            {displayService && (
              <h2 className="mb-4 text-lg tracking-widest font-[family-name:var(--font-bugatti-display)] text-[#f0ede6]">
                {displayService}
              </h2>
            )}
            {description && (
              <p className="text-sm leading-relaxed text-[#8a8680]">{description}</p>
            )}
            {adminNote && (
              <p className="mt-4 text-sm italic leading-relaxed text-[#8a8680]">{adminNote}</p>
            )}
          </section>
        )}

        {/* Investment / line items */}
        <section className="mb-16 print:mb-8">
          <p className="mb-6 text-xs tracking-[0.3em] text-[#8a8680]">{t.investment}</p>
          <div className="h-px bg-[#1e1c1a] mb-6" />
          <div className="space-y-4">
            {lineItems.map((item, idx) => (
              <div key={idx} className="flex items-baseline justify-between gap-4">
                <span className="text-sm text-[#8a8680]">{item.description}</span>
                <span className="shrink-0 font-[family-name:var(--font-bugatti-mono)] text-sm text-[#f0ede6]">
                  {fmt(item.amount_usd)}
                </span>
              </div>
            ))}
          </div>
          <div className="mt-8 h-px bg-[#1e1c1a]" />
          <div className="mt-4 flex items-baseline justify-between">
            <span className="text-xs tracking-[0.2em] text-[#8a8680]">{t.total}</span>
            <span className="font-[family-name:var(--font-bugatti-mono)] text-xl text-[#f0ede6]">
              {fmt(totalUsd)}
            </span>
          </div>
        </section>

        {/* CTA block — status-aware */}
        <section className="mb-16 print:hidden">
          {/* Fully paid */}
          {(isAccepted || urlMsg?.type === 'paid') && (
            <div className="border border-emerald-900 bg-emerald-950/30 p-8 text-center">
              <p className="text-sm text-emerald-400">{t.accepted}</p>
            </div>
          )}

          {/* Deposit paid — show balance option */}
          {isDepositPaid && urlMsg?.type !== 'paid' && (
            <div className="border border-[#1e1c1a] p-8 space-y-4">
              <div className="text-center">
                <p className="text-sm text-emerald-400">{t.depositPaid}</p>
                <p className="mt-1 text-xs text-[#8a8680]">{t.depositPaidSub(fmt(balanceUsd))}</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-[#1e1c1a]" />
                <span className="text-xs text-[#2e2c29]">or</span>
                <div className="flex-1 h-px bg-[#1e1c1a]" />
              </div>
              <CheckoutButton
                slug={slug} quoteId={quoteId} mode="full" primary={false}
                label={t.payBalance(fmt(balanceUsd))}
              />
              <p className="text-center text-xs text-[#4a4845]">
                🔒 {t.secure} · Visa · Mastercard · Amex · Apple Pay
              </p>
            </div>
          )}

          {/* Not yet paid — normal flow */}
          {!isAccepted && !isDepositPaid && !isExpired && urlMsg?.type !== 'paid' && (
            <div className="border border-[#1e1c1a] p-8">
              <p className="mb-1 text-xs tracking-[0.25em] text-[#8a8680]">{t.reserveTitle}</p>
              {expiresAt && (
                <div className="mb-6">
                  <Countdown expiresAt={expiresAt} lang={lang} />
                </div>
              )}
              <div className="space-y-3">
                {paymentMode === 'DEPOSIT' ? (
                  <>
                    <CheckoutButton
                      slug={slug} quoteId={quoteId} mode="deposit" primary={true}
                      label={t.depositCta(fmt(depositUsd))}
                    />
                    <p className="text-center text-xs text-[#8a8680]">{t.depositNote(fmt(balanceUsd))}</p>
                    <div className="flex items-center gap-3">
                      <div className="flex-1 h-px bg-[#1e1c1a]" />
                      <span className="text-xs text-[#2e2c29]">or</span>
                      <div className="flex-1 h-px bg-[#1e1c1a]" />
                    </div>
                    <CheckoutButton
                      slug={slug} quoteId={quoteId} mode="full" primary={false}
                      label={t.fullCta(fmt(totalUsd))}
                    />
                  </>
                ) : (
                  <CheckoutButton
                    slug={slug} quoteId={quoteId} mode="full" primary={true}
                    label={t.fullCta(fmt(totalUsd))}
                  />
                )}
              </div>
              <p className="mt-6 text-center text-xs text-[#4a4845]">
                🔒 {t.secure} · Visa · Mastercard · Amex · Apple Pay
              </p>
            </div>
          )}

          {/* Expired */}
          {!isAccepted && !isDepositPaid && isExpired && (
            <div className="border border-[#1e1c1a] p-8 text-center">
              <p className="text-sm text-[#8a8680]">{t.expired}</p>
            </div>
          )}
        </section>

        {/* Terms */}
        {terms.length > 0 && (
          <section className="mb-16 print:mb-8">
            <p className="mb-6 text-xs tracking-[0.3em] text-[#8a8680]">{t.terms}</p>
            <div className="h-px bg-[#1e1c1a] mb-8" />
            <div className="space-y-8">
              {terms.map((term, idx) => (
                <div key={idx}>
                  <p className="mb-2 text-xs font-semibold tracking-[0.2em] text-[#c8a96e] uppercase">
                    {lang === 'es' ? term.titleEs : term.titleEn}
                  </p>
                  <p className="text-sm leading-relaxed text-[#8a8680]">
                    {lang === 'es' ? term.bodyEs : term.bodyEn}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Footer */}
        <footer className="border-t border-[#1e1c1a] pt-8">
          <p className="text-xs text-[#4a4845]">
            Babula Shots · Santo Domingo, República Dominicana
          </p>
          <p className="mt-1 text-xs text-[#4a4845]">{t.footer}</p>
          {expiresAt && (
            <p className="mt-1 text-xs text-[#4a4845]">
              {t.validUntil}: {new Date(expiresAt).toLocaleDateString(lang === 'es' ? 'es-DO' : 'en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
            </p>
          )}
        </footer>
      </main>

      {/* Print styles */}
      <style>{`
        @media print {
          body { background: #fff !important; color: #111 !important; }
          .print\\:hidden { display: none !important; }
        }
      `}</style>
    </div>
  )
}
