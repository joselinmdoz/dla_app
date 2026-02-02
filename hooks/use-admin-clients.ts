import { useState, useCallback } from 'react'

export interface Client {
  id: string
  name: string
  email: string
  phone: string
  address?: string | null
  province?: string | null
  city?: string | null
  notes?: string | null
  createdAt: Date
  updatedAt: Date
}

export interface ClientsResponse {
  data: Client[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

export function useAdminClients() {
  const [clients, setClients] = useState<Client[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  })

  const fetchClients = useCallback(async (page = 1, search = '') => {
    setLoading(true)
    setError(null)
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: pagination.limit.toString(),
      })
      if (search) params.append('search', search)

      const response = await fetch(`/api/clients?${params}`)
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al obtener clientes')
      }

      const data: ClientsResponse = await response.json()
      setClients(data.data)
      setPagination(data.pagination)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al obtener clientes')
    } finally {
      setLoading(false)
    }
  }, [pagination.limit])

  const createClient = useCallback(async (client: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(client),
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al crear cliente')
      }

      const newClient = await response.json()
      setClients(prev => [newClient, ...prev])
      setPagination(prev => ({ ...prev, total: prev.total + 1 }))
      return newClient
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear cliente')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const updateClient = useCallback(async (id: string, client: Partial<Omit<Client, 'id' | 'createdAt' | 'updatedAt'>>) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/clients/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(client),
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al actualizar cliente')
      }

      const updatedClient = await response.json()
      setClients(prev => prev.map(c => c.id === id ? updatedClient : c))
      return updatedClient
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar cliente')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const deleteClient = useCallback(async (id: string) => {
    setLoading(true)
    setError(null)
    try {
      const response = await fetch(`/api/clients/${id}`, {
        method: 'DELETE',
      })
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Error al eliminar cliente')
      }

      setClients(prev => prev.filter(c => c.id !== id))
      setPagination(prev => ({ ...prev, total: prev.total - 1 }))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar cliente')
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    clients,
    loading,
    error,
    pagination,
    fetchClients,
    createClient,
    updateClient,
    deleteClient,
  }
}
