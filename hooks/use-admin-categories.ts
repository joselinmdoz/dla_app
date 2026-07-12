'use client'

import { useState, useCallback } from 'react'

export interface Category {
  id: string
  name: string
  slug: string
  description?: string | null
  icon?: string | null
  sortOrder: number
  _count?: { products: number }
  createdAt: string
  updatedAt: string
}

export interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export function useAdminCategories() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  })

  const fetchCategories = useCallback(async (page: number = 1, limit: number = 10) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/categories?page=${page}&limit=${limit}`)
      if (!res.ok) throw new Error('Error al cargar categorías')
      const data = await res.json()
      // La API devuelve { data: [...], pagination: {...} }
      setCategories(data.data || [])
      setPagination(data.pagination || { page, limit, total: 0, totalPages: 0 })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }, [])

  const createCategory = async (
    category: Omit<Category, 'id' | 'createdAt' | 'updatedAt' | 'slug'>
  ) => {
    setLoading(true)
    try {
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(category),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Error al crear categoría')
      }
      const newCategory = await res.json()
      // Recargar primera página para mostrar la nueva categoría
      await fetchCategories(1, pagination.limit)
      return newCategory
    } finally {
      setLoading(false)
    }
  }

  const updateCategory = async (id: string, category: Partial<Category>) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(category),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Error al actualizar categoría')
      }
      const updatedCategory = await res.json()
      setCategories(prev => prev.map(c => c.id === id ? updatedCategory : c))
      return updatedCategory
    } finally {
      setLoading(false)
    }
  }

  const deleteCategory = async (id: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/categories/${id}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Error al eliminar categoría')
      }
      // Si después de eliminar no hay elementos en la página actual, ir a la página anterior
      const newPage = categories.length === 1 && pagination.page > 1 
        ? pagination.page - 1 
        : pagination.page
      await fetchCategories(newPage, pagination.limit)
    } finally {
      setLoading(false)
    }
  }

  return {
    categories,
    loading,
    error,
    pagination,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  }
}
