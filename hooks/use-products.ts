import { useState, useEffect } from 'react'

export interface Product {
  id: string
  name: string
  description: string | null
  price: string
  image: string | null
  imagePreviewUrl?: string | null
  spiceLevel: number
  category: {
    id: string
    name: string
    slug: string
  }
}

export interface Category {
  id: string
  name: string
  slug: string
  description: string | null
  icon: string | null
  sortOrder: number
  _count: {
    products: number
  }
}

export function useProducts(categorySlug?: string) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchProducts() {
      try {
        setLoading(true)
        const query = categorySlug ? `?category=${encodeURIComponent(categorySlug)}` : ""
        const url = `/api/products${query}`
        const res = await fetch(url, { cache: "no-store" })
        
        if (!res.ok) {
          throw new Error('Error al obtener productos')
        }
        
        const data = await res.json()
        setProducts(data.products || data || [])
        setError(null)
      } catch (err) {
        console.error('Error fetching products:', err)
        setError(err instanceof Error ? err.message : 'Error desconocido')
      } finally {
        setLoading(false)
      }
    }

    fetchProducts()
  }, [categorySlug])

  return { products, loading, error }
}

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function fetchCategories() {
      try {
        setLoading(true)
        const res = await fetch('/api/categories')
        
        if (!res.ok) {
          throw new Error('Error al obtener categorías')
        }
        
        const data = await res.json()
        // La API devuelve { data: [...], pagination: {...} }
        setCategories(data.data || data || [])
        setError(null)
      } catch (err) {
        console.error('Error fetching categories:', err)
        setError(err instanceof Error ? err.message : 'Error desconocido')
      } finally {
        setLoading(false)
      }
    }

    fetchCategories()
  }, [])

  return { categories, loading, error }
}
