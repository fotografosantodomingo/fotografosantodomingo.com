import type { Metadata } from 'next'
import GalleryView from '@/components/gallery/GalleryView'

export const runtime = 'edge'

export const metadata: Metadata = {
  title: 'Tu galería — Babula Shots',
  robots: { index: false, follow: false },
}

export default function Page({ params }: { params: { slug: string } }) {
  return <GalleryView slug={params.slug} />
}
