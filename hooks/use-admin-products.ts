'use client'

import { useState, useCallback } from 'react'

export interface ContentItem {
  item: string
  quantity: string
}

export interface ProductDetailContent {
  boxItems?: ContentItem[]
  features?: string[]
  includes?: ContentItem[]
  deliveryTime?: string
  rating?: number
  reviews?: number
}

export interface Product {
  id: string
  name: string
  slug: string
  description: string | null
  price: number
  costPrice: number | null
  image: string | null
  imagePreviewUrl?: string | null
  spiceLevel: number
  available: boolean
  sortOrder: number
  content: ContentItem[] | ProductDetailContent | null
  categoryId: string
  category?: { id: string; name: string }
  createdAt: string
  updatedAt: string
}

export interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export function useAdminProducts() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  })

  const fetchProducts = useCallback(async (page: number = 1, limit: number = 10) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/products?page=${page}&limit=${limit}&showAll=true`, {
        cache: 'no-store',
      })
      if (!res.ok) throw new Error('Error al cargar productos')
      const data = await res.json()
      setProducts(data.products || [])
      setPagination(data.pagination || { page, limit, total: 0, totalPages: 0 })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }, [])

  const createProduct = async (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt' | 'slug'>) => {
    setLoading(true)
    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Error al crear producto')
      }
      // Recargar primera página para mostrar el nuevo producto
      await fetchProducts(1, pagination.limit)
      return res.json()
    } finally {
      setLoading(false)
    }
  }

  const updateProduct = async (id: string, product: Partial<Product>) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(product),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Error al actualizar producto')
      }
      const updatedProduct = await res.json()
      setProducts(prev => prev.map(p => p.id === id ? updatedProduct : p))
      return updatedProduct
    } finally {
      setLoading(false)
    }
  }

  const deleteProduct = async (id: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/products/${id}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Error al eliminar producto')
      }
      // Si después de eliminar no hay elementos en la página actual, ir a la página anterior
      const newPage = products.length === 1 && pagination.page > 1 
        ? pagination.page - 1 
        : pagination.page
      await fetchProducts(newPage, pagination.limit)
    } finally {
      setLoading(false)
    }
  }

  const toggleAvailability = async (id: string, available: boolean) => {
    return updateProduct(id, { available })
  }

  return {
    products,
    loading,
    error,
    pagination,
    fetchProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    toggleAvailability,
  }
}
