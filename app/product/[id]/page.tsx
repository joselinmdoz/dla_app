"use client"

import { useParams } from "next/navigation"
import Link from "next/link"
import Image from "next/image"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { ArrowLeft, Star, ShieldCheck, Truck, CheckCircle } from "iconoir-react"
import { useState, useEffect } from "react"

interface ProductDetails {
  id: string
  name: string
  description: string | null
  price: string
  image: string | null
  spiceLevel: number
  category?: { id: string; name: string; slug: string }
  features?: string[]
  includes?: { item: string; quantity: string }[]
  content?: { item: string; quantity: string }[] | null
  deliveryTime?: string
  rating?: number
  reviews?: number
}

export default function ProductPage() {
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

  return (
    <main className="min-h-screen bg-background">
      <Header />
      
      {/* Breadcrumb */}
      <div className="pt-24 pb-6 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link 
          href="/#menu" 
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a productos
        </Link>
      </div>

      {/* Product Details */}
      <section className="pb-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
            {/* Product Image */}
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

            {/* Product Info */}
            <div className="space-y-8">
              <div>
                <h1 className="text-4xl lg:text-5xl font-black text-foreground mb-4 tracking-tight">
                  {product.name}
                </h1>
                
                {/* Rating */}
                <div className="flex items-center gap-4 mb-6">
                  <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star
                        key={i}
                        className={`w-6 h-6 ${i < 4 ? "text-yellow-500 fill-yellow-500" : "text-muted"}`}
                      />
                    ))}
                  </div>
                  <span className="text-foreground font-medium">
                    4.5 (0 reseñas)
                  </span>
                </div>

                <p className="text-lg text-muted-foreground leading-relaxed">
                  {product.description || "Sin descripción disponible"}
                </p>
              </div>

              {/* Features */}
              {product.features && product.features.length > 0 && (
                <div className="bg-card rounded-2xl p-6 border border-border">
                  <h3 className="text-xl font-black text-foreground mb-4">Características</h3>
                  <ul className="space-y-3">
                    {product.features.map((feature, index) => (
                      <li key={index} className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-primary flex-shrink-0" />
                        <span className="text-muted-foreground">{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Includes */}
              {product.includes && product.includes.length > 0 && (
                <div className="bg-card rounded-2xl p-6 border border-border">
                  <h3 className="text-xl font-black text-foreground mb-4">Contenido</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {product.includes.map((include, index) => (
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
              {product.content && product.content.length > 0 && (
                <div className="bg-card rounded-2xl p-6 border border-border">
                  <h3 className="text-xl font-black text-foreground mb-4">Contenido de la Caja</h3>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {product.content.map((contentItem, index) => (
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
              <div className="flex flex-wrap gap-6">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-full bg-primary/10">
                    <Truck className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Tiempo de entrega</p>
                    <p className="font-bold text-foreground">5-7 días hábiles</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-full bg-primary/10">
                    <ShieldCheck className="w-6 h-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Disponible</p>
                    <p className="font-bold text-foreground">Sí</p>
                  </div>
                </div>
              </div>

              {/* CTA Button */}
              <Link
                href="https://www.solvebigtech.com/solvedc/tracking/dayready/"
                className="group flex items-center justify-center gap-3 w-full py-5 bg-primary text-primary-foreground font-bold text-xl tracking-wider rounded-2xl hover:bg-primary/90 transition-all shadow-2xl hover:shadow-primary/25"
              >
                Rastrear envío
                <ArrowLeft className="w-6 h-6 rotate-180 group-hover:-translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  )
}
