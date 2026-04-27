/**
 * Per-service-type question schema for the dynamic /get-quote wizard.
 *
 * Each service type carries its own list of questions — drone gets
 * geo-location + altitude restriction acknowledgement; real-estate gets
 * property-type + size + drone/twilight/matterport options; portraits
 * get studio-or-outdoor + mood + looks; weddings get city + hours +
 * venue type; etc.
 *
 * The wizard renders these questions as a new step between "Service
 * type" and "People count". Answers are serialized into the submission
 * `notes` field so no DB schema change is required.
 */

import type { QuoteServiceType } from './constants'

export type SelectOption = { value: string; labelEs: string; labelEn: string }

export type ServiceQuestion =
  | {
      type: 'select'
      key: string
      labelEs: string
      labelEn: string
      options: SelectOption[]
      required?: boolean
    }
  | {
      type: 'text'
      key: string
      labelEs: string
      labelEn: string
      placeholderEs?: string
      placeholderEn?: string
      required?: boolean
    }
  | {
      type: 'textarea'
      key: string
      labelEs: string
      labelEn: string
      placeholderEs?: string
      placeholderEn?: string
      rows?: number
      required?: boolean
    }
  | {
      type: 'yes_no'
      key: string
      labelEs: string
      labelEn: string
      required?: boolean
    }

const CITIES_DR: SelectOption[] = [
  { value: 'punta-cana', labelEs: 'Punta Cana', labelEn: 'Punta Cana' },
  { value: 'cap-cana', labelEs: 'Cap Cana', labelEn: 'Cap Cana' },
  { value: 'bavaro', labelEs: 'Bávaro', labelEn: 'Bávaro' },
  { value: 'santo-domingo', labelEs: 'Santo Domingo', labelEn: 'Santo Domingo' },
  { value: 'casa-de-campo', labelEs: 'Casa de Campo / La Romana', labelEn: 'Casa de Campo / La Romana' },
  { value: 'juan-dolio', labelEs: 'Juan Dolio', labelEn: 'Juan Dolio' },
  { value: 'boca-chica', labelEs: 'Boca Chica', labelEn: 'Boca Chica' },
  { value: 'puerto-plata', labelEs: 'Puerto Plata', labelEn: 'Puerto Plata' },
  { value: 'samana', labelEs: 'Samaná', labelEn: 'Samaná' },
  { value: 'other', labelEs: 'Otra (especificar abajo)', labelEn: 'Other (specify below)' },
]

export const SERVICE_QUESTIONS: Record<QuoteServiceType, ServiceQuestion[]> = {
  WEDDINGS: [
    {
      type: 'select', key: 'wedding_city', required: true,
      labelEs: '¿En qué ciudad será la boda?',
      labelEn: 'Which city is the wedding in?',
      options: CITIES_DR,
    },
    {
      type: 'select', key: 'wedding_venue', required: true,
      labelEs: 'Tipo de venue',
      labelEn: 'Venue type',
      options: [
        { value: 'resort_all_inclusive', labelEs: 'Resort all-inclusive (Hard Rock, Iberostar, Excellence, etc.)', labelEn: 'All-inclusive resort (Hard Rock, Iberostar, Excellence, etc.)' },
        { value: 'hotel_boutique', labelEs: 'Hotel boutique', labelEn: 'Boutique hotel' },
        { value: 'iglesia_catedral', labelEs: 'Iglesia o catedral', labelEn: 'Church or cathedral' },
        { value: 'playa_publica', labelEs: 'Playa pública', labelEn: 'Public beach' },
        { value: 'villa_privada', labelEs: 'Villa privada', labelEn: 'Private villa' },
        { value: 'casa_de_campo', labelEs: 'Casa de Campo / Altos de Chavón', labelEn: 'Casa de Campo / Altos de Chavón' },
        { value: 'cap_cana_resort', labelEs: 'Resort en Cap Cana (Sanctuary, Eden Roc, Secrets, Hyatt)', labelEn: 'Cap Cana resort (Sanctuary, Eden Roc, Secrets, Hyatt)' },
        { value: 'other', labelEs: 'Otro', labelEn: 'Other' },
      ],
    },
    {
      type: 'select', key: 'wedding_hours', required: true,
      labelEs: 'Horas de cobertura',
      labelEn: 'Hours of coverage',
      options: [
        { value: '4h', labelEs: '4 horas', labelEn: '4 hours' },
        { value: '6h', labelEs: '6 horas', labelEn: '6 hours' },
        { value: '8h', labelEs: '8 horas', labelEn: '8 hours' },
        { value: 'full_day', labelEs: 'Día completo (10+ horas)', labelEn: 'Full day (10+ hours)' },
        { value: 'unsure', labelEs: 'Aún no estoy seguro/a', labelEn: 'Not sure yet' },
      ],
    },
    { type: 'yes_no', key: 'wedding_engagement_session', labelEs: '¿Quieres incluir sesión de compromiso?', labelEn: 'Include engagement session?' },
    { type: 'yes_no', key: 'wedding_drone', labelEs: '¿Cobertura con drone?', labelEn: 'Drone coverage?' },
    {
      type: 'textarea', key: 'wedding_notes', rows: 3,
      labelEs: 'Cuéntanos más (cantidad de invitados, religioso/civil, idiomas, etc.)',
      labelEn: 'Tell us more (guest count, religious/civil, languages, etc.)',
      placeholderEs: 'Ejemplo: 80 invitados, ceremonia católica con misa, recepción al aire libre',
      placeholderEn: 'Example: 80 guests, Catholic Mass ceremony, outdoor reception',
    },
  ],

  ENGAGEMENT_SESSION: [
    {
      type: 'select', key: 'engagement_city', required: true,
      labelEs: '¿En qué ciudad?', labelEn: 'Which city?',
      options: CITIES_DR,
    },
    {
      type: 'select', key: 'engagement_location', required: true,
      labelEs: 'Locación preferida', labelEn: 'Preferred location',
      options: [
        { value: 'studio', labelEs: 'Estudio', labelEn: 'Studio' },
        { value: 'zona_colonial', labelEs: 'Zona Colonial', labelEn: 'Colonial Zone' },
        { value: 'beach', labelEs: 'Playa', labelEn: 'Beach' },
        { value: 'urban_park', labelEs: 'Parque urbano (Mirador Sur, etc.)', labelEn: 'Urban park (Mirador Sur, etc.)' },
        { value: 'altos_de_chavon', labelEs: 'Altos de Chavón', labelEn: 'Altos de Chavón' },
        { value: 'other', labelEs: 'Otra (escribir abajo)', labelEn: 'Other (write below)' },
      ],
    },
    {
      type: 'select', key: 'engagement_mood', required: false,
      labelEs: 'Estilo / mood', labelEn: 'Style / mood',
      options: [
        { value: 'romantic', labelEs: 'Romántico clásico', labelEn: 'Classic romantic' },
        { value: 'editorial', labelEs: 'Editorial / fashion', labelEn: 'Editorial / fashion' },
        { value: 'relaxed', labelEs: 'Relajado / candid', labelEn: 'Relaxed / candid' },
        { value: 'adventure', labelEs: 'Aventura / outdoor', labelEn: 'Adventure / outdoor' },
      ],
    },
    {
      type: 'textarea', key: 'engagement_notes', rows: 2,
      labelEs: 'Inspiración o referencias visuales', labelEn: 'Inspiration or visual references',
      placeholderEs: 'Pinterest, Instagram, fotógrafos que te gustan…',
      placeholderEn: 'Pinterest, Instagram, photographers you like…',
    },
  ],

  QUINCEANERAS: [
    {
      type: 'select', key: 'quince_city', required: true,
      labelEs: 'Ciudad', labelEn: 'City',
      options: CITIES_DR,
    },
    {
      type: 'select', key: 'quince_coverage', required: true,
      labelEs: 'Cobertura deseada', labelEn: 'Desired coverage',
      options: [
        { value: 'session_only', labelEs: 'Solo sesión de retratos', labelEn: 'Portrait session only' },
        { value: 'session_ceremony', labelEs: 'Sesión + ceremonia (iglesia)', labelEn: 'Session + church ceremony' },
        { value: 'ceremony_reception', labelEs: 'Ceremonia + vals + recepción', labelEn: 'Ceremony + waltz + reception' },
        { value: 'full_day', labelEs: 'Día completo (preparación + ceremonia + recepción)', labelEn: 'Full day (prep + ceremony + reception)' },
      ],
    },
    {
      type: 'select', key: 'quince_venue', required: false,
      labelEs: 'Tipo de venue de recepción', labelEn: 'Reception venue type',
      options: [
        { value: 'hotel_salon', labelEs: 'Salón de hotel', labelEn: 'Hotel ballroom' },
        { value: 'club', labelEs: 'Club privado', labelEn: 'Private club' },
        { value: 'casa_familiar', labelEs: 'Casa familiar', labelEn: 'Family home' },
        { value: 'restaurant', labelEs: 'Restaurante', labelEn: 'Restaurant' },
        { value: 'other', labelEs: 'Otro', labelEn: 'Other' },
      ],
    },
    { type: 'yes_no', key: 'quince_makeup', labelEs: '¿Maquillaje y peinado incluidos?', labelEn: 'Hair and makeup included?' },
    {
      type: 'textarea', key: 'quince_notes', rows: 2,
      labelEs: 'Color de vestido, tema, looks adicionales', labelEn: 'Dress color, theme, additional looks',
    },
  ],

  MATERNITY: [
    {
      type: 'select', key: 'maternity_location', required: true,
      labelEs: 'Locación', labelEn: 'Location',
      options: [
        { value: 'studio', labelEs: 'Estudio (luz controlada)', labelEn: 'Studio (controlled light)' },
        { value: 'beach', labelEs: 'Playa', labelEn: 'Beach' },
        { value: 'urban_outdoor', labelEs: 'Outdoor en ciudad', labelEn: 'Urban outdoor' },
        { value: 'home', labelEs: 'En casa (lifestyle)', labelEn: 'At home (lifestyle)' },
      ],
    },
    {
      type: 'select', key: 'maternity_stage', required: true,
      labelEs: 'Etapa del embarazo', labelEn: 'Pregnancy stage',
      options: [
        { value: '6_7m', labelEs: '6-7 meses (recomendado)', labelEn: '6-7 months (recommended)' },
        { value: '8m', labelEs: '8 meses', labelEn: '8 months' },
        { value: '9m', labelEs: '9 meses', labelEn: '9 months' },
        { value: 'postpartum', labelEs: 'Postpartum (recién nacido + mamá)', labelEn: 'Postpartum (newborn + mom)' },
      ],
    },
    { type: 'yes_no', key: 'maternity_partner', labelEs: '¿Incluye pareja en la sesión?', labelEn: 'Include partner in session?' },
    { type: 'yes_no', key: 'maternity_kids', labelEs: '¿Incluye otros hijos en la sesión?', labelEn: 'Include other kids in session?' },
    {
      type: 'textarea', key: 'maternity_notes', rows: 2,
      labelEs: 'Outfits o conceptos que tienes en mente', labelEn: 'Outfits or concepts you have in mind',
    },
  ],

  FAMILY: [
    {
      type: 'select', key: 'family_city', required: true,
      labelEs: 'Ciudad', labelEn: 'City',
      options: CITIES_DR,
    },
    {
      type: 'select', key: 'family_location', required: true,
      labelEs: 'Locación', labelEn: 'Location',
      options: [
        { value: 'beach', labelEs: 'Playa', labelEn: 'Beach' },
        { value: 'studio', labelEs: 'Estudio', labelEn: 'Studio' },
        { value: 'park', labelEs: 'Parque urbano', labelEn: 'Urban park' },
        { value: 'home', labelEs: 'En casa (lifestyle)', labelEn: 'At home (lifestyle)' },
        { value: 'resort', labelEs: 'Resort donde nos hospedamos', labelEn: 'Resort where we are staying' },
      ],
    },
    { type: 'yes_no', key: 'family_multigenerational', labelEs: '¿Sesión multigeneracional (3+ generaciones)?', labelEn: 'Multigenerational session (3+ generations)?' },
    {
      type: 'textarea', key: 'family_kids_ages', rows: 1,
      labelEs: 'Edades de los niños participantes', labelEn: 'Ages of participating children',
      placeholderEs: 'Ejemplo: 6 meses, 4 años, 9 años', placeholderEn: 'Example: 6 months, 4, 9',
    },
  ],

  BIRTHDAY_PARTY: [
    {
      type: 'select', key: 'birthday_city', required: true,
      labelEs: 'Ciudad', labelEn: 'City',
      options: CITIES_DR,
    },
    {
      type: 'text', key: 'birthday_age', required: true,
      labelEs: 'Edad del homenajeado', labelEn: 'Honoree age',
      placeholderEs: 'Ejemplo: 8 años', placeholderEn: 'Example: 8 years',
    },
    {
      type: 'select', key: 'birthday_venue', required: true,
      labelEs: 'Venue de la fiesta', labelEn: 'Party venue',
      options: [
        { value: 'home', labelEs: 'Casa', labelEn: 'Home' },
        { value: 'restaurant', labelEs: 'Restaurante', labelEn: 'Restaurant' },
        { value: 'park_play', labelEs: 'Parque o área de juegos', labelEn: 'Park or playground' },
        { value: 'hotel_resort', labelEs: 'Hotel o resort', labelEn: 'Hotel or resort' },
        { value: 'club', labelEs: 'Club privado', labelEn: 'Private club' },
        { value: 'other', labelEs: 'Otro', labelEn: 'Other' },
      ],
    },
    {
      type: 'select', key: 'birthday_hours', required: true,
      labelEs: 'Horas de cobertura', labelEn: 'Hours of coverage',
      options: [
        { value: '1h', labelEs: '1 hora (esencial)', labelEn: '1 hour (essential)' },
        { value: '2h', labelEs: '2 horas (recomendado)', labelEn: '2 hours (recommended)' },
        { value: '3h', labelEs: '3 horas', labelEn: '3 hours' },
        { value: '4h+', labelEs: '4+ horas', labelEn: '4+ hours' },
      ],
    },
    { type: 'yes_no', key: 'birthday_smash_cake', labelEs: '¿Smash cake o piñata?', labelEn: 'Smash cake or piñata?' },
  ],

  BAPTISMS: [
    {
      type: 'select', key: 'baptism_city', required: true,
      labelEs: 'Ciudad', labelEn: 'City',
      options: CITIES_DR,
    },
    {
      type: 'text', key: 'baptism_church', required: false,
      labelEs: 'Iglesia o capilla (nombre)', labelEn: 'Church or chapel (name)',
      placeholderEs: 'Ejemplo: Catedral Primada de América', placeholderEn: 'Example: Catedral Primada de América',
    },
    { type: 'yes_no', key: 'baptism_reception', labelEs: '¿Hay recepción posterior?', labelEn: 'Reception afterwards?' },
    {
      type: 'select', key: 'baptism_hours', required: true,
      labelEs: 'Horas de cobertura', labelEn: 'Hours of coverage',
      options: [
        { value: '1h', labelEs: '1 hora (solo ceremonia)', labelEn: '1 hour (ceremony only)' },
        { value: '2h', labelEs: '2 horas (ceremonia + recepción corta)', labelEn: '2 hours (ceremony + short reception)' },
        { value: '3h+', labelEs: '3+ horas', labelEn: '3+ hours' },
      ],
    },
  ],

  GRADUATION: [
    {
      type: 'select', key: 'graduation_city', required: true,
      labelEs: 'Ciudad', labelEn: 'City',
      options: CITIES_DR,
    },
    {
      type: 'select', key: 'graduation_type', required: true,
      labelEs: 'Tipo de graduación', labelEn: 'Graduation type',
      options: [
        { value: 'university', labelEs: 'Universitaria', labelEn: 'University' },
        { value: 'highschool', labelEs: 'Secundaria / colegio', labelEn: 'High school' },
        { value: 'masters_phd', labelEs: 'Posgrado / maestría / doctorado', labelEn: 'Master\'s / PhD' },
        { value: 'professional', labelEs: 'Curso profesional / técnico', labelEn: 'Professional / technical course' },
      ],
    },
    {
      type: 'select', key: 'graduation_format', required: true,
      labelEs: 'Formato de la sesión', labelEn: 'Session format',
      options: [
        { value: 'individual', labelEs: 'Individual con familia', labelEn: 'Individual with family' },
        { value: 'group', labelEs: 'Grupo / promoción', labelEn: 'Group / class' },
        { value: 'ceremony', labelEs: 'Cobertura de ceremonia', labelEn: 'Ceremony coverage' },
      ],
    },
    {
      type: 'text', key: 'graduation_university', required: false,
      labelEs: 'Nombre de la universidad / colegio', labelEn: 'University / school name',
    },
  ],

  CHILDRENS_SESSIONS: [
    {
      type: 'text', key: 'children_age', required: true,
      labelEs: 'Edad del niño/a', labelEn: 'Child age',
      placeholderEs: 'Ejemplo: 3 años', placeholderEn: 'Example: 3 years',
    },
    {
      type: 'select', key: 'children_location', required: true,
      labelEs: 'Locación', labelEn: 'Location',
      options: [
        { value: 'studio', labelEs: 'Estudio', labelEn: 'Studio' },
        { value: 'park', labelEs: 'Parque', labelEn: 'Park' },
        { value: 'home', labelEs: 'En casa', labelEn: 'At home' },
        { value: 'beach', labelEs: 'Playa', labelEn: 'Beach' },
        { value: 'school', labelEs: 'En la escuela', labelEn: 'At school' },
      ],
    },
    {
      type: 'textarea', key: 'children_theme', rows: 2,
      labelEs: 'Tema o concepto (opcional)', labelEn: 'Theme or concept (optional)',
      placeholderEs: 'Cumpleaños temático, props específicos, sesión natural…',
      placeholderEn: 'Themed birthday, specific props, natural session…',
    },
  ],

  ARCHITECTURE: [
    {
      type: 'select', key: 'realestate_property_type', required: true,
      labelEs: 'Tipo de propiedad', labelEn: 'Property type',
      options: [
        { value: 'house', labelEs: 'Casa unifamiliar', labelEn: 'Single-family house' },
        { value: 'villa', labelEs: 'Villa de lujo', labelEn: 'Luxury villa' },
        { value: 'apartment', labelEs: 'Apartamento / condo', labelEn: 'Apartment / condo' },
        { value: 'land_for_sale', labelEs: 'Terreno en venta', labelEn: 'Land for sale' },
        { value: 'commercial', labelEs: 'Propiedad comercial', labelEn: 'Commercial property' },
        { value: 'construction_in_progress', labelEs: 'Construcción en progreso', labelEn: 'Construction in progress' },
        { value: 'hotel_resort', labelEs: 'Hotel o resort', labelEn: 'Hotel or resort' },
      ],
    },
    {
      type: 'select', key: 'realestate_city', required: true,
      labelEs: '¿Dónde está la propiedad?', labelEn: 'Where is the property?',
      options: CITIES_DR,
    },
    {
      type: 'text', key: 'realestate_size', required: false,
      labelEs: 'Tamaño aproximado (m² o pies²)', labelEn: 'Approximate size (m² or ft²)',
      placeholderEs: 'Ejemplo: 250 m²', placeholderEn: 'Example: 2,700 ft²',
    },
    { type: 'yes_no', key: 'realestate_drone', labelEs: '¿Aéreas con drone?', labelEn: 'Drone aerials?' },
    { type: 'yes_no', key: 'realestate_twilight', labelEs: '¿Twilight (atardecer con luces encendidas)?', labelEn: 'Twilight (sunset with lights on)?' },
    { type: 'yes_no', key: 'realestate_matterport', labelEs: '¿Tour Matterport 3D?', labelEn: 'Matterport 3D tour?' },
    { type: 'yes_no', key: 'realestate_video', labelEs: '¿Video del recorrido?', labelEn: 'Walkthrough video?' },
  ],

  PORTRAITS: [
    {
      type: 'select', key: 'portrait_city', required: true,
      labelEs: 'Ciudad', labelEn: 'City',
      options: CITIES_DR,
    },
    {
      type: 'select', key: 'portrait_location', required: true,
      labelEs: 'Estudio o exterior?', labelEn: 'Studio or outdoor?',
      options: [
        { value: 'studio', labelEs: 'Estudio (luz controlada)', labelEn: 'Studio (controlled light)' },
        { value: 'outdoor_urban', labelEs: 'Exterior urbano', labelEn: 'Urban outdoor' },
        { value: 'outdoor_nature', labelEs: 'Exterior naturaleza', labelEn: 'Outdoor nature' },
        { value: 'home_office', labelEs: 'En tu casa u oficina', labelEn: 'At your home or office' },
        { value: 'mixed', labelEs: 'Mezcla (estudio + exterior)', labelEn: 'Mix (studio + outdoor)' },
      ],
    },
    {
      type: 'text', key: 'portrait_outdoor_where', required: false,
      labelEs: 'Si es exterior — ¿dónde específicamente?', labelEn: 'If outdoor — where specifically?',
      placeholderEs: 'Ejemplo: Zona Colonial, parque Mirador Sur, beach club…',
      placeholderEn: 'Example: Colonial Zone, Mirador Sur park, beach club…',
    },
    {
      type: 'select', key: 'portrait_looks', required: true,
      labelEs: 'Cantidad de looks (cambios de outfit)', labelEn: 'Number of looks (outfit changes)',
      options: [
        { value: '1', labelEs: '1 look', labelEn: '1 look' },
        { value: '2', labelEs: '2 looks', labelEn: '2 looks' },
        { value: '3', labelEs: '3 looks', labelEn: '3 looks' },
        { value: '4_plus', labelEs: '4+ looks', labelEn: '4+ looks' },
      ],
    },
    { type: 'yes_no', key: 'portrait_makeup', labelEs: '¿Maquillaje profesional incluido?', labelEn: 'Professional makeup included?' },
    {
      type: 'textarea', key: 'portrait_mood', rows: 3, required: true,
      labelEs: 'Mood / inspiración / referencias visuales', labelEn: 'Mood / inspiration / visual references',
      placeholderEs: 'Ejemplo: editorial moody, retratos para LinkedIn corporativos, personal branding fresco con luz natural, links a Instagram o Pinterest…',
      placeholderEn: 'Example: moody editorial, corporate LinkedIn headshots, fresh personal branding with natural light, links to Instagram or Pinterest…',
    },
  ],

  CORPORATE_EVENTS: [
    {
      type: 'select', key: 'corporate_city', required: true,
      labelEs: 'Ciudad', labelEn: 'City',
      options: CITIES_DR,
    },
    {
      type: 'select', key: 'corporate_event_type', required: true,
      labelEs: 'Tipo de evento', labelEn: 'Event type',
      options: [
        { value: 'conference', labelEs: 'Conferencia', labelEn: 'Conference' },
        { value: 'product_launch', labelEs: 'Lanzamiento de producto', labelEn: 'Product launch' },
        { value: 'awards', labelEs: 'Premiación', labelEn: 'Awards ceremony' },
        { value: 'gala_dinner', labelEs: 'Gala / cena formal', labelEn: 'Gala / formal dinner' },
        { value: 'incentive_trip', labelEs: 'Viaje de incentivo (resort)', labelEn: 'Incentive trip (resort)' },
        { value: 'training', labelEs: 'Capacitación / training', labelEn: 'Training' },
        { value: 'networking', labelEs: 'Networking / cocktail', labelEn: 'Networking / cocktail' },
      ],
    },
    {
      type: 'select', key: 'corporate_duration', required: true,
      labelEs: 'Duración', labelEn: 'Duration',
      options: [
        { value: '2h', labelEs: '2 horas', labelEn: '2 hours' },
        { value: '4h', labelEs: '4 horas (medio día)', labelEn: '4 hours (half day)' },
        { value: '8h', labelEs: '8 horas (día completo)', labelEn: '8 hours (full day)' },
        { value: 'multi_day_2', labelEs: '2 días', labelEn: '2 days' },
        { value: 'multi_day_3_plus', labelEs: '3+ días', labelEn: '3+ days' },
      ],
    },
    {
      type: 'text', key: 'corporate_attendees', required: false,
      labelEs: 'Cantidad aproximada de asistentes', labelEn: 'Approximate attendees',
      placeholderEs: 'Ejemplo: 150', placeholderEn: 'Example: 150',
    },
    {
      type: 'text', key: 'corporate_venue', required: false,
      labelEs: 'Venue (si ya está confirmado)', labelEn: 'Venue (if confirmed)',
      placeholderEs: 'Ejemplo: JW Marriott Santo Domingo, salón principal',
      placeholderEn: 'Example: JW Marriott Santo Domingo, main ballroom',
    },
    { type: 'yes_no', key: 'corporate_press_24h', labelEs: '¿Necesitas entrega express 24h para prensa?', labelEn: 'Need 24h express delivery for press?' },
  ],

  CORPORATE_PORTRAITS: [
    {
      type: 'text', key: 'corp_portrait_count', required: true,
      labelEs: 'Cantidad de personas a fotografiar', labelEn: 'Number of people to photograph',
      placeholderEs: 'Ejemplo: 8 ejecutivos', placeholderEn: 'Example: 8 executives',
    },
    {
      type: 'select', key: 'corp_portrait_location', required: true,
      labelEs: 'Locación', labelEn: 'Location',
      options: [
        { value: 'office', labelEs: 'En la oficina (llevamos kit de luz)', labelEn: 'At your office (we bring lighting kit)' },
        { value: 'studio', labelEs: 'En estudio', labelEn: 'At studio' },
        { value: 'hotel', labelEs: 'En hotel / sala de eventos', labelEn: 'At hotel / event room' },
      ],
    },
    {
      type: 'select', key: 'corp_portrait_style', required: true,
      labelEs: 'Estilo', labelEn: 'Style',
      options: [
        { value: 'formal', labelEs: 'Formal corporativo (LinkedIn / web)', labelEn: 'Formal corporate (LinkedIn / web)' },
        { value: 'casual', labelEs: 'Casual / personal branding', labelEn: 'Casual / personal branding' },
        { value: 'editorial', labelEs: 'Editorial', labelEn: 'Editorial' },
        { value: 'mixed', labelEs: 'Mezcla formal + casual', labelEn: 'Mix formal + casual' },
      ],
    },
    { type: 'yes_no', key: 'corp_portrait_express', labelEs: '¿Necesitas entrega same-day o 24h?', labelEn: 'Need same-day or 24h delivery?' },
  ],

  FOOD_AND_BEVERAGE: [
    {
      type: 'select', key: 'fnb_purpose', required: true,
      labelEs: '¿Para qué se usarán las fotos?', labelEn: 'What will the photos be used for?',
      options: [
        { value: 'menu', labelEs: 'Menú impreso', labelEn: 'Printed menu' },
        { value: 'social', labelEs: 'Redes sociales (Instagram, Facebook)', labelEn: 'Social media (Instagram, Facebook)' },
        { value: 'delivery_platforms', labelEs: 'Plataformas delivery (Uber Eats, PedidosYa)', labelEn: 'Delivery platforms (Uber Eats, PedidosYa)' },
        { value: 'web', labelEs: 'Web del restaurante / hotel', labelEn: 'Restaurant / hotel website' },
        { value: 'campaign', labelEs: 'Campaña de marca', labelEn: 'Brand campaign' },
      ],
    },
    {
      type: 'text', key: 'fnb_dish_count', required: true,
      labelEs: 'Cantidad de platos / bebidas a fotografiar', labelEn: 'Number of dishes / drinks to photograph',
      placeholderEs: 'Ejemplo: 25 platos', placeholderEn: 'Example: 25 dishes',
    },
    {
      type: 'select', key: 'fnb_location', required: true,
      labelEs: 'Locación', labelEn: 'Location',
      options: [
        { value: 'restaurant', labelEs: 'En el restaurante / hotel', labelEn: 'At restaurant / hotel' },
        { value: 'studio', labelEs: 'En estudio (montamos sets)', labelEn: 'At studio (we set up)' },
        { value: 'mixed', labelEs: 'Mezcla', labelEn: 'Mix' },
      ],
    },
    { type: 'yes_no', key: 'fnb_food_stylist', labelEs: '¿Necesitas food stylist?', labelEn: 'Need a food stylist?' },
  ],

  VIDEO_PRODUCTION: [
    {
      type: 'select', key: 'video_type', required: true,
      labelEs: 'Tipo de producción', labelEn: 'Production type',
      options: [
        { value: 'music_video', labelEs: 'Video musical', labelEn: 'Music video' },
        { value: 'corporate', labelEs: 'Corporativo / institucional', labelEn: 'Corporate / institutional' },
        { value: 'wedding', labelEs: 'Wedding film', labelEn: 'Wedding film' },
        { value: 'documentary', labelEs: 'Documental', labelEn: 'Documentary' },
        { value: 'brand_campaign', labelEs: 'Campaña de marca', labelEn: 'Brand campaign' },
        { value: 'event_recap', labelEs: 'Recap de evento', labelEn: 'Event recap' },
      ],
    },
    {
      type: 'select', key: 'video_duration', required: true,
      labelEs: 'Duración del entregable final', labelEn: 'Final deliverable duration',
      options: [
        { value: 'short_60s', labelEs: '60 segundos o menos (social)', labelEn: '60 seconds or less (social)' },
        { value: 'short_3min', labelEs: '2-3 minutos', labelEn: '2-3 minutes' },
        { value: 'medium_5_10min', labelEs: '5-10 minutos', labelEn: '5-10 minutes' },
        { value: 'long_15plus', labelEs: '15+ minutos', labelEn: '15+ minutes' },
      ],
    },
    {
      type: 'text', key: 'video_locations', required: false,
      labelEs: 'Cantidad de locaciones', labelEn: 'Number of locations',
      placeholderEs: 'Ejemplo: 3 locaciones en Santo Domingo + 1 en Punta Cana',
      placeholderEn: 'Example: 3 locations in Santo Domingo + 1 in Punta Cana',
    },
    {
      type: 'select', key: 'video_shoot_days', required: true,
      labelEs: 'Días de rodaje estimados', labelEn: 'Estimated shoot days',
      options: [
        { value: '1', labelEs: '1 día', labelEn: '1 day' },
        { value: '2', labelEs: '2 días', labelEn: '2 days' },
        { value: '3_plus', labelEs: '3+ días', labelEn: '3+ days' },
        { value: 'unsure', labelEs: 'No estoy seguro/a', labelEn: 'Not sure' },
      ],
    },
    { type: 'yes_no', key: 'video_drone', labelEs: '¿Tomas con drone?', labelEn: 'Drone shots?' },
    {
      type: 'textarea', key: 'video_notes', rows: 3,
      labelEs: 'Concepto, referencias, briefing inicial', labelEn: 'Concept, references, initial briefing',
    },
  ],

  DRONE_AERIAL: [
    {
      type: 'select', key: 'drone_purpose', required: true,
      labelEs: '¿Foto, video o ambos?', labelEn: 'Photo, video, or both?',
      options: [
        { value: 'photo', labelEs: 'Solo fotografía aérea', labelEn: 'Aerial photography only' },
        { value: 'video', labelEs: 'Solo video aéreo', labelEn: 'Aerial video only' },
        { value: 'both', labelEs: 'Ambos (foto + video)', labelEn: 'Both (photo + video)' },
      ],
    },
    {
      type: 'select', key: 'drone_use_case', required: true,
      labelEs: 'Uso del material', labelEn: 'Material use',
      options: [
        { value: 'real_estate', labelEs: 'Bienes raíces / listado de propiedad', labelEn: 'Real estate / property listing' },
        { value: 'wedding', labelEs: 'Boda', labelEn: 'Wedding' },
        { value: 'event', labelEs: 'Evento corporativo o privado', labelEn: 'Corporate or private event' },
        { value: 'hotel_marketing', labelEs: 'Marketing de hotel / resort', labelEn: 'Hotel / resort marketing' },
        { value: 'tourism_brand', labelEs: 'Marca turística', labelEn: 'Tourism brand' },
        { value: 'construction', labelEs: 'Construcción / inspección', labelEn: 'Construction / inspection' },
        { value: 'personal', labelEs: 'Uso personal', labelEn: 'Personal use' },
      ],
    },
    {
      type: 'text', key: 'drone_location_specific', required: true,
      labelEs: 'Ubicación específica del vuelo (importante para verificar restricciones)',
      labelEn: 'Specific flight location (important to verify restrictions)',
      placeholderEs: 'Ejemplo: Bávaro central, Hotel Catalonia; o Cap Cana, Juanillo Beach',
      placeholderEn: 'Example: Central Bávaro, Hotel Catalonia; or Cap Cana, Juanillo Beach',
    },
    {
      type: 'select', key: 'drone_airport_proximity', required: true,
      labelEs: '¿Cerca del aeropuerto de Punta Cana (PUJ) o Santo Domingo (SDQ)?',
      labelEn: 'Near Punta Cana (PUJ) or Santo Domingo (SDQ) airport?',
      options: [
        { value: 'no', labelEs: 'No, está lejos', labelEn: 'No, far from airports' },
        { value: 'maybe', labelEs: 'No estoy seguro/a', labelEn: 'Not sure' },
        { value: 'yes_puj', labelEs: 'Sí, cerca del PUJ (Bávaro / Punta Cana centro)', labelEn: 'Yes, near PUJ (Bávaro / central Punta Cana)' },
        { value: 'yes_sdq', labelEs: 'Sí, cerca del SDQ (Boca Chica / Las Américas)', labelEn: 'Yes, near SDQ (Boca Chica / Las Américas)' },
      ],
    },
    {
      type: 'select', key: 'drone_resolution', required: false,
      labelEs: 'Resolución del entregable', labelEn: 'Deliverable resolution',
      options: [
        { value: '5k', labelEs: '5K (máxima calidad)', labelEn: '5K (max quality)' },
        { value: '4k', labelEs: '4K UHD', labelEn: '4K UHD' },
        { value: 'fullhd', labelEs: 'Full HD (1080p)', labelEn: 'Full HD (1080p)' },
        { value: 'no_preference', labelEs: 'Sin preferencia', labelEn: 'No preference' },
      ],
    },
    {
      type: 'textarea', key: 'drone_notes', rows: 2,
      labelEs: 'Tomas específicas o concepto deseado', labelEn: 'Specific shots or desired concept',
      placeholderEs: 'Ejemplo: panorámica de la propiedad al atardecer + acercamiento al jardín',
      placeholderEn: 'Example: property panorama at sunset + approach shot to garden',
    },
  ],

  OTHER: [
    {
      type: 'text', key: 'other_city', required: false,
      labelEs: 'Ciudad', labelEn: 'City',
      placeholderEs: 'Ejemplo: Santo Domingo', placeholderEn: 'Example: Santo Domingo',
    },
    {
      type: 'textarea', key: 'other_brief', required: true, rows: 5,
      labelEs: 'Cuéntanos sobre tu proyecto', labelEn: 'Tell us about your project',
      placeholderEs: 'Tipo de proyecto, fechas estimadas, alcance, referencias visuales, equipo necesario, presupuesto orientativo…',
      placeholderEn: 'Project type, estimated dates, scope, visual references, equipment needed, ballpark budget…',
    },
  ],
}

/**
 * Format an answers object into a human-readable text block to be
 * appended to the submission notes.
 */
export function formatServiceAnswersForNotes(
  serviceType: QuoteServiceType,
  answers: Record<string, string>,
  locale: 'es' | 'en'
): string {
  const questions = SERVICE_QUESTIONS[serviceType] ?? []
  const lines: string[] = []
  for (const q of questions) {
    const v = answers[q.key]
    if (v == null || v === '') continue
    const label = locale === 'es' ? q.labelEs : q.labelEn
    let displayValue = v
    if (q.type === 'select') {
      const opt = q.options.find(o => o.value === v)
      if (opt) displayValue = locale === 'es' ? opt.labelEs : opt.labelEn
    } else if (q.type === 'yes_no') {
      displayValue = v === 'yes' ? (locale === 'es' ? 'Sí' : 'Yes') : (locale === 'es' ? 'No' : 'No')
    }
    lines.push(`${label}: ${displayValue}`)
  }
  return lines.join('\n')
}
