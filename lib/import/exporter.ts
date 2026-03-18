import { prisma } from '@/lib/prisma'
import { parseCSV, toCSV } from './parser'

export interface ExportOptions {
  entity: 'PRODUCT' | 'CATEGORY' | 'CLIENT' | 'SHIPMENT'
  format?: 'CSV' | 'JSON'
  columns?: string[]
  where?: Record<string, unknown>
  include?: Record<string, boolean>
}

/**
 * Obtiene datos de productos para exportación
 */
export async function exportProducts(options: {
  columns?: string[]
  where?: Record<string, unknown>
}): Promise<string> {
  const columns = options.columns || [
    'id',
    'name',
    'slug',
    'description',
    'price',
    'costPrice',
    'image',
    'categoryName',
    'spiceLevel',
    'available',
    'sortOrder'
  ]

  const products = await prisma.product.findMany({
    where: options.where as Record<string, unknown>,
    include: { category: true },
    orderBy: { sortOrder: 'asc' }
  })

  const data = products.map(p => ({
    id: p.id,
    name: p.name,
    slug: p.slug,
    description: p.description || '',
    price: Number(p.price),
    costPrice: p.costPrice ? Number(p.costPrice) : '',
    image: p.image || '',
    categoryName: p.category.name,
    spiceLevel: p.spiceLevel,
    available: p.available,
    sortOrder: p.sortOrder,
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString()
  }))

  return toCSV(data, columns.filter(c => c !== 'categoryName'))
}

/**
 * Obtiene datos de categorías para exportación
 */
export async function exportCategories(options: {
  columns?: string[]
  where?: Record<string, unknown>
}): Promise<string> {
  const columns = options.columns || [
    'id',
    'name',
    'slug',
    'description',
    'icon',
    'sortOrder',
    'createdAt'
  ]

  const categories = await prisma.category.findMany({
    where: options.where as Record<string, unknown>,
    orderBy: { sortOrder: 'asc' }
  })

  const data = categories.map(c => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    description: c.description || '',
    icon: c.icon || '',
    sortOrder: c.sortOrder,
    createdAt: c.createdAt.toISOString()
  }))

  return toCSV(data, columns)
}

/**
 * Obtiene datos de clientes para exportación
 */
export async function exportClients(options: {
  columns?: string[]
  where?: Record<string, unknown>
}): Promise<string> {
  const columns = options.columns || [
    'id',
    'name',
    'email',
    'phone',
    'address',
    'province',
    'city',
    'notes',
    'createdAt'
  ]

  const clients = await prisma.client.findMany({
    where: options.where as Record<string, unknown>,
    orderBy: { createdAt: 'desc' }
  })

  const data = clients.map(c => ({
    id: c.id,
    name: c.name,
    email: c.email,
    phone: c.phone,
    address: c.address || '',
    province: c.province || '',
    city: c.city || '',
    notes: c.notes || '',
    createdAt: c.createdAt.toISOString()
  }))

  return toCSV(data, columns)
}

/**
 * Obtiene datos de envíos para exportación
 */
export async function exportShipments(options: {
  columns?: string[]
  where?: Record<string, unknown>
  include?: { client?: boolean; products?: boolean }
}): Promise<string> {
  const columns = options.columns || [
    'id',
    'hbl',
    'clientName',
    'clientEmail',
    'address',
    'province',
    'city',
    'type',
    'status',
    'price',
    'notes',
    'createdAt'
  ]

  const shipments = await prisma.shipment.findMany({
    where: options.where as Record<string, unknown>,
    include: {
      client: true,
      products: {
        include: { product: true }
      }
    },
    orderBy: { createdAt: 'desc' }
  })

  const data = shipments.map(s => {
    const productNames = s.products
      .map(sp => `${sp.product.name}x${sp.quantity}`)
      .join('; ')

    return {
      id: s.id,
      hbl: s.hbl,
      clientName: s.client.name,
      clientEmail: s.client.email,
      address: s.address,
      province: s.province,
      city: s.city || '',
      type: s.type,
      status: s.status,
      price: Number(s.price),
      notes: s.notes || '',
      products: productNames,
      createdAt: s.createdAt.toISOString()
    }
  })

  return toCSV(data, columns)
}

/**
 * Función principal de exportación
 */
export async function exportData(options: ExportOptions): Promise<string> {
  switch (options.entity) {
    case 'PRODUCT':
      return exportProducts(options)
    case 'CATEGORY':
      return exportCategories(options)
    case 'CLIENT':
      return exportClients(options)
    case 'SHIPMENT':
      return exportShipments(options)
    default:
      throw new Error(`Entidad no soportada: ${options.entity}`)
  }
}

/**
 * Genera headers para descarga de archivo
 */
export function getDownloadHeaders(filename: string, format: 'CSV' | 'JSON' = 'CSV') {
  const mimeType = format === 'CSV' ? 'text/csv' : 'application/json'
  const extension = format === 'CSV' ? 'csv' : 'json'

  return {
    'Content-Type': mimeType,
    'Content-Disposition': `attachment; filename="${filename}.${extension}"`
  }
}
