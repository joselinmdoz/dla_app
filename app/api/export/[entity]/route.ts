import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { stringify } from 'csv-stringify'
import { requireAdminPermissions } from '@/lib/admin-auth'
import { ADMIN_PERMISSIONS } from '@/lib/admin-permissions'

type EntityType = 'products' | 'categories' | 'clients' | 'shipments'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ entity: string }> }
) {
  try {
    const auth = await requireAdminPermissions(request, [
      ADMIN_PERMISSIONS.IMPORT_EXPORT_MANAGE,
      ADMIN_PERMISSIONS.DATA_MANAGE,
    ])
    if (!auth.authorized) return auth.response

    const { entity: rawEntity } = await params
    const entity = rawEntity.toLowerCase() as EntityType

    if (!['products', 'categories', 'clients', 'shipments'].includes(entity)) {
      return NextResponse.json(
        { error: `Tipo de entidad no válida: ${rawEntity}` },
        { status: 400 }
      )
    }

    let csvContent = ''
    let filename = ''

    switch (entity) {
      case 'products':
        csvContent = await exportProducts()
        filename = 'productos'
        break
      case 'categories':
        csvContent = await exportCategories()
        filename = 'categorias'
        break
      case 'clients':
        csvContent = await exportClients()
        filename = 'clientes'
        break
      case 'shipments':
        csvContent = await exportShipments()
        filename = 'envios'
        break
    }

    const timestamp = new Date().toISOString().split('T')[0]
    
    return new NextResponse(csvContent, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}_${timestamp}.csv"`
      }
    })
  } catch (error) {
    console.error('Export error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error desconocido durante la exportación' },
      { status: 500 }
    )
  }
}

async function exportProducts(): Promise<string> {
  const products = await prisma.product.findMany({
    include: { category: true },
    orderBy: { sortOrder: 'asc' }
  })

  return new Promise((resolve, reject) => {
    const stringifier = stringify({
      header: true,
      columns: ['ID', 'Nombre', 'Slug', 'Descripción', 'Precio', 'Coste', 'Imagen', 'Categoría', 'Picante', 'Disponible', 'Orden']
    })

    const chunks: string[] = []
    stringifier.on('data', (chunk: string) => chunks.push(chunk))
    stringifier.on('error', reject)
    stringifier.on('finish', () => resolve(chunks.join('')))

    products.forEach(p => {
      stringifier.write([
        p.id,
        p.name,
        p.slug,
        p.description || '',
        Number(p.price).toFixed(2),
        p.costPrice ? Number(p.costPrice).toFixed(2) : '',
        p.image || '',
        p.category.name,
        p.spiceLevel.toString(),
        p.available ? 'Sí' : 'No',
        p.sortOrder.toString()
      ])
    })

    stringifier.end()
  })
}

async function exportCategories(): Promise<string> {
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: 'asc' }
  })

  return new Promise((resolve, reject) => {
    const stringifier = stringify({
      header: true,
      columns: ['ID', 'Nombre', 'Slug', 'Descripción', 'Icono', 'Orden']
    })

    const chunks: string[] = []
    stringifier.on('data', (chunk: string) => chunks.push(chunk))
    stringifier.on('error', reject)
    stringifier.on('finish', () => resolve(chunks.join('')))

    categories.forEach(c => {
      stringifier.write([
        c.id,
        c.name,
        c.slug,
        c.description || '',
        c.icon || '',
        c.sortOrder.toString()
      ])
    })

    stringifier.end()
  })
}

async function exportClients(): Promise<string> {
  const clients = await prisma.client.findMany({
    orderBy: { createdAt: 'desc' }
  })

  return new Promise((resolve, reject) => {
    const stringifier = stringify({
      header: true,
      columns: ['ID', 'Nombre', 'Email', 'Teléfono', 'Dirección', 'Provincia', 'Ciudad', 'Notas', 'Creado']
    })

    const chunks: string[] = []
    stringifier.on('data', (chunk: string) => chunks.push(chunk))
    stringifier.on('error', reject)
    stringifier.on('finish', () => resolve(chunks.join('')))

    clients.forEach(c => {
      stringifier.write([
        c.id,
        c.name,
        c.email,
        c.phone,
        c.address || '',
        c.province || '',
        c.city || '',
        c.notes || '',
        c.createdAt.toISOString()
      ])
    })

    stringifier.end()
  })
}

async function exportShipments(): Promise<string> {
  const shipments = await prisma.shipment.findMany({
    include: { client: true },
    orderBy: { createdAt: 'desc' }
  })

  return new Promise((resolve, reject) => {
    const stringifier = stringify({
      header: true,
      columns: ['ID', 'HBL', 'Cliente', 'Email', 'Dirección', 'Provincia', 'Ciudad', 'Tipo', 'Estado', 'Precio', 'Notas', 'Creado']
    })

    const chunks: string[] = []
    stringifier.on('data', (chunk: string) => chunks.push(chunk))
    stringifier.on('error', reject)
    stringifier.on('finish', () => resolve(chunks.join('')))

    shipments.forEach(s => {
      stringifier.write([
        s.id,
        s.hbl,
        s.client.name,
        s.client.email,
        s.address,
        s.province,
        s.city || '',
        s.type,
        s.status,
        Number(s.price).toFixed(2),
        s.notes || '',
        s.createdAt.toISOString()
      ])
    })

    stringifier.end()
  })
}
