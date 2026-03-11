"use client"

import { useEffect, useState } from "react"
import { Building2, ChevronLeft, ChevronRight } from "lucide-react"
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
  updatedAt?: string
}

export function OfficeGallery() {
  const { isSectionEnabled, isLoading: isContentLoading } = useLandingContent()
  const [images, setImages] = useState<OfficeImage[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isPaused, setIsPaused] = useState(false)
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

        const response = await fetch("/api/office-images", { cache: "no-store" })
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

  const sortedImages = [...images].sort((a, b) => a.sortOrder - b.sortOrder)
  const totalSlides = sortedImages.length

  useEffect(() => {
    if (totalSlides === 0) {
      setCurrentSlide(0)
      return
    }

    setCurrentSlide((prev) => Math.min(prev, totalSlides - 1))
  }, [totalSlides])

  useEffect(() => {
    if (totalSlides <= 1 || isPaused) return

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % totalSlides)
    }, 5000)

    return () => clearInterval(interval)
  }, [totalSlides, isPaused])

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

  const nextSlide = () => {
    if (totalSlides <= 1) return
    setCurrentSlide((prev) => (prev + 1) % totalSlides)
  }

  const prevSlide = () => {
    if (totalSlides <= 1) return
    setCurrentSlide((prev) => (prev - 1 + totalSlides) % totalSlides)
  }

  const goToSlide = (index: number) => {
    if (index < 0 || index >= totalSlides) return
    setCurrentSlide(index)
  }

  const getRelativePosition = (index: number) => {
    if (totalSlides === 0) return 0
    let diff = index - currentSlide
    const half = Math.floor(totalSlides / 2)
    if (diff > half) diff -= totalSlides
    if (diff < -half) diff += totalSlides
    return diff
  }

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

        <div
          className="relative max-w-6xl mx-auto"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          <div className="absolute -top-10 left-1/2 -translate-x-1/2 w-[70%] h-24 bg-primary/15 blur-3xl pointer-events-none" />
          <div className="relative h-[360px] sm:h-[560px] lg:h-[700px] [perspective:1600px] overflow-hidden">
            {sortedImages.map((image, index) => {
              const relative = getRelativePosition(index)
              const isCenter = relative === 0
              const isSide = Math.abs(relative) === 1
              const isHidden = Math.abs(relative) > 1
              const translateX = relative === 0 ? 0 : relative < 0 ? -58 : 58
              const scale = relative === 0 ? 1 : isSide ? 0.86 : 0.74
              const rotateY = relative === 0 ? 0 : relative < 0 ? 10 : -10
              const opacity = relative === 0 ? 1 : isSide ? 0.64 : 0
              const filter = relative === 0 ? "none" : isSide ? "blur(3.2px) saturate(0.82) brightness(0.78) contrast(0.92)" : "blur(12px)"
              const zIndex = relative === 0 ? 30 : isSide ? 20 : 0
              const imageSrc = `/api/office-images/${image.id}/serve?v=${encodeURIComponent(String(image.updatedAt || image.imageUrl || image.id))}`
              const sideOverlayClass = isSide
                ? relative < 0
                  ? "bg-gradient-to-r from-black/45 via-black/15 to-white/10"
                  : "bg-gradient-to-l from-black/45 via-black/15 to-white/10"
                : "bg-transparent"

              const imageCard = (
                <div className="relative w-full h-full">
                  <img
                    src={imageSrc}
                    alt={image.altText || image.title || "Imagen de oficina"}
                    className="absolute inset-0 w-full h-full object-cover scale-110 blur-xl brightness-50"
                    aria-hidden="true"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/30" />
                  <img
                    src={imageSrc}
                    alt={image.altText || image.title || "Imagen de oficina"}
                    className={`relative z-10 w-full h-full object-contain p-2 sm:p-3 transition-transform duration-[1100ms] ease-[cubic-bezier(.22,1,.36,1)] ${
                      isCenter ? "scale-100" : "scale-[1.02]"
                    }`}
                    loading="lazy"
                  />
                  <div className={`absolute inset-0 z-10 pointer-events-none transition-opacity duration-700 ${sideOverlayClass}`} />
                  <div
                    className={`absolute inset-0 z-10 bg-[linear-gradient(110deg,transparent_20%,rgba(255,255,255,0.16)_50%,transparent_80%)] ${
                      isCenter ? "animate-[officeShine_2.6s_ease_forwards]" : "opacity-0"
                    }`}
                    aria-hidden="true"
                  />
                  <div className={`absolute inset-0 ${isCenter ? "bg-gradient-to-t from-black/65 via-black/25 to-transparent" : "bg-black/25"}`} />
                  {isCenter && (image.title || image.description) && (
                    <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-8 z-20">
                      {image.title && <h3 className="text-white font-semibold text-2xl">{image.title}</h3>}
                      {image.description && <p className="text-white/85 text-sm sm:text-base mt-2 max-w-2xl">{image.description}</p>}
                    </div>
                  )}
                </div>
              )

              return (
                <div
                  key={image.id}
                  className={`absolute top-1/2 left-1/2 w-[66%] sm:w-[52%] lg:w-[42%] xl:w-[36%] aspect-[1509/2000] max-h-[92%] rounded-3xl overflow-hidden transform-gpu will-change-[transform,opacity,filter] transition-[transform,opacity,filter,box-shadow,border-color] duration-[950ms] ease-[cubic-bezier(.22,1,.36,1)] ${
                    isCenter
                      ? "ring-1 ring-primary/40 border border-border/70 shadow-2xl"
                      : "border border-white/20 shadow-[0_18px_50px_rgba(0,0,0,0.5)]"
                  } ${isHidden ? "pointer-events-none" : ""}`}
                  style={{
                    transform: `translate(-50%, -50%) translateX(${translateX}%) rotateY(${rotateY}deg) scale(${scale})`,
                    opacity,
                    filter,
                    zIndex,
                    animation: isCenter ? "officeCenterPulse 6s ease-in-out infinite" : undefined,
                  }}
                  onClick={() => {
                    if (!isCenter) goToSlide(index)
                  }}
                >
                  {image.linkUrl ? (
                    <a href={image.linkUrl} target="_blank" rel="noopener noreferrer" className="block w-full h-full">
                      {imageCard}
                    </a>
                  ) : (
                    imageCard
                  )}
                </div>
              )
            })}
          </div>

          {totalSlides > 1 && (
            <>
              <button
                onClick={prevSlide}
                className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 z-40 p-2 sm:p-3 rounded-full bg-black/55 text-white hover:bg-primary transition-colors"
                aria-label="Imagen anterior"
              >
                <ChevronLeft className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>
              <button
                onClick={nextSlide}
                className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 z-40 p-2 sm:p-3 rounded-full bg-black/55 text-white hover:bg-primary transition-colors"
                aria-label="Siguiente imagen"
              >
                <ChevronRight className="w-5 h-5 sm:w-6 sm:h-6" />
              </button>

              <div className="flex items-center justify-center gap-2 mt-5">
                {sortedImages.map((image, index) => (
                  <button
                    key={image.id}
                    onClick={() => goToSlide(index)}
                    className={`h-2.5 rounded-full transition-all ${
                      currentSlide === index ? "w-8 bg-primary" : "w-2.5 bg-muted-foreground/40 hover:bg-muted-foreground/70"
                    }`}
                    aria-label={`Ir a imagen ${index + 1}`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </div>
      <style jsx>{`
        @keyframes officeCenterPulse {
          0% {
            transform: translate(-50%, -50%) translateX(0%) rotateY(0deg) scale(1.03);
          }
          50% {
            transform: translate(-50%, -50%) translateX(0%) rotateY(0deg) scale(1.045);
          }
          100% {
            transform: translate(-50%, -50%) translateX(0%) rotateY(0deg) scale(1.03);
          }
        }
        @keyframes officeShine {
          0% {
            transform: translateX(-120%);
            opacity: 0;
          }
          20% {
            opacity: 1;
          }
          100% {
            transform: translateX(120%);
            opacity: 0;
          }
        }
      `}</style>
    </section>
  )
}
