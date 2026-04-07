'use client'

import Image from 'next/image'
import { getCloudinaryUrl, IMAGE_TRANSFORMS } from '@/lib/cloudinary'
import { useState } from 'react'

type CloudinaryTransformOptions = {
  width?: number
  height?: number
  quality?: number | 'auto'
  format?: 'auto' | 'webp' | 'avif' | 'jpg' | 'png'
  crop?: 'fill' | 'crop' | 'scale' | 'fit' | 'thumb'
  gravity?: 'auto' | 'face' | 'center'
  effect?: string
}

interface CloudinaryImageProps {
  publicId: string
  alt: string
  width?: number
  height?: number
  className?: string
  priority?: boolean
  quality?: number | 'auto'
  transform?: keyof typeof IMAGE_TRANSFORMS
  placeholder?: 'blur' | 'empty'
  blurDataURL?: string
  onLoad?: () => void
  onError?: () => void
}

export default function CloudinaryImage({
  publicId,
  alt,
  width,
  height,
  className = '',
  priority = false,
  quality = 'auto',
  transform = 'portfolio',
  placeholder = 'empty',
  blurDataURL,
  onLoad,
  onError,
}: CloudinaryImageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const [hasError, setHasError] = useState(false)

  // Get the appropriate transformation
  const transformOptions = IMAGE_TRANSFORMS[transform] as CloudinaryTransformOptions

  // Override with custom dimensions if provided
  const finalOptions = {
    ...transformOptions,
    quality,
    ...(width && { width }),
    ...(height && { height }),
  }

  const imageUrl = getCloudinaryUrl(publicId, finalOptions)

  if (!imageUrl) {
    return (
      <div
        className={`bg-gray-200 flex items-center justify-center text-gray-400 ${className}`}
        style={{ width, height }}
      >
        Image not available
      </div>
    )
  }

  if (hasError) {
    return (
      <div
        className={`bg-gray-200 flex items-center justify-center text-gray-400 ${className}`}
        style={{ width, height }}
      >
        Failed to load image
      </div>
    )
  }

  return (
    <div className={`relative overflow-hidden ${className}`}>
      {isLoading && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}

      <Image
        src={imageUrl}
        alt={alt}
        width={width || transformOptions.width || 600}
        height={height || transformOptions.height || 400}
        priority={priority}
        placeholder={placeholder}
        blurDataURL={blurDataURL}
        className={`transition-opacity duration-300 ${
          isLoading ? 'opacity-0' : 'opacity-100'
        }`}
        onLoad={() => {
          setIsLoading(false)
          onLoad?.()
        }}
        onError={() => {
          setIsLoading(false)
          setHasError(true)
          onError?.()
        }}
      />
    </div>
  )
}