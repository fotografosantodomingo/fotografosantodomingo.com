// Cloudinary configuration and utilities

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
    crop = 'fill',
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
    crop: 'fill' as const,
    gravity: 'auto' as const,
  },

  // Portfolio grid images
  portfolio: {
    width: 600,
    height: 400,
    quality: 'auto' as const,
    format: 'auto' as const,
    crop: 'fill' as const,
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