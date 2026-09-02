// Cloudinary configuration and utilities

/**
 * Inserts a Cloudinary transformation as the first chained segment right
 * after /image/upload/ in a full delivery URL. Works whether the URL
 * already has a transform (chains before it) or not. Non-Cloudinary URLs
 * are returned unchanged. Mirrors the loader in src/lib/cloudinary/loader.ts
 * for plain <img> tags that don't go through next/image.
 */
export function withCloudinaryTransform(url: string, transform: string): string {
  const marker = '/image/upload/'
  const idx = url.startsWith('https://res.cloudinary.com/') ? url.indexOf(marker) : -1
  if (idx === -1) return url
  const insertAt = idx + marker.length
  return `${url.slice(0, insertAt)}${transform}/${url.slice(insertAt)}`
}

/** Builds a responsive srcSet string for a raw Cloudinary URL across the given widths. */
export function cloudinarySrcSet(url: string, widths: number[]): string {
  return widths
    .map((w) => `${withCloudinaryTransform(url, `f_auto,q_auto,c_limit,w_${w}`)} ${w}w`)
    .join(', ')
}

export const CLOUDINARY_CONFIG = {
  cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  apiKey: process.env.NEXT_PUBLIC_CLOUDINARY_API_KEY,
  uploadPreset: process.env.NEXT_PUBLIC_CLOUDINARY_PRESET,
}

// Generate Cloudinary URL with transformations
export function getCloudinaryUrl(
  publicId: string,
  options: {
    width?: number
    height?: number
    quality?: number | 'auto'
    format?: 'auto' | 'webp' | 'avif' | 'jpg' | 'png'
    crop?: 'fill' | 'crop' | 'scale' | 'fit' | 'thumb'
    gravity?: 'auto' | 'face' | 'center'
    effect?: string
  } = {}
) {
  if (!CLOUDINARY_CONFIG.cloudName) {
    console.warn('Cloudinary cloud name not configured')
    return ''
  }

  const {
    width,
    height,
    quality = 'auto',
    format = 'auto',
    crop = 'fit',
    gravity = 'auto',
    effect,
  } = options

  const transformations = []

  if (width) transformations.push(`w_${width}`)
  if (height) transformations.push(`h_${height}`)
  if (crop) transformations.push(`c_${crop}`)
  if (gravity) transformations.push(`g_${gravity}`)
  if (quality) transformations.push(`q_${quality}`)
  if (format) transformations.push(`f_${format}`)
  if (effect) transformations.push(`e_${effect}`)

  const transformationString = transformations.join(',')
  const baseUrl = `https://res.cloudinary.com/${CLOUDINARY_CONFIG.cloudName}/image/upload`

  return transformationString
    ? `${baseUrl}/${transformationString}/${publicId}`
    : `${baseUrl}/${publicId}`
}

// Common image transformations for the photography site
export const IMAGE_TRANSFORMS = {
  // Hero images - high quality, optimized
  hero: {
    quality: 'auto' as const,
    format: 'auto' as const,
    crop: 'fill' as const,
    gravity: 'auto' as const,
  },

  // Gallery thumbnails
  thumbnail: {
    width: 400,
    height: 300,
    quality: 'auto' as const,
    format: 'auto' as const,
    crop: 'fit' as const,
    gravity: 'auto' as const,
  },

  // Portfolio grid images
  portfolio: {
    width: 600,
    height: 400,
    quality: 'auto' as const,
    format: 'auto' as const,
    crop: 'fit' as const,
    gravity: 'auto' as const,
  },

  // Full-size images for lightbox
  fullsize: {
    width: 1200,
    height: 800,
    quality: 90,
    format: 'auto' as const,
    crop: 'fit' as const,
  },

  // Avatar/profile images
  avatar: {
    width: 150,
    height: 150,
    quality: 'auto' as const,
    format: 'auto' as const,
    crop: 'fill' as const,
    gravity: 'face' as const,
  },
}

// Generate responsive image URLs
export function getResponsiveImageUrls(publicId: string) {
  return {
    mobile: getCloudinaryUrl(publicId, { ...IMAGE_TRANSFORMS.thumbnail, width: 640 }),
    tablet: getCloudinaryUrl(publicId, { ...IMAGE_TRANSFORMS.portfolio, width: 768 }),
    desktop: getCloudinaryUrl(publicId, { ...IMAGE_TRANSFORMS.fullsize }),
  }
}

// Upload image to Cloudinary (client-side)
export async function uploadImage(file: File): Promise<string | null> {
  if (!CLOUDINARY_CONFIG.uploadPreset) {
    console.error('Cloudinary upload preset not configured')
    return null
  }

  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', CLOUDINARY_CONFIG.uploadPreset)

  try {
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUDINARY_CONFIG.cloudName}/image/upload`,
      {
        method: 'POST',
        body: formData,
      }
    )

    const data = await response.json()

    if (data.secure_url) {
      return data.public_id
    }

    console.error('Upload failed:', data)
    return null
  } catch (error) {
    console.error('Upload error:', error)
    return null
  }
}