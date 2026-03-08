"use client"

import { useEffect, useState } from "react"
import { Building2 } from "lucide-react"
import { useLandingContent } from "@/hooks/use-landing-content"

interface OfficeImage {
  id: string
  imageUrl: string
  altText: string
  title: string | null
  description: string | null
  linkUrl: string | null
  sortOrder: number
  isActive: boolean
}

export function OfficeGallery() {
  const { isSectionEnabled, isLoading: isContentLoading } = useLandingContent()
  const [images, setImages] = useState<OfficeImage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const officeGalleryEnabled = isSectionEnabled("officeGalleryEnabled")

  useEffect(() => {
    async function fetchOfficeImages() {
      try {
        if (isContentLoading) return

        if (!officeGalleryEnabled) {
          setImages([])
          setIsLoading(false)
          return
        }

        const response = await fetch("/api/office-images")
        if (!response.ok) {
          setImages([])
          setError(null)
          return
        }

        const data = await response.json()
        setImages(Array.isArray(data) ? data : [])
        setError(null)
      } catch {
        setImages([])
        setError(null)
      } finally {
        setIsLoading(false)
      }
    }

    fetchOfficeImages()
  }, [isContentLoading, officeGalleryEnabled])

  if (isLoading) {
    return (
      <section id="offices" className="py-16 bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-72 bg-muted rounded-2xl animate-pulse"></div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (error || images.length === 0 || !officeGalleryEnabled) {
    return null
  }

  const sortedImages = [...images].sort((a, b) => a.sortOrder - b.sortOrder)

  return (
    <section id="offices" className="py-20 bg-gradient-to-b from-background via-background to-muted/10">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 rounded-full mb-4">
            <Building2 className="w-4 h-4 text-primary" />
            <span className="text-sm font-medium text-primary">Nuestras oficinas</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground tracking-tight">
            Conoce Nuestros Espacios
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedImages.map((image) => {
            const imageCard = (
              <div className="group relative rounded-2xl overflow-hidden border border-border bg-card h-72">
                <img
                  src={`/api/office-images/${image.id}/serve`}
                  alt={image.altText || image.title || "Imagen de oficina"}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
                {(image.title || image.description) && (
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    {image.title && <h3 className="text-white font-semibold text-lg">{image.title}</h3>}
                    {image.description && <p className="text-white/80 text-sm mt-1 line-clamp-2">{image.description}</p>}
                  </div>
                )}
              </div>
            )

            if (image.linkUrl) {
              return (
                <a key={image.id} href={image.linkUrl} target="_blank" rel="noopener noreferrer">
                  {imageCard}
                </a>
              )
            }

            return <div key={image.id}>{imageCard}</div>
          })}
        </div>
      </div>
    </section>
  )
}
