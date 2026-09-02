export interface Env {
  // Required secrets
  ANTHROPIC_API_KEY: string
  SUPABASE_SERVICE_ROLE_KEY: string
  GOOGLE_CLIENT_ID: string
  GOOGLE_CLIENT_SECRET: string
  GOOGLE_REFRESH_TOKEN: string
  GOOGLE_DRIVE_FOLDER_ID: string
  RESEND_API_KEY: string
  EMAIL_LINK_SECRET: string
  // Required vars
  ANTHROPIC_MODEL: string
  SUPABASE_URL: string
  SITE_URL: string
  WORKER_BASE_URL: string
  REVIEW_EMAIL_FROM: string
  REVIEW_EMAIL_TO: string
  META_ENABLED: string
  META_IG_ENABLED: string
  LINKEDIN_ENABLED: string
  // Optional social secrets
  META_PAGE_ACCESS_TOKEN?: string
  META_PAGE_ID?: string
  META_IG_BUSINESS_ID?: string
  LINKEDIN_CLIENT_ID?: string
  LINKEDIN_CLIENT_SECRET?: string
  LINKEDIN_ACCESS_TOKEN?: string
  LINKEDIN_AUTHOR_URN?: string
  // Pinterest
  PINTEREST_ENABLED?: string
  PINTEREST_CLIENT_ID?: string
  PINTEREST_CLIENT_SECRET?: string
  PINTEREST_REFRESH_TOKEN?: string
  PINTEREST_BOARD_ID?: string
  // Google Business Profile
  GBP_ENABLED?: string
  GBP_CLIENT_ID?: string
  GBP_CLIENT_SECRET?: string
  GBP_REFRESH_TOKEN?: string
  GBP_LOCATION_NAME?: string
  GBP_REVIEWS_URL?: string
  // DeviantArt
  DA_ENABLED?: string
  DA_CLIENT_ID?: string
  DA_CLIENT_SECRET?: string
  DA_REFRESH_TOKEN?: string
  // Cloudinary — optional. Used only to generate a real blog cover-image
  // thumbnail at ingestion time (see cloudinary.ts). If unset, thumbnail
  // generation is skipped and cover_image_thumbnail_url falls back to the
  // existing behavior (same URL as cover_image_url) — post creation is
  // never blocked by this being absent.
  CLOUDINARY_CLOUD_NAME?: string
  CLOUDINARY_API_KEY?: string
  CLOUDINARY_API_SECRET?: string
}

export interface DriveFile {
  id: string
  name: string
  mimeType: string
  modifiedTime: string
}

export interface DriveGroup {
  groupKey: string
  type: 'single' | 'multi'
  files: DriveFile[]
  folderName?: string
}

export interface FaqItem {
  question: string
  answer: string
}

export interface InternalLink {
  text: string
  url: string
  description: string
}

export interface GeneratedPost {
  slug_es: string
  slug_en: string
  title_es: string
  title_en: string
  excerpt_es: string
  excerpt_en: string
  meta_description_es: string
  meta_description_en: string
  og_title_es: string
  og_title_en: string
  primary_keyword_es: string
  primary_keyword_en: string
  intro_es: string
  intro_en: string
  content_es: string
  content_en: string
  location_section_es: string
  location_section_en: string
  faq_es: FaqItem[]
  faq_en: FaqItem[]
  cover_image_alt_es: string
  cover_image_alt_en: string
  cover_image_title_es: string
  cover_image_title_en: string
  cover_image_caption_es: string
  cover_image_caption_en: string
  cover_image_description_es: string
  cover_image_description_en: string
  reading_time: number
  service_type: string
  geo_city: string
  tags: string[]
  fb_caption_es: string
  ig_caption_es: string
  li_caption_es: string
  pi_caption_es: string
  gbp_caption_es: string
}

export interface StoredImage {
  fileId: string
  ext: string
  mimeType: string
  publicUrl: string
}

export interface CrossPostResult {
  platform: 'fb' | 'ig' | 'li' | 'pi' | 'gbp' | 'da'
  status: 'posted' | 'failed' | 'skipped'
  postId?: string
  error?: string
}
