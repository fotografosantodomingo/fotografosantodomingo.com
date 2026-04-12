export type QuoteServiceType =
  | 'WEDDINGS'
  | 'ENGAGEMENT_SESSION'
  | 'QUINCEANERAS'
  | 'MATERNITY'
  | 'FAMILY'
  | 'BIRTHDAY_PARTY'
  | 'BAPTISMS'
  | 'GRADUATION'
  | 'CHILDRENS_SESSIONS'
  | 'ARCHITECTURE'
  | 'PORTRAITS'
  | 'CORPORATE_EVENTS'
  | 'CORPORATE_PORTRAITS'
  | 'FOOD_AND_BEVERAGE'
  | 'VIDEO_PRODUCTION'
  | 'DRONE_AERIAL'
  | 'OTHER'

export type QuoteContactMethod = 'EMAIL' | 'WHATSAPP' | 'PHONE_CALL'

export const QUOTE_SERVICE_TYPES: Array<{
  value: QuoteServiceType
  icon: string
  labelEs: string
  labelEn: string
}> = [
  { value: 'WEDDINGS', icon: '💍', labelEs: 'Bodas', labelEn: 'Weddings' },
  { value: 'ENGAGEMENT_SESSION', icon: '💑', labelEs: 'Sesion de compromiso', labelEn: 'Engagement Session' },
  { value: 'QUINCEANERAS', icon: '👑', labelEs: 'Quinceaneras', labelEn: 'Quinceaneras' },
  { value: 'MATERNITY', icon: '🤰', labelEs: 'Maternidad', labelEn: 'Maternity' },
  { value: 'FAMILY', icon: '👨‍👩‍👧‍👦', labelEs: 'Familiar', labelEn: 'Family' },
  { value: 'BIRTHDAY_PARTY', icon: '🎂', labelEs: 'Fiesta de cumpleanos', labelEn: 'Birthday Party' },
  { value: 'BAPTISMS', icon: '⛪', labelEs: 'Bautizos', labelEn: 'Baptisms' },
  { value: 'GRADUATION', icon: '🎓', labelEs: 'Graduacion', labelEn: 'Graduation' },
  { value: 'CHILDRENS_SESSIONS', icon: '🧸', labelEs: 'Sesiones infantiles', labelEn: "Children's Sessions" },
  { value: 'ARCHITECTURE', icon: '🏛️', labelEs: 'Arquitectura', labelEn: 'Architecture' },
  { value: 'PORTRAITS', icon: '🧑‍💼', labelEs: 'Retratos', labelEn: 'Portraits' },
  { value: 'CORPORATE_EVENTS', icon: '🏢', labelEs: 'Eventos corporativos', labelEn: 'Corporate Events' },
  { value: 'CORPORATE_PORTRAITS', icon: '📷', labelEs: 'Retratos corporativos', labelEn: 'Corporate Portraits' },
  { value: 'FOOD_AND_BEVERAGE', icon: '🍽️', labelEs: 'Alimentos y bebidas', labelEn: 'Food and Beverage' },
  { value: 'VIDEO_PRODUCTION', icon: '🎬', labelEs: 'Produccion de video', labelEn: 'Video Production' },
  { value: 'DRONE_AERIAL', icon: '🚁', labelEs: 'Drone aereo', labelEn: 'Drone Aerial' },
  { value: 'OTHER', icon: '✨', labelEs: 'Otro', labelEn: 'Other' },
]

export const DRONE_ADDON_ELIGIBLE_SERVICES: QuoteServiceType[] = [
  'WEDDINGS',
  'ENGAGEMENT_SESSION',
  'QUINCEANERAS',
  'BIRTHDAY_PARTY',
  'BAPTISMS',
  'GRADUATION',
  'ARCHITECTURE',
  'CORPORATE_EVENTS',
  'VIDEO_PRODUCTION',
  'OTHER',
]

export const QUOTE_CONTACT_METHODS: Array<{
  value: QuoteContactMethod
  labelEs: string
  labelEn: string
}> = [
  { value: 'EMAIL', labelEs: 'Email', labelEn: 'Email' },
  { value: 'WHATSAPP', labelEs: 'WhatsApp', labelEn: 'WhatsApp' },
  { value: 'PHONE_CALL', labelEs: 'Llamada telefonica', labelEn: 'Phone Call' },
]

export const QUOTE_CALLBACK_WINDOWS = [
  { value: 'MORNING_9_12', labelEs: 'Manana (9am - 12pm)', labelEn: 'Morning (9am - 12pm)' },
  { value: 'AFTERNOON_12_5', labelEs: 'Tarde (12pm - 5pm)', labelEn: 'Afternoon (12pm - 5pm)' },
  { value: 'EVENING_5_8', labelEs: 'Noche (5pm - 8pm)', labelEn: 'Evening (5pm - 8pm)' },
]
