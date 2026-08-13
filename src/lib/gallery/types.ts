export type GalleryStatus = 'draft' | 'uploading' | 'selecting' | 'selected' | 'ready' | 'expired' | 'deleted'
export type GalleryDeleteReason = 'expiration' | 'manual' | 'client_request'
export type GalleryDownloadType = 'single' | 'zip' | 'batch'
export type SelectionPaymentStatus = 'not_required' | 'pending' | 'paid'

export type Gallery = {
  id: string
  slug: string
  booking_id: string | null
  client_name: string
  client_email: string
  client_email_2: string | null
  topic: string | null
  included_photo_count: number | null
  session_price_usd: number | null
  password_hash: string | null
  status: GalleryStatus
  cover_photo_id: string | null
  photo_count: number
  total_bytes: number
  internal_notes: string | null
  selection_ready_at: string | null
  selection_submitted_at: string | null
  selection_overage_tier: number
  selection_overage_amount_usd: number | null
  selection_payment_status: SelectionPaymentStatus
  stripe_overage_session_id: string | null
  ready_at: string | null
  expires_at: string | null
  reminder_sent: boolean
  deleted_at: string | null
  deleted_reason: GalleryDeleteReason | null
  created_at: string
  updated_at: string
}

export type GalleryPhoto = {
  id: string
  gallery_id: string
  filename: string
  original_key: string
  preview_key: string
  media_type: string
  width: number | null
  height: number | null
  file_size: number
  sort_order: number
  selected: boolean
  created_at: string
}

// Shape returned to the client gallery page — never leaks R2 keys or password_hash.
export type PublicGallery = {
  slug: string
  client_name: string
  topic: string | null
  status: GalleryStatus
  photo_count: number
  total_bytes: number
  expires_at: string | null
  included_photo_count: number | null
  photos: {
    id: string
    filename: string
    width: number | null
    height: number | null
    file_size: number
    selected: boolean
  }[]
}

// Tiered by which "multiple of the included count" band the selection falls
// into — (1x,2x] = +25%, (2x,3x] = +50%, (3x,4x] = +75%, extrapolated by
// +25% per band beyond that. Any overage at all (even one photo past 1x)
// charges the first band's rate — the three examples given (exactly double/
// triple/quadruple) only define whole-multiple points, not a continuous
// formula, so this is the simplest reading consistent with them. Flagged as
// an assumption worth confirming, not a stated business rule for the
// in-between cases.
export function overageTierPercent(selectedCount: number, includedCount: number): number {
  if (includedCount <= 0 || selectedCount <= includedCount) return 0
  const ratio = selectedCount / includedCount
  const EPS = 1e-9
  const band = Math.ceil(ratio - 1 - EPS)
  return band * 25
}
