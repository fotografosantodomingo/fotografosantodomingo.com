export type ChecklistItem = { id: string; label: string; checked: boolean }

type ServiceChecklist = { id: string; label: string }[]

const CHECKLISTS: Record<string, ServiceChecklist> = {
  WEDDINGS: [
    { id: 'date', label: 'Date & time confirmed' },
    { id: 'ceremony_location', label: 'Ceremony location' },
    { id: 'reception_location', label: 'Reception location' },
    { id: 'hours', label: 'Coverage hours agreed' },
    { id: 'guests', label: 'Guest count (approx.)' },
    { id: 'delivery', label: 'Delivery format (digital / album)' },
  ],
  ENGAGEMENT_SESSION: [
    { id: 'date', label: 'Date & time confirmed' },
    { id: 'location', label: 'Location (outdoor / studio)' },
    { id: 'persons', label: 'Number of people' },
    { id: 'delivery', label: 'Delivery format' },
  ],
  QUINCEANERAS: [
    { id: 'date', label: 'Date & time confirmed' },
    { id: 'venue', label: 'Venue / location' },
    { id: 'guests', label: 'Guest count (approx.)' },
    { id: 'delivery', label: 'Delivery format' },
  ],
  MATERNITY: [
    { id: 'date', label: 'Date & time confirmed' },
    { id: 'location', label: 'Location (outdoor / studio)' },
    { id: 'persons', label: 'Number of people' },
    { id: 'delivery', label: 'Delivery format' },
  ],
  FAMILY: [
    { id: 'date', label: 'Date & time confirmed' },
    { id: 'location', label: 'Location (beach / park / studio)' },
    { id: 'persons', label: 'Number of people' },
    { id: 'golden_hour', label: 'Golden hour preference confirmed' },
    { id: 'delivery', label: 'Delivery format' },
  ],
  BIRTHDAY_PARTY: [
    { id: 'date', label: 'Date & time confirmed' },
    { id: 'venue', label: 'Venue / location' },
    { id: 'guests', label: 'Guest count (approx.)' },
    { id: 'delivery', label: 'Delivery format' },
  ],
  BAPTISMS: [
    { id: 'date', label: 'Date & time confirmed' },
    { id: 'venue', label: 'Church / venue' },
    { id: 'guests', label: 'Guest count (approx.)' },
    { id: 'delivery', label: 'Delivery format' },
  ],
  GRADUATION: [
    { id: 'date', label: 'Date & time confirmed' },
    { id: 'location', label: 'Location' },
    { id: 'persons', label: 'Number of people' },
    { id: 'delivery', label: 'Delivery format' },
  ],
  CHILDRENS_SESSIONS: [
    { id: 'date', label: 'Date & time confirmed' },
    { id: 'location', label: 'Location (outdoor / studio)' },
    { id: 'children_count', label: 'Number of children' },
    { id: 'delivery', label: 'Delivery format' },
  ],
  PORTRAITS: [
    { id: 'date', label: 'Date & time confirmed' },
    { id: 'location', label: 'Location (outdoor / studio)' },
    { id: 'persons', label: 'Number of subjects' },
    { id: 'purpose', label: 'Purpose (LinkedIn / personal / commercial)' },
    { id: 'delivery', label: 'Delivery format' },
  ],
  CORPORATE_PORTRAITS: [
    { id: 'date', label: 'Date & time confirmed' },
    { id: 'location', label: 'Location (office / studio / outdoor)' },
    { id: 'persons', label: 'Number of subjects' },
    { id: 'usage', label: 'Usage rights confirmed (web / print / ads)' },
    { id: 'delivery', label: 'Delivery format & turnaround' },
  ],
  ARCHITECTURE: [
    { id: 'date', label: 'Date & time confirmed' },
    { id: 'address', label: 'Property address' },
    { id: 'areas', label: 'Number of rooms / areas to shoot' },
    { id: 'drone', label: 'Drone needed? (zone check required)' },
    { id: 'delivery', label: 'Delivery format' },
  ],
  CORPORATE_EVENTS: [
    { id: 'date', label: 'Date & time confirmed' },
    { id: 'venue', label: 'Venue / location' },
    { id: 'guests', label: 'Expected attendees' },
    { id: 'key_moments', label: 'Key moments to capture noted' },
    { id: 'delivery', label: 'Delivery format & turnaround' },
  ],
  FOOD_AND_BEVERAGE: [
    { id: 'date', label: 'Date & time confirmed' },
    { id: 'location', label: 'Studio / restaurant / location' },
    { id: 'dishes_count', label: 'Number of dishes / SKUs' },
    { id: 'usage', label: 'Usage rights (menu / social / ads)' },
    { id: 'delivery', label: 'Delivery format' },
  ],
  PRODUCT_PHOTOGRAPHY: [
    { id: 'date', label: 'Date & time confirmed' },
    { id: 'location', label: 'Studio / client location' },
    { id: 'product_count', label: 'Number of products / SKUs' },
    { id: 'style', label: 'Style (clean/white vs. lifestyle)' },
    { id: 'usage', label: 'Usage rights (e-commerce / social / print)' },
    { id: 'delivery', label: 'Delivery format' },
  ],
  VIDEO_PRODUCTION: [
    { id: 'date', label: 'Date & time confirmed' },
    { id: 'location', label: 'Location' },
    { id: 'duration', label: 'Final video duration & format' },
    { id: 'key_shots', label: 'Key shots / shot list' },
    { id: 'delivery', label: 'Delivery format & turnaround' },
  ],
  DRONE_AERIAL: [
    { id: 'date', label: 'Date & time confirmed' },
    { id: 'location', label: 'Location / coordinates' },
    { id: 'zone_check', label: 'Flight zone verified (IDAC)' },
    { id: 'purpose', label: 'Purpose (real estate / construction / event)' },
    { id: 'delivery', label: 'Delivery format (4K raw / edited reel)' },
  ],
  OTHER: [
    { id: 'date', label: 'Date & time confirmed' },
    { id: 'location', label: 'Location' },
    { id: 'delivery', label: 'Delivery format' },
  ],
}

const DEFAULT_CHECKLIST: ServiceChecklist = [
  { id: 'date', label: 'Date & time confirmed' },
  { id: 'location', label: 'Location' },
  { id: 'delivery', label: 'Delivery format' },
]

export function getChecklistTemplate(serviceType: string | null): ChecklistItem[] {
  const template = (serviceType && CHECKLISTS[serviceType]) || DEFAULT_CHECKLIST
  return template.map(item => ({ ...item, checked: false }))
}

export function allChecked(items: ChecklistItem[]): boolean {
  return items.length > 0 && items.every(i => i.checked)
}
