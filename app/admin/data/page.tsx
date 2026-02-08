'use client'

import { useState, useEffect } from 'react'
import { Plus, Upload, Download, Edit, Trash2, Search, FileSpreadsheet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/components/ui/use-toast'
import { EntityForm } from '@/components/admin/entity-form'
import Link from 'next/link'

type EntityType = 'PRODUCT' | 'CATEGORY' | 'CLIENT' | 'SHIPMENT'

interface Entity {
  id: string
  [key: string]: unknown
}

interface DataManagementPageProps {
  initialEntity?: EntityType
}

export default function DataManagementPage({ initialEntity = 'PRODUCT' }: DataManagementPageProps) {
  const { toast } = useToast()
  const [activeTab, setActiveTab] = useState<EntityType>(initialEntity)
  const [data, setData] = useState<Entity[]>([])
  const [loading, setLoading] = useState(false)
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingItem, setEditingItem] = useState<Entity | null>(null)
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([])
  const [clients, setClients] = useState<{ id: string; name: string; email: string }[]>([])

  const endpoints: Record<EntityType, string> = {
    PRODUCT: '/api/products',
    CATEGORY: '/api/categories',
    CLIENT: '/api/clients',
    SHIPMENT: '/api/shipments'
  }

  const columns: Record<EntityType, { key: string; label: string }[]> = {
    PRODUCT: [
      { key: 'name', label: 'Nombre' },
      { key: 'slug', label: 'Slug' },
      { key: 'price', label: 'Precio' },
      { key: 'category', label: 'Categoría' },
      { key: 'available', label: 'Disponible' }
    ],
    CATEGORY: [
      { key: 'name', label: 'Nombre' },
      { key: 'slug', label: 'Slug' },
      { key: 'sortOrder', label: 'Orden' }
    ],
    CLIENT: [
      { key: 'name', label: 'Nombre' },
      { key: 'email', label: 'Email' },
      { key: 'phone', label: 'Teléfono' },
      { key: 'province', label: 'Provincia' }
    ],
    SHIPMENT: [
      { key: 'hbl', label: 'HBL' },
      { key: 'client', label: 'Cliente' },
      { key: 'province', label: 'Provincia' },
      { key: 'type', label: 'Tipo' },
      { key: 'status', label: 'Estado' }
    ]
  }

  const fetchData = async () => {
    setLoading(true)
    try {
      const response = await fetch(endpoints[activeTab])
      if (!response.ok) throw new Error('Error al cargar datos')
      
      const result = await response.json()
      setData(result.data || [])
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudieron cargar los datos',
        variant: 'destructive'
      })
    } finally {
      setLoading(false)
    }
  }

  const fetchRelatedData = async () => {
    // Fetch categories for products
    if (activeTab === 'PRODUCT') {
      const response = await fetch('/api/categories')
      if (response.ok) {
        const result = await response.json()
        setCategories(result.data || [])
      }
    }
    // Fetch clients for shipments
    if (activeTab === 'SHIPMENT') {
      const response = await fetch('/api/clients')
      if (response.ok) {
        const result = await response.json()
        setClients(result.data || [])
      }
    }
  }

  useEffect(() => {
    fetchData()
    fetchRelatedData()
  }, [activeTab])

  const handleDelete = async (id: string) => {
    if (!confirm('¿Estás seguro de eliminar este registro?')) return

    try {
      const response = await fetch(`${endpoints[activeTab]}/${id}`, {
        method: 'DELETE'
      })

      if (!response.ok) throw new Error('Error al eliminar')

      toast({ title: 'Éxito', description: 'Registro eliminado correctamente' })
      fetchData()
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo eliminar el registro',
        variant: 'destructive'
      })
    }
  }

  const handleFormSuccess = () => {
    setShowForm(false)
    setEditingItem(null)
    fetchData()
  }

  const handleExport = async () => {
    try {
      const response = await fetch(`/api/export/${activeTab.toLowerCase()}s`)
      if (!response.ok) throw new Error('Error al exportar')

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${activeTab.toLowerCase()}s_${new Date().toISOString().split('T')[0]}.csv`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      toast({
        title: 'Error',
        description: 'No se pudo exportar el archivo',
        variant: 'destructive'
      })
    }
  }

  const renderCell = (item: Entity, column: { key: string; label: string }) => {
    const value = item[column.key]
    
    if (column.key === 'category' && typeof value === 'object' && value !== null) {
      return (value as { name?: string }).name || '-'
    }
    if (column.key === 'client' && typeof value === 'object' && value !== null) {
      return (value as { name?: string }).name || '-'
    }
    if (column.key === 'available') {
      return value ? 'Sí' : 'No'
    }
    if (typeof value === 'object' && value !== null) {
      return JSON.stringify(value)
    }
    return String(value || '-')
  }

  const filteredData = data.filter((item) => {
    if (!search) return true
    return Object.values(item)
      .filter((v) => typeof v === 'string')
      .some((v) => (v as string).toLowerCase().includes(search.toLowerCase()))
  })

  return (
    <div className="container mx-auto py-8 max-w-6xl">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold">Gestión de Datos</h1>
          <p className="text-gray-500">
            Administra productos, categorías, clientes y envíos
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/admin/import">
            <Button variant="outline">
              <FileSpreadsheet className="w-4 h-4 mr-2" />
              Importar / Exportar
            </Button>
          </Link>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as EntityType)}>
        <TabsList className="mb-4">
          <TabsTrigger value="PRODUCT">Productos</TabsTrigger>
          <TabsTrigger value="CATEGORY">Categorías</TabsTrigger>
          <TabsTrigger value="CLIENT">Clientes</TabsTrigger>
          <TabsTrigger value="SHIPMENT">Envíos</TabsTrigger>
        </TabsList>

        {['PRODUCT', 'CATEGORY', 'CLIENT', 'SHIPMENT'].map((tab) => (
          <TabsContent key={tab} value={tab}>
            <div className="bg-white rounded-lg border">
              {/* Toolbar */}
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center gap-2">
                  <Search className="w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Buscar..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-64"
                  />
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={handleExport}>
                    <Download className="w-4 h-4 mr-2" />
                    Exportar
                  </Button>
                  <Button onClick={() => { setEditingItem(null); setShowForm(true) }}>
                    <Plus className="w-4 h-4 mr-2" />
                    Agregar
                  </Button>
                </div>
              </div>

              {/* Table */}
              <Table>
                <TableHeader>
                  <TableRow>
                    {columns[tab as EntityType].map((col) => (
                      <TableHead key={col.key}>{col.label}</TableHead>
                    ))}
                    <TableHead className="w-32">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={columns[tab as EntityType].length + 1} className="text-center py-8">
                        Cargando...
                      </TableCell>
                    </TableRow>
                  ) : filteredData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={columns[tab as EntityType].length + 1} className="text-center py-8">
                        No hay datos
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredData.map((item) => (
                      <TableRow key={item.id}>
                        {columns[tab as EntityType].map((col) => (
                          <TableCell key={col.key}>
                            {renderCell(item, col)}
                          </TableCell>
                        ))}
                        <TableCell>
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => { setEditingItem(item); setShowForm(true) }}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleDelete(item.id)}
                            >
                              <Trash2 className="w-4 h-4 text-red-500" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {/* Form Dialog */}
      <Dialog open={showForm} onOpenChange={setShowForm}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingItem ? 'Editar' : 'Agregar'}{' '}
              {activeTab === 'PRODUCT'
                ? 'Producto'
                : activeTab === 'CATEGORY'
                ? 'Categoría'
                : activeTab === 'CLIENT'
                ? 'Cliente'
                : 'Envío'}
            </DialogTitle>
          </DialogHeader>
          <EntityForm
            entity={activeTab}
            initialData={editingItem || undefined}
            categories={categories}
            clients={clients}
            onSuccess={handleFormSuccess}
            onCancel={() => { setShowForm(false); setEditingItem(null) }}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
