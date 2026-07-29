export type GalleryStatus = 'draft' | 'uploading' | 'ready' | 'expired' | 'deleted'
export type GalleryDeleteReason = 'expiration' | 'manual' | 'client_request'
export type GalleryDownloadType = 'single' | 'zip' | 'batch'

export type Gallery = {
  id: string
  slug: string
  booking_id: string | null
  client_name: string
  client_email: string
  password_hash: string
  status: GalleryStatus
  cover_photo_id: string | null
  photo_count: number
  total_bytes: number
  internal_notes: string | null
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
  created_at: string
}

// Shape returned to the client gallery page — never leaks R2 keys or password_hash.
export type PublicGallery = {
  slug: string
  client_name: string
  status: GalleryStatus
  photo_count: number
  total_bytes: number
  expires_at: string | null
  photos: {
    id: string
    filename: string
    width: number | null
    height: number | null
    file_size: number
  }[]
}
