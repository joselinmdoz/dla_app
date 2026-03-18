"use client"

import { useParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ArrowLeft, Star, ShieldCheck, Truck, CheckCircle } from "iconoir-react"
import { useState, useEffect } from "react"
import { useLandingContent } from "@/hooks/use-landing-content"

interface ContentItem {
  item: string
  quantity: string
}

interface ProductDetails {
  id: string
  name: string
  description: string | null
  price: string
  image: string | null
  spiceLevel: number
  category?: { id: string; name: string; slug: string }
  features?: string[]
  includes?: ContentItem[]
  content?: unknown
  deliveryTime?: string
  rating?: number
  reviews?: number
  available?: boolean
}

interface ParsedProductContent {
  boxItems: ContentItem[]
  includes: ContentItem[]
  features: string[]
  deliveryTime: string
  rating: number | null
  reviews: number | null
}

function isContentItem(value: unknown): value is ContentItem {
  if (!value || typeof value !== "object") return false
  const item = (value as Record<string, unknown>).item
  const quantity = (value as Record<string, unknown>).quantity
  return typeof item === "string" && typeof quantity === "string"
}

function parseProductContent(raw: unknown): ParsedProductContent {
  const base: ParsedProductContent = {
    boxItems: [],
    includes: [],
    features: [],
    deliveryTime: "",
    rating: null,
    reviews: null,
  }

  if (!raw) return base

  if (Array.isArray(raw)) {
    return {
      ...base,
      boxItems: raw.filter(isContentItem),
    }
  }

  if (typeof raw !== "object") return base

  const content = raw as Record<string, unknown>
  const boxItems = Array.isArray(content.boxItems) ? content.boxItems.filter(isContentItem) : []
  const includes = Array.isArray(content.includes) ? content.includes.filter(isContentItem) : []
  const features = Array.isArray(content.features)
    ? content.features.filter((item): item is string => typeof item === "string" && item.trim().length > 0)
    : []
  const deliveryTime = typeof content.deliveryTime === "string" ? content.deliveryTime : ""
  const rating =
    typeof content.rating === "number"
      ? content.rating
      : typeof content.rating === "string"
        ? Number(content.rating)
        : null
  const reviews =
    typeof content.reviews === "number"
      ? content.reviews
      : typeof content.reviews === "string"
        ? Number(content.reviews)
        : null

  return {
    boxItems,
    includes,
    features,
    deliveryTime,
    rating: Number.isFinite(rating) ? rating : null,
    reviews: Number.isFinite(reviews) ? reviews : null,
  }
}

export default function ProductPage() {
  const { isSectionEnabled, content: landingContent } = useLandingContent()
  const params = useParams()
  const productId = params.id as string
  const [product, setProduct] = useState<ProductDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchProduct() {
      try {
        setLoading(true)
        const res = await fetch(`/api/products/${productId}`)
        if (!res.ok) {
          throw new Error("Producto no encontrado")
        }
        const data = await res.json()
        setProduct(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error al cargar producto")
      } finally {
        setLoading(false)
      }
    }

    if (productId) {
      fetchProduct()
    }
  }, [productId])

  if (loading) {
    return (
      <main className="min-h-screen bg-background">
        <Header />
        <div className="pt-24 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-muted-foreground">Cargando producto...</p>
        </div>
        <Footer />
      </main>
    )
  }

  if (error || !product) {
    return (
      <main className="min-h-screen bg-background">
        <Header />
        <div className="pt-24 pb-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-black text-foreground mb-4">Producto no encontrado</h1>
          <p className="text-muted-foreground mb-4">{error}</p>
          <Link href="/#menu" className="text-primary hover:underline">
            Volver al menú
          </Link>
        </div>
        <Footer />
      </main>
    )
  }

  const price = parseFloat(product.price.toString())
  const spiceLevel = product.spiceLevel || 0
  const parsedContent = parseProductContent(product.content)
  const features = parsedContent.features.length > 0 ? parsedContent.features : product.features || []
  const includes = parsedContent.includes.length > 0 ? parsedContent.includes : product.includes || []
  const boxItems = parsedContent.boxItems
  const rating = parsedContent.rating ?? product.rating ?? 4.5
  const reviews = parsedContent.reviews ?? product.reviews ?? 0
  const deliveryTime = parsedContent.deliveryTime || product.deliveryTime || "5-7 días hábiles"
  const ratingStars = Math.max(0, Math.min(5, Math.round(rating)))
  const breadcrumbEnabled = isSectionEnabled("productDetailBreadcrumbEnabled")
  const imageEnabled = isSectionEnabled("productDetailImageEnabled")
  const ratingEnabled = isSectionEnabled("productDetailRatingEnabled")
  const descriptionEnabled = isSectionEnabled("productDetailDescriptionEnabled")
  const featuresEnabled = isSectionEnabled("productDetailFeaturesEnabled")
  const includesEnabled = isSectionEnabled("productDetailIncludesEnabled")
  const boxContentEnabled = isSectionEnabled("productDetailBoxContentEnabled")
  const deliveryEnabled = isSectionEnabled("productDetailDeliveryEnabled")
  const trackingEnabled = isSectionEnabled("productDetailTrackingEnabled")

  return (
    <main className="min-h-screen bg-background">
      <Header />
      
      {/* Breadcrumb */}
      {breadcrumbEnabled && (
        <div className="pt-24 pb-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link 
            href="/#menu" 
            className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Volver a productos
          </Link>
        </div>
      )}

      {/* Product Details */}
      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className={`grid ${imageEnabled ? "lg:grid-cols-2 gap-12 lg:gap-16" : "grid-cols-1 gap-8"}`}>
            {/* Product Image */}
            {imageEnabled && (
              <div className="relative">
                <div className="relative w-full aspect-square bg-card rounded-3xl overflow-hidden shadow-2xl">
                  {product.image ? (
                    <Image
                      src={product.image}
                      alt={product.name}
                      fill
                      className="object-contain p-8"
                      style={{ filter: 'drop-shadow(0 20px 60px rgba(251, 191, 36, 0.3))' }}
                    />
                  ) : (
                    <div className="flex items-center justify-center w-full h-full text-muted-foreground">
                      Sin imagen
                    </div>
                  )}
                </div>
                
                {/* Price Badge */}
                <div className="absolute -top-6 -right-6 z-20 bg-primary text-primary-foreground px-8 py-4 rounded-full shadow-2xl">
                  <span className="text-4xl font-black">${price.toFixed(2)}</span>
                </div>
                
                {/* Spice Level Badge */}
                {spiceLevel > 0 && (
                  <div className="absolute -top-6 -left-6 z-20 bg-red-500 text-white px-4 py-2 rounded-full shadow-lg">
                    <span className="font-bold text-lg">{"🌶️".repeat(spiceLevel)}</span>
                  </div>
                )}
              </div>
            )}

            {/* Product Info */}
            <div className="space-y-8">
              <div>
                <h1 className="text-4xl lg:text-5xl font-black text-foreground mb-4 tracking-tight">
                  {product.name}
                </h1>
                
                {/* Rating */}
                {ratingEnabled && (
                  <div className="flex items-center gap-4 mb-6">
                    <div className="flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          className={`w-6 h-6 ${i < ratingStars ? "text-yellow-500 fill-yellow-500" : "text-muted"}`}
                        />
                      ))}
                    </div>
                    <span className="text-foreground font-medium">
                      {rating.toFixed(1)} ({reviews} reseñas)
                    </span>
                  </div>
                )}

                {descriptionEnabled && (
                  <p className="text-lg text-muted-foreground leading-relaxed">
                    {product.description || "Sin descripción disponible"}
                  </p>
                )}
              </div>

              {/* Features */}
              {featuresEnabled && features.length > 0 && (
                <div className="bg-card rounded-2xl p-6 border border-border">
                  <h3 className="text-xl font-black text-foreground mb-4">Características</h3>
                  <ul className="space-y-3">
                    {features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Includes */}
              {includesEnabled && includes.length > 0 && (
                <div className="bg-card rounded-2xl p-6 border border-border">
                  <h3 className="text-xl font-black text-foreground mb-4">Contenido</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {includes.map((include, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1" />
                        <span className="text-muted-foreground text-sm">
                          <span className="text-foreground font-medium">{include.item}</span> {include.quantity}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Content Box */}
              {boxContentEnabled && boxItems.length > 0 && (
                <div className="bg-card rounded-2xl p-6 border border-border">
                  <h3 className="text-xl font-black text-foreground mb-4">Contenido de la Caja</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {boxItems.map((contentItem, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-1" />
                        <span className="text-muted-foreground text-sm">
                          <span className="text-foreground font-medium">{contentItem.item}</span> {contentItem.quantity}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Delivery Info */}
              {deliveryEnabled && (
                <div className="flex flex-wrap gap-6">
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-full bg-primary/10">
                      <Truck className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Tiempo de entrega</p>
                      <p className="font-bold text-foreground">{deliveryTime}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="p-3 rounded-full bg-primary/10">
                      <ShieldCheck className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Disponible</p>
                      <p className="font-bold text-foreground">{product.available !== false ? "Sí" : "No"}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* CTA Button */}
              {trackingEnabled && (
                <Link
                  href={landingContent.business.trackingUrl}
                  className="group flex items-center justify-center gap-3 w-full py-5 bg-primary text-primary-foreground font-bold text-xl tracking-wider rounded-2xl hover:bg-primary/90 transition-all shadow-2xl hover:shadow-primary/25"
                >
                  Rastrear envío
                  <ArrowLeft className="w-6 h-6 rotate-180 group-hover:-translate-x-1 transition-transform" />
                </Link>
              )}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
