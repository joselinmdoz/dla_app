'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { Loader2, Save, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { useToast } from '@/components/ui/use-toast'

// Schemas de validación
const productSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  slug: z.string().min(1, 'El slug es requerido'),
  description: z.string().optional(),
  price: z.coerce.number().positive('El precio debe ser mayor a 0'),
  costPrice: z.coerce.number().nonnegative().optional(),
  image: z.string().optional(),
  categoryId: z.string().min(1, 'La categoría es requerida'),
  spiceLevel: z.coerce.number().min(0).max(5).optional(),
  available: z.boolean().optional(),
  sortOrder: z.coerce.number().int().optional()
})

const categorySchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  slug: z.string().min(1, 'El slug es requerido'),
  description: z.string().optional(),
  icon: z.string().optional(),
  sortOrder: z.coerce.number().int().optional()
})

const clientSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  email: z.string().email('Email inválido'),
  phone: z.string().min(1, 'El teléfono es requerido'),
  address: z.string().optional(),
  province: z.string().optional(),
  city: z.string().optional(),
  notes: z.string().optional()
})

const shipmentSchema = z.object({
  hbl: z.string().min(1, 'El HBL es requerido'),
  clientId: z.string().min(1, 'El cliente es requerido'),
  address: z.string().min(1, 'La dirección es requerida'),
  province: z.string().min(1, 'La provincia es requerida'),
  city: z.string().optional(),
  type: z.enum(['MARITIMO', 'AEREO', 'TERRESTRE']).optional(),
  status: z.enum(['PENDING', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED']).optional(),
  price: z.coerce.number().nonnegative().optional(),
  notes: z.string().optional()
})

type ProductFormData = z.infer<typeof productSchema>
type CategoryFormData = z.infer<typeof categorySchema>
type ClientFormData = z.infer<typeof clientSchema>
type ShipmentFormData = z.infer<typeof shipmentSchema>

interface EntityFormProps {
  entity: 'PRODUCT' | 'CATEGORY' | 'CLIENT' | 'SHIPMENT'
  initialData?: Record<string, unknown>
  categories?: { id: string; name: string }[]
  clients?: { id: string; name: string; email: string }[]
  onSuccess: () => void
  onCancel: () => void
}

export function EntityForm({
  entity,
  initialData,
  categories = [],
  clients = [],
  onSuccess,
  onCancel
}: EntityFormProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const getSchema = () => {
    switch (entity) {
      case 'PRODUCT':
        return productSchema
      case 'CATEGORY':
        return categorySchema
      case 'CLIENT':
        return clientSchema
      case 'SHIPMENT':
        return shipmentSchema
    }
  }

  const getEndpoint = () => {
    switch (entity) {
      case 'PRODUCT':
        return '/api/products'
      case 'CATEGORY':
        return '/api/categories'
      case 'CLIENT':
        return '/api/clients'
      case 'SHIPMENT':
        return '/api/shipments'
    }
  }

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(getSchema()),
    defaultValues: initialData || {}
  })

  const onSubmit = async (data: Record<string, unknown>) => {
    setIsLoading(true)
    try {
      const method = initialData?.id ? 'PUT' : 'POST'
      const url = initialData?.id
        ? `${getEndpoint()}/${initialData.id}`
        : getEndpoint()

      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      })

      if (!response.ok) {
        throw new Error(await response.text())
      }

      toast({
        title: 'Éxito',
        description: `${entity === 'PRODUCT' ? 'Producto' : entity === 'CATEGORY' ? 'Categoría' : entity === 'CLIENT' ? 'Cliente' : 'Envío'} guardado correctamente`
      })

      onSuccess()
    } catch (error) {
      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Error desconocido',
        variant: 'destructive'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const renderFields = () => {
    switch (entity) {
      case 'PRODUCT':
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nombre *</Label>
                <Input id="name" {...register('name')} />
                {errors.name && <p className="text-red-500 text-sm">{String(errors.name.message)}</p>}
              </div>
              <div>
                <Label htmlFor="slug">Slug *</Label>
                <Input id="slug" {...register('slug')} />
                {errors.slug && <p className="text-red-500 text-sm">{String(errors.slug.message)}</p>}
              </div>
            </div>
            <div>
              <Label htmlFor="description">Descripción</Label>
              <Textarea id="description" {...register('description')} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">Precio *</Label>
                <Input id="price" type="number" step="0.01" {...register('price')} />
                {errors.price && <p className="text-red-500 text-sm">{String(errors.price.message)}</p>}
              </div>
              <div>
                <Label htmlFor="costPrice">Precio de coste</Label>
                <Input id="costPrice" type="number" step="0.01" {...register('costPrice')} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="categoryId">Categoría *</Label>
                <Select
                  value={watch('categoryId') as string}
                  onValueChange={(value) => setValue('categoryId', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar..." />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.categoryId && <p className="text-red-500 text-sm">{String(errors.categoryId.message)}</p>}
              </div>
              <div>
                <Label htmlFor="spiceLevel">Nivel de picante (0-5)</Label>
                <Input id="spiceLevel" type="number" min="0" max="5" {...register('spiceLevel')} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="image">Imagen (URL)</Label>
                <Input id="image" {...register('image')} />
              </div>
              <div>
                <Label htmlFor="sortOrder">Orden</Label>
                <Input id="sortOrder" type="number" {...register('sortOrder')} />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Switch
                id="available"
                checked={watch('available') as boolean}
                onCheckedChange={(checked) => setValue('available', checked)}
              />
              <Label htmlFor="available">Disponible</Label>
            </div>
          </>
        )

      case 'CATEGORY':
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nombre *</Label>
                <Input id="name" {...register('name')} />
                {errors.name && <p className="text-red-500 text-sm">{String(errors.name.message)}</p>}
              </div>
              <div>
                <Label htmlFor="slug">Slug *</Label>
                <Input id="slug" {...register('slug')} />
                {errors.slug && <p className="text-red-500 text-sm">{String(errors.slug.message)}</p>}
              </div>
            </div>
            <div>
              <Label htmlFor="description">Descripción</Label>
              <Textarea id="description" {...register('description')} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="icon">Icono</Label>
                <Input id="icon" {...register('icon')} />
              </div>
              <div>
                <Label htmlFor="sortOrder">Orden</Label>
                <Input id="sortOrder" type="number" {...register('sortOrder')} />
              </div>
            </div>
          </>
        )

      case 'CLIENT':
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Nombre *</Label>
                <Input id="name" {...register('name')} />
                {errors.name && <p className="text-red-500 text-sm">{String(errors.name.message)}</p>}
              </div>
              <div>
                <Label htmlFor="email">Email *</Label>
                <Input id="email" type="email" {...register('email')} />
                {errors.email && <p className="text-red-500 text-sm">{String(errors.email.message)}</p>}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">Teléfono *</Label>
                <Input id="phone" {...register('phone')} />
                {errors.phone && <p className="text-red-500 text-sm">{String(errors.phone.message)}</p>}
              </div>
              <div>
                <Label htmlFor="province">Provincia</Label>
                <Input id="province" {...register('province')} />
              </div>
            </div>
            <div>
              <Label htmlFor="address">Dirección</Label>
              <Input id="address" {...register('address')} />
            </div>
            <div>
              <Label htmlFor="city">Ciudad</Label>
              <Input id="city" {...register('city')} />
            </div>
            <div>
              <Label htmlFor="notes">Notas</Label>
              <Textarea id="notes" {...register('notes')} />
            </div>
          </>
        )

      case 'SHIPMENT':
        return (
          <>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="hbl">HBL *</Label>
                <Input id="hbl" {...register('hbl')} />
                {errors.hbl && <p className="text-red-500 text-sm">{String(errors.hbl.message)}</p>}
              </div>
              <div>
                <Label htmlFor="clientId">Cliente *</Label>
                <Select
                  value={watch('clientId') as string}
                  onValueChange={(value) => setValue('clientId', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar..." />
                  </SelectTrigger>
                  <SelectContent>
                    {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name} ({client.email})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.clientId && <p className="text-red-500 text-sm">{String(errors.clientId.message)}</p>}
              </div>
            </div>
            <div>
              <Label htmlFor="address">Dirección *</Label>
              <Input id="address" {...register('address')} />
              {errors.address && <p className="text-red-500 text-sm">{String(errors.address.message)}</p>}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="province">Provincia *</Label>
                <Input id="province" {...register('province')} />
                {errors.province && <p className="text-red-500 text-sm">{String(errors.province.message)}</p>}
              </div>
              <div>
                <Label htmlFor="city">Ciudad</Label>
                <Input id="city" {...register('city')} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="type">Tipo</Label>
                <Select
                  value={watch('type') as string}
                  onValueChange={(value) => setValue('type', value as 'MARITIMO' | 'AEREO' | 'TERRESTRE')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MARITIMO">Marítimo</SelectItem>
                    <SelectItem value="AEREO">Aéreo</SelectItem>
                    <SelectItem value="TERRESTRE">Terrestre</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="status">Estado</Label>
                <Select
                  value={watch('status') as string}
                  onValueChange={(value) => setValue('status', value as 'PENDING' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED')}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="PENDING">Pendiente</SelectItem>
                    <SelectItem value="IN_TRANSIT">En tránsito</SelectItem>
                    <SelectItem value="DELIVERED">Entregado</SelectItem>
                    <SelectItem value="CANCELLED">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label htmlFor="price">Precio</Label>
              <Input id="price" type="number" step="0.01" {...register('price')} />
            </div>
            <div>
              <Label htmlFor="notes">Notas</Label>
              <Textarea id="notes" {...register('notes')} />
            </div>
          </>
        )
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {renderFields()}

      <div className="flex justify-end gap-2 pt-4">
        <Button type="button" variant="outline" onClick={onCancel}>
          <X className="w-4 h-4 mr-2" />
          Cancelar
        </Button>
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          Guardar
        </Button>
      </div>
    </form>
  )
}
