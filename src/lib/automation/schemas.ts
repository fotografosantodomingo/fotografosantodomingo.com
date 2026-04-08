import { z } from 'zod'

export const CreatePostSchema = z.object({
  slug_es: z.string().min(3).max(200).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'slug_es must be lowercase hyphenated with no accents or special characters',
  }),
  slug_en: z.string().min(3).max(200).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: 'slug_en must be lowercase hyphenated',
  }),
  title_es: z.string().min(10).max(100),
  title_en: z.string().min(10).max(100),
  content_es: z.string().min(200),
  content_en: z.string().min(200),
  excerpt_es: z.string().max(500).optional(),
  excerpt_en: z.string().max(500).optional(),
  meta_description_es: z.string().max(160).optional(),
  meta_description_en: z.string().max(160).optional(),
  og_title_es: z.string().max(100).optional(),
  og_title_en: z.string().max(100).optional(),
  primary_keyword_es: z.string().max(100).optional(),
  primary_keyword_en: z.string().max(100).optional(),
  cover_image_url: z.string().url().includes('res.cloudinary.com').includes('f_webp'),
  cover_image_thumbnail_url: z.string().url().includes('res.cloudinary.com').includes('f_webp'),
  cover_image_placeholder_url: z.string().url().includes('res.cloudinary.com').includes('f_webp'),
  cover_image_alt_es: z.string().max(300).optional(),
  cover_image_alt_en: z.string().max(300).optional(),
  cover_image_format: z.literal('webp'),
  cover_image_public_id: z.string().min(3),
  schema_service_type: z.string().optional(),
  geo_city: z.string().optional(),
  geo_country: z.string().default('Dominican Republic'),
  service_type: z.string().optional(),
  location: z.string().optional(),
  cloudinary_folder: z.string().optional(),
  status: z.enum(['published', 'draft', 'archived']).default('published'),
  published_at: z.string().datetime().optional(),
})

export const LogAutomationSchema = z.object({
  idempotency_key: z.string().min(1),
  folder: z.string().min(1),
  public_id: z.string().optional(),
  image_format: z.literal('webp').default('webp'),
  service_type: z.string().optional(),
  location: z.string().optional(),
  language: z.enum(['ES', 'EN']).optional(),
  status: z.enum([
    'success',
    'failed_openai',
    'failed_cms',
    'failed_social',
    'rejected_format',
    'rejected_prefix',
    'partial_success',
  ]),
  phase: z.string().optional(),
  error_message: z.string().optional(),
  post_id: z.string().uuid().optional(),
  blog_url_es: z.string().url().optional(),
  blog_url_en: z.string().url().optional(),
  instagram_status: z.enum(['success', 'failed', 'skipped', 'pending']).default('pending'),
  facebook_status: z.enum(['success', 'failed', 'skipped', 'pending']).default('pending'),
  linkedin_status: z.enum(['success', 'failed', 'skipped', 'pending']).default('pending'),
  pinterest_status: z.enum(['success', 'failed', 'skipped', 'pending']).default('pending'),
  completed_at: z.string().datetime().optional(),
})

export type CreatePostInput = z.infer<typeof CreatePostSchema>
export type LogAutomationInput = z.infer<typeof LogAutomationSchema>