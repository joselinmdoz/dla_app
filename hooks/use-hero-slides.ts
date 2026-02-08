import { useState, useEffect, useCallback } from 'react'
import { HeroSlide } from '@prisma/client'

interface UseHeroSlidesReturn {
  slides: HeroSlide[]
  currentSlide: number
  isLoading: boolean
  error: string | null
  nextSlide: () => void
  prevSlide: () => void
  goToSlide: (index: number) => void
}

export function useHeroSlides(autoPlayInterval = 5000): UseHeroSlidesReturn {
  const [slides, setSlides] = useState<HeroSlide[]>([])
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch slides del servidor
  const fetchSlides = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/hero-slides')
      if (!response.ok) throw new Error('Error al cargar las slides')
      const data = await response.json()
      setSlides(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
      console.error('Error fetching hero slides:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSlides()
  }, [fetchSlides])

  // Navegación del carrusel
  const nextSlide = useCallback(() => {
    if (slides.length === 0) return
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }, [slides.length])

  const prevSlide = useCallback(() => {
    if (slides.length === 0) return
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }, [slides.length])

  const goToSlide = useCallback((index: number) => {
    if (index >= 0 && index < slides.length) {
      setCurrentSlide(index)
    }
  }, [slides.length])

  // Auto-play
  useEffect(() => {
    if (slides.length <= 1) return

    const interval = setInterval(() => {
      nextSlide()
    }, autoPlayInterval)

    return () => clearInterval(interval)
  }, [slides.length, autoPlayInterval, nextSlide])

  return {
    slides,
    currentSlide,
    isLoading,
    error,
    nextSlide,
    prevSlide,
    goToSlide
  }
}

// Hook para administración de slides
interface HeroSlideFormData {
  imageUrl: string
  altText: string
  title?: string | null
  linkUrl?: string | null
  sortOrder: number
  isActive: boolean
}

export function useAdminHeroSlides() {
  const [slides, setSlides] = useState<HeroSlide[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchSlides = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/hero-slides')
      if (!response.ok) throw new Error('Error al cargar las slides')
      const data = await response.json()
      setSlides(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchSlides()
  }, [fetchSlides])

  const createSlide = async (data: HeroSlideFormData): Promise<HeroSlide | null> => {
    try {
      const response = await fetch('/api/hero-slides', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (!response.ok) throw new Error('Error al crear la slide')
      const newSlide = await response.json()
      setSlides((prev) => [...prev, newSlide])
      return newSlide
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear')
      return null
    }
  }

  const updateSlide = async (id: string, data: Partial<HeroSlideFormData>): Promise<boolean> => {
    try {
      const response = await fetch(`/api/hero-slides/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (!response.ok) throw new Error('Error al actualizar la slide')
      const updatedSlide = await response.json()
      setSlides((prev) =>
        prev.map((slide) => (slide.id === id ? updatedSlide : slide))
      )
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar')
      return false
    }
  }

  const deleteSlide = async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/hero-slides/${id}`, {
        method: 'DELETE'
      })
      if (!response.ok) throw new Error('Error al eliminar la slide')
      setSlides((prev) => prev.filter((slide) => slide.id !== id))
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar')
      return false
    }
  }

  const reorderSlides = async (newOrder: HeroSlide[]): Promise<boolean> => {
    try {
      const response = await fetch('/api/hero-slides', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newOrder)
      })
      if (!response.ok) throw new Error('Error al reordenar las slides')
      setSlides(newOrder)
      return true
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al reordenar')
      return false
    }
  }

  return {
    slides,
    isLoading,
    error,
    createSlide,
    updateSlide,
    deleteSlide,
    reorderSlides,
    refetch: fetchSlides
  }
}
