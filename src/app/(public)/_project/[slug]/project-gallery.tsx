'use client'

import { useState } from 'react'
import Image from 'next/image'

import { cloudinaryUrl } from '@/lib/cloudinary'
import Lightbox from './lightbox'

export interface ProjectGalleryProps {
  images: string[]
  title: string
}

/**
 * Client island for the project detail image gallery. Owns the "which
 * image is open in the lightbox" state (`null` = closed) so the parent
 * `page.tsx` can stay a Server Component. Clicking a thumbnail opens the
 * full-screen `Lightbox` at that image's index.
 */
export default function ProjectGallery({ images, title }: ProjectGalleryProps): React.JSX.Element | null {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null)

  if (images.length === 0) return null

  return (
    <>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-12">
        {images.map((img, i) => (
          <button
            key={img}
            type="button"
            onClick={() => setLightboxIndex(i)}
            className="relative aspect-square rounded-xl overflow-hidden cursor-zoom-in"
          >
            <Image
              src={cloudinaryUrl(img, { width: 800 })}
              alt={`${title} — image ${i + 1}`}
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover hover:scale-105 transition-transform duration-300"
            />
          </button>
        ))}
      </div>

      {lightboxIndex !== null && (
        <Lightbox
          images={images}
          initialIndex={lightboxIndex}
          altPrefix={title}
          onClose={() => setLightboxIndex(null)}
        />
      )}
    </>
  )
}
