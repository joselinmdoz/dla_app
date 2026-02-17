"use client"

import { useEffect, useState, useRef } from 'react'
import Link from 'next/link'
import { ArrowRight, Star } from 'lucide-react'
import { Car } from 'iconoir-react'

interface FeatureCard {
  id: string
  imageUrl: string
  altText: string
  title: string | null
  description: string | null
  linkUrl: string | null
  sortOrder: number
  isActive: boolean
}

export function FeatureCards() {
  const [cards, setCards] = useState<FeatureCard[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchCards() {
      try {
        // Verificar settings primero
        const settingsResponse = await fetch('/api/site-settings')
        
        if (settingsResponse.ok) {
          const settingsData = await settingsResponse.json()
          
          let featureCardsEnabled = true
          if (Array.isArray(settingsData)) {
            const setting = settingsData.find((s: { key: string }) => s.key === 'featureCardsEnabled')
            featureCardsEnabled = setting ? setting.value === 'true' : true
          } else if (typeof settingsData === 'object' && settingsData !== null) {
            featureCardsEnabled = settingsData.featureCardsEnabled !== 'false'
          }
          
          if (!featureCardsEnabled) {
            setCards([])
            setIsLoading(false)
            return
          }
        }
        
        const response = await fetch('/api/feature-cards')
        if (!response.ok) {
          throw new Error('Error al cargar las tarjetas')
        }
        const data = await response.json()
        setCards(data)
      } catch (err) {
        console.error('Error fetching feature cards:', err)
        setError('Error al cargar las tarjetas')
      } finally {
        setIsLoading(false)
      }
    }

    fetchCards()
  }, [])

  if (isLoading) {
    return (
      <section id="ofertas" className="py-16 bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-80 bg-muted rounded-2xl animate-pulse"></div>
            ))}
          </div>
        </div>
      </section>
    )
  }

  if (error || cards.length === 0) {
    return null
  }

  const sortedCards = [...cards].sort((a, b) => a.sortOrder - b.sortOrder)

  return (
    <section id="ofertas" className="py-20 bg-gradient-to-b from-background via-background to-muted/10">
      <div className="container mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-primary/10 rounded-full mb-4">
            <Car className="w-4 h-4 text-primary fill-primary" />
            <span className="text-sm font-medium text-primary">Ofertas de servicio</span>
          </div>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground mb-4 tracking-tight">
            Descubre Nuestros
            <span className="text-primary block mt-1">Servicios</span>
          </h2>
          {/* <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Explora nuestros ofertas exclusivas y aprovecha los mejores precios
          </p> */}
        </div>

        {/* Cards Grid - Simple */}
        <div className="flex flex-wrap justify-center gap-6 max-w-5xl mx-auto">
          {sortedCards.map((card) => (
            card.imageUrl ? (
              <img
                key={card.id}
                src={`/api/feature-cards/${card.id}/serve`}
                alt={card.altText || card.title || 'Imagen de oferta'}
                className="w-full md:w-[500px] h-96 rounded-2xl drop-shadow-[0_0_80px_rgba(251,191,36,0.5)] transition-transform duration-300 hover:scale-105 cursor-pointer"
                style={{ objectFit: 'fill' }}
              />
            ) : null
          ))}
        </div>

        

        {/* View All Link */}
        {sortedCards.some(card => card.linkUrl) && (
          <div className="text-center mt-12">
            <Link 
              href="/products" 
              className="inline-flex items-center gap-2 px-8 py-3 bg-primary text-primary-foreground rounded-full font-medium hover:bg-primary/90 transition-all duration-300 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/40 hover:scale-105"
            >
              Ver todas las ofertas
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        )}
      </div>
    </section>
  )
}
