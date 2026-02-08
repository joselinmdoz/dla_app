import { Prisma, Category, Product, Client, Shipment } from '@prisma/client'
import { prisma } from '@/lib/prisma'

/**
 * Transforma datos de producto importados a formato Prisma
 */
export async function transformProduct(
  data: {
    name: string
    slug: string
    description?: string | null
    price: number
    costPrice?: number | null
    image?: string | null
    categoryName: string
    spiceLevel?: number | null
    available?: boolean | null
    sortOrder?: number | null
  }
): Promise<Prisma.ProductCreateInput> {
  // Buscar o crear categoría
  let category = await prisma.category.findUnique({
    where: { slug: data.categoryName.toLowerCase().replace(/\s+/g, '-') }
  })

  if (!category) {
    category = await prisma.category.create({
      data: {
        name: data.categoryName,
        slug: data.categoryName.toLowerCase().replace(/\s+/g, '-'),
        sortOrder: 0
      }
    })
  }

  return {
    name: data.name,
    slug: data.slug.toLowerCase().replace(/\s+/g, '-'),
    description: data.description || null,
    price: data.price,
    costPrice: data.costPrice || null,
    image: data.image || null,
    spiceLevel: data.spiceLevel || 0,
    available: data.available ?? true,
    sortOrder: data.sortOrder || 0,
    category: { connect: { id: category.id } }
  }
}

/**
 * Transforma datos de categoría importados a formato Prisma
 */
export function transformCategory(
  data: {
    name: string
    slug: string
    description?: string | null
    icon?: string | null
    sortOrder?: number | null
  }
): Prisma.CategoryCreateInput {
  return {
    name: data.name,
    slug: data.slug.toLowerCase().replace(/\s+/g, '-'),
    description: data.description || null,
    icon: data.icon || null,
    sortOrder: data.sortOrder || 0
  }
}

/**
 * Transforma datos de cliente importados a formato Prisma
 */
export async function transformClient(
  data: {
    name: string
    email: string
    phone: string
    address?: string | null
    province?: string | null
    city?: string | null
    notes?: string | null
  }
): Promise<Prisma.ClientCreateInput> {
  return {
    name: data.name,
    email: data.email.toLowerCase(),
    phone: data.phone,
    address: data.address || null,
    province: data.province || null,
    city: data.city || null,
    notes: data.notes || null
  }
}

/**
 * Transforma datos de envío importados a formato Prisma
 */
export async function transformShipment(
  data: {
    hbl: string
    clientEmail: string
    address: string
    province: string
    city?: string | null
    type?: 'MARITIMO' | 'AEREO' | 'TERRESTRE' | null
    status?: 'PENDING' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED' | null
    price?: number | null
    notes?: string | null
  }
): Promise<Prisma.ShipmentCreateInput> {
  // Buscar cliente por email
  const client = await prisma.client.findUnique({
    where: { email: data.clientEmail.toLowerCase() }
  })

  if (!client) {
    throw new Error(`Cliente no encontrado: ${data.clientEmail}`)
  }

  return {
    hbl: data.hbl.toUpperCase(),
    address: data.address,
    province: data.province,
    city: data.city || null,
    type: data.type || 'MARITIMO',
    status: data.status || 'PENDING',
    price: data.price || 0,
    notes: data.notes || null,
    client: { connect: { id: client.id } }
  }
}

/**
 * Genera un slug único para productos
 */
export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

/**
 * Normaliza texto para CSV
 */
export function normalizeText(text: string | null | undefined): string {
  if (!text) return ''
  return text.trim()
}

/**
 * Convierte fecha string a Date
 */
export function parseDate(dateStr: string): Date {
  const parts = dateStr.split('/')
  if (parts.length === 3) {
    // DD/MM/YY o DD/MM/YYYY
    const day = parseInt(parts[0], 10)
    const month = parseInt(parts[1], 10) - 1
    const year = parseInt(parts[2], 10) < 50 ? 2000 + parseInt(parts[2], 10) : 1900 + parseInt(parts[2], 10)
    return new Date(year, month, day)
  }
  return new Date()
}

/**
 * Convierte Date a string para CSV
 */
export function formatDate(date: Date): string {
  return date.toISOString().split('T')[0]
}
