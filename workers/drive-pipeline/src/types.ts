export interface Env {
  // Required secrets
  ANTHROPIC_API_KEY: string
  SUPABASE_SERVICE_ROLE_KEY: string
  GOOGLE_SERVICE_ACCOUNT_JSON: string
  GOOGLE_DRIVE_FOLDER_ID: string
  BREVO_API_KEY: string
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
  content_es: string
  content_en: string
  cover_image_alt_es: string
  cover_image_alt_en: string
  reading_time: number
  service_type: string
  geo_city: string
  tags: string[]
  fb_caption_es: string
  ig_caption_es: string
  li_caption_es: string
}

export interface StoredImage {
  fileId: string
  ext: string
  mimeType: string
  publicUrl: string
}

export interface CrossPostResult {
  platform: 'fb' | 'ig' | 'li'
  status: 'posted' | 'failed' | 'skipped'
  postId?: string
  error?: string
}
