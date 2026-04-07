// Loading states and skeleton components

export function PageSkeleton() {
  return (
    <div className="min-h-screen">
      {/* Navigation skeleton */}
      <div className="h-16 bg-gray-200 animate-pulse"></div>

      {/* Hero skeleton */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center">
          <div className="h-12 bg-gray-200 rounded-lg animate-pulse mb-4 mx-auto max-w-2xl"></div>
          <div className="h-6 bg-gray-200 rounded animate-pulse mb-8 mx-auto max-w-xl"></div>
          <div className="flex justify-center space-x-4">
            <div className="h-12 w-32 bg-gray-200 rounded-lg animate-pulse"></div>
            <div className="h-12 w-32 bg-gray-200 rounded-lg animate-pulse"></div>
          </div>
        </div>
      </div>

      {/* Content skeleton */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow p-6">
              <div className="h-48 bg-gray-200 rounded animate-pulse mb-4"></div>
              <div className="h-6 bg-gray-200 rounded animate-pulse mb-2"></div>
              <div className="h-4 bg-gray-200 rounded animate-pulse"></div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function CardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow p-6 animate-pulse">
      <div className="h-48 bg-gray-200 rounded mb-4"></div>
      <div className="h-6 bg-gray-200 rounded mb-2"></div>
      <div className="h-4 bg-gray-200 rounded mb-4"></div>
      <div className="h-10 bg-gray-200 rounded"></div>
    </div>
  )
}

export function TextSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2">
      {[...Array(lines)].map((_, i) => (
        <div
          key={i}
          className={`bg-gray-200 rounded animate-pulse ${
            i === lines - 1 ? 'h-4 w-3/4' : 'h-4 w-full'
          }`}
        />
      ))}
    </div>
  )
}

export function ImageSkeleton({ className = 'h-48 w-full' }: { className?: string }) {
  return (
    <div className={`${className} bg-gray-200 rounded animate-pulse flex items-center justify-center`}>
      <svg
        className="w-12 h-12 text-gray-400"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
        />
      </svg>
    </div>
  )
}

export function ButtonSkeleton({ className = 'h-10 w-24' }: { className?: string }) {
  return <div className={`${className} bg-gray-200 rounded animate-pulse`}></div>
}

// Loading spinner component
export function LoadingSpinner({ size = 'md', className = '' }: { size?: 'sm' | 'md' | 'lg', className?: string }) {
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-8 h-8',
    lg: 'w-12 h-12',
  }

  return (
    <div className={`${sizeClasses[size]} ${className}`}>
      <svg
        className="animate-spin text-primary-600"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          strokeWidth="4"
        />
        <path
          className="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
        />
      </svg>
    </div>
  )
}