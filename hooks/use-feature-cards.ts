import { useState, useCallback } from 'react'
import { FeatureCard } from '@prisma/client'

interface UseFeatureCardsReturn {
  cards: FeatureCard[]
  isLoading: boolean
  error: string | null
  refetch: () => Promise<void>
  createCard: (data: Partial<FeatureCard>) => Promise<FeatureCard | null>
  updateCard: (data: FeatureCard) => Promise<boolean>
  deleteCard: (id: string) => Promise<boolean>
  updateCards: (cards: FeatureCard[]) => Promise<boolean>
}

export function useAdminFeatureCards(): UseFeatureCardsReturn {
  const [cards, setCards] = useState<FeatureCard[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCards = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/feature-cards', { cache: 'no-store' })
      if (!response.ok) throw new Error('Error al cargar las tarjetas')
      const data = await response.json()
      setCards(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
      console.error('Error fetching feature cards:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const createCard = useCallback(async (data: Partial<FeatureCard>): Promise<FeatureCard | null> => {
    try {
      const response = await fetch('/api/feature-cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })
      if (!response.ok) throw new Error('Error al crear la tarjeta')
      const newCard = await response.json()
      setCards(prev => [...prev, newCard])
      return newCard
    } catch (err) {
      console.error('Error creating feature card:', err)
      return null
    }
  }, [])

  const updateCard = useCallback(async (data: FeatureCard): Promise<boolean> => {
    try {
      const cardsToUpdate = cards.map(card => 
        card.id === data.id ? data : card
      )
      const response = await fetch('/api/feature-cards', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cardsToUpdate)
      })
      if (!response.ok) throw new Error('Error al actualizar la tarjeta')
      setCards(cardsToUpdate)
      return true
    } catch (err) {
      console.error('Error updating feature card:', err)
      return false
    }
  }, [cards])

  const deleteCard = useCallback(async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/feature-cards?id=${id}`, {
        method: 'DELETE'
      })
      if (!response.ok) throw new Error('Error al eliminar la tarjeta')
      setCards(prev => prev.filter(card => card.id !== id))
      return true
    } catch (err) {
      console.error('Error deleting feature card:', err)
      return false
    }
  }, [])

  const updateCards = useCallback(async (cardsData: FeatureCard[]): Promise<boolean> => {
    try {
      const response = await fetch('/api/feature-cards', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(cardsData)
      })
      if (!response.ok) throw new Error('Error al actualizar las tarjetas')
      setCards(cardsData)
      return true
    } catch (err) {
      console.error('Error updating feature cards:', err)
      return false
    }
  }, [])

  // Initial fetch
  useState(() => {
    fetchCards()
  })

  return {
    cards,
    isLoading,
    error,
    refetch: fetchCards,
    createCard,
    updateCard,
    deleteCard,
    updateCards
  }
}

// Hook para obtener las tarjetas (solo lectura)
export function useFeatureCards() {
  const [cards, setCards] = useState<FeatureCard[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchCards = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/feature-cards', { cache: 'no-store' })
      if (!response.ok) throw new Error('Error al cargar las tarjetas')
      const data = await response.json()
      setCards(data)
      setError(null)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
      console.error('Error fetching feature cards:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useState(() => {
    fetchCards()
  })

  return { cards, isLoading, error, refetch: fetchCards }
}

// Hook para obtener configuración del sitio
export function useSiteSettings() {
  const [settings, setSettings] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(true)

  const fetchSettings = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/site-settings')
      if (!response.ok) throw new Error('Error al cargar la configuración')
      const data = await response.json()
      setSettings(data)
    } catch (err) {
      console.error('Error fetching site settings:', err)
    } finally {
      setIsLoading(false)
    }
  }, [])

  const updateSetting = useCallback(async (key: string, value: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/site-settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ key, value })
      })
      if (!response.ok) throw new Error('Error al actualizar la configuración')
      setSettings(prev => ({ ...prev, [key]: value }))
      return true
    } catch (err) {
      console.error('Error updating site setting:', err)
      return false
    }
  }, [])

  useState(() => {
    fetchSettings()
  })

  return { settings, isLoading, updateSetting, refetch: fetchSettings }
}
