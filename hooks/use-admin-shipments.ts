'use client'

import { useState, useCallback } from 'react'

export interface ShipmentClient {
  id: string
  name: string
  email: string
  phone: string
}

export interface Shipment {
  id: string
  hbl: string
  clientId: string
  client: ShipmentClient | null
  address: string
  province: string
  city: string | null
  type: string
  status: string
  price: string
  notes: string | null
  trackingUrl: string | null
  createdAt: string
  updatedAt: string
}

export interface Pagination {
  page: number
  limit: number
  total: number
  totalPages: number
}

export function useAdminShipments() {
  const [shipments, setShipments] = useState<Shipment[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  })

  const fetchShipments = useCallback(async (
    page: number = 1,
    limit: number = 10,
    status: string = 'all',
    search: string = '',
    clientId: string = 'all'
  ) => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      })
      if (status !== 'all') params.append('status', status)
      if (search) params.append('search', search)
      if (clientId !== 'all') params.append('clientId', clientId)

      const res = await fetch(`/api/shipments?${params}`)
      if (!res.ok) throw new Error('Error al cargar envíos')
      const data = await res.json()
      setShipments(data.data || [])
      setPagination(data.pagination || { page, limit, total: 0, totalPages: 0 })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido')
    } finally {
      setLoading(false)
    }
  }, [])

  const createShipment = async (shipment: Omit<Shipment, 'id' | 'createdAt' | 'updatedAt' | 'client'>) => {
    setLoading(true)
    try {
      const res = await fetch('/api/shipments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(shipment),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Error al crear envío')
      }
      const newShipment = await res.json()
      await fetchShipments(1, pagination.limit, 'all', '', 'all')
      return newShipment
    } finally {
      setLoading(false)
    }
  }

  const updateShipment = async (id: string, shipment: Partial<Omit<Shipment, 'id' | 'createdAt' | 'updatedAt' | 'client'>>) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/shipments/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(shipment),
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Error al actualizar envío')
      }
      const updatedShipment = await res.json()
      setShipments(prev => prev.map(s => s.id === id ? updatedShipment : s))
      return updatedShipment
    } finally {
      setLoading(false)
    }
  }

  const deleteShipment = async (id: string) => {
    setLoading(true)
    try {
      const res = await fetch(`/api/shipments/${id}`, {
        method: 'DELETE',
      })
      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error || 'Error al eliminar envío')
      }
      // Si después de eliminar no hay elementos en la página actual, ir a la página anterior
      const newPage = shipments.length === 1 && pagination.page > 1 
        ? pagination.page - 1 
        : pagination.page
      await fetchShipments(newPage, pagination.limit, 'all', '', 'all')
    } finally {
      setLoading(false)
    }
  }

  return {
    shipments,
    loading,
    error,
    pagination,
    fetchShipments,
    createShipment,
    updateShipment,
    deleteShipment,
  }
}
