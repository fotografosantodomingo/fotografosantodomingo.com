// Heuristic intent + risk classification — no second LLM call.
// Runs after the draft is generated to decide approval_status and
// surface any risk flags for the operator inbox.

export type Intent =
  | 'pricing_inquiry'
  | 'availability_inquiry'
  | 'booking_request'
  | 'portfolio_request'
  | 'service_info'
  | 'general_info'
  | 'complaint'
  | 'other'

export interface Classification {
  intent: Intent
  confidence: number
  riskFlags: string[]
}

const INTENT_PATTERNS: Array<{ intent: Intent; patterns: RegExp[] }> = [
  {
    intent: 'pricing_inquiry',
    patterns: [
      /\b(precio|cost[oe]?|cuanto|how much|rate|tarifa|cobr|pric)\b/i,
      /\$\d/,
    ],
  },
  {
    intent: 'availability_inquiry',
    patterns: [
      /\b(disponib|available|disponible|fecha|date|when|cuando|agenda|slot)\b/i,
    ],
  },
  {
    intent: 'booking_request',
    patterns: [
      /\b(reserv|book|contrat|agendar|apart|schedule|confirm)\b/i,
    ],
  },
  {
    intent: 'portfolio_request',
    patterns: [
      /\b(portafolio|portfolio|ejemplo|example|sample|galeria|gallery|foto|photo|work|trabajo)\b/i,
    ],
  },
  {
    intent: 'service_info',
    patterns: [
      /\b(servicio|service|paquete|package|incluye|include|drone|boda|wedding|retrato|portrait|event|familia|family)\b/i,
    ],
  },
  {
    intent: 'complaint',
    patterns: [
      /\b(queja|complaint|mal|terrible|horrible|refund|devolver|cancelar|cancel|fraude|fraud)\b/i,
    ],
  },
]

// Risk patterns that should be flagged for operator review
const RISK_PATTERNS: Array<{ flag: string; pattern: RegExp }> = [
  {
    flag: 'price_commitment',
    pattern: /\b(garantiz|prometo|te aseguro|guaranteed|I promise|definitivamente|definitely cost)\b/i,
  },
  {
    flag: 'date_commitment',
    pattern: /\b(seguro (que )?(puedo|podemos)|definitely available|confirmed (for|on))\b/i,
  },
  {
    flag: 'legal_or_financial',
    pattern: /\b(contrato|contract|legal|sue|demandar|rembolso|refund|deduct|tax|impuesto)\b/i,
  },
  {
    flag: 'competitor_mention',
    pattern: /\b(better than|mejor que|cheaper than|más barato que|competitor|competencia)\b/i,
  },
  {
    flag: 'personal_contact_sharing',
    pattern: /\b(mi (celular|teléfono|número|email)|my (cell|phone|number|personal email))\b/i,
  },
]

export function classifyAssistantTurn(args: {
  userText: string
  assistantDraft: string
  locale: string
}): Classification {
  const { userText, assistantDraft } = args
  const combined = `${userText} ${assistantDraft}`

  // Intent — first match wins
  let matched: Intent = 'other'
  let confidence = 0.6
  for (const { intent, patterns } of INTENT_PATTERNS) {
    if (patterns.some((p) => p.test(combined))) {
      matched = intent
      confidence = 0.8
      break
    }
  }

  // Risk flags — scan the DRAFT only (user text doesn't create risk)
  const riskFlags = RISK_PATTERNS
    .filter(({ pattern }) => pattern.test(assistantDraft))
    .map(({ flag }) => flag)

  if (riskFlags.length > 0) confidence = Math.max(0.4, confidence - 0.2 * riskFlags.length)

  return { intent: matched, confidence: Math.min(1, confidence), riskFlags }
}
