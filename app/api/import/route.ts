import { NextRequest, NextResponse } from 'next/server'
import { parseCSV, detectDelimiter } from '@/lib/import/parser'
import {
  validateProducts,
  validateCategories,
  validateClients,
  validateShipments,
  ValidationError
} from '@/lib/import/validator'
import { transformProduct, transformCategory } from '@/lib/import/transformer'
import { prisma } from '@/lib/prisma'

type EntityType = 'PRODUCT' | 'CATEGORY' | 'CLIENT' | 'SHIPMENT'

type CSVRow = Record<string, string>

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const entity = formData.get('entity') as EntityType | null

    if (!file) {
      return NextResponse.json(
        { error: 'No se proporcionó ningún archivo' },
        { status: 400 }
      )
    }

    if (!entity) {
      return NextResponse.json(
        { error: 'No se especificó el tipo de entidad' },
        { status: 400 }
      )
    }

    const content = await file.text()
    const delimiter = detectDelimiter(content)
    
    const { rows, headers, meta } = parseCSV(content, { delimiter })

    if (rows.length === 0) {
      return NextResponse.json(
        { error: 'El archivo está vacío o no contiene datos válidos' },
        { status: 400 }
      )
    }

    let importResults: { success: number; errors: number; details: unknown[] } = {
      success: 0,
      errors: 0,
      details: []
    }

    switch (entity) {
      case 'PRODUCT':
        importResults = await importProducts(rows as CSVRow[])
        break
      case 'CATEGORY':
        importResults = await importCategories(rows as CSVRow[])
        break
      case 'CLIENT':
        importResults = await importClients(rows as CSVRow[])
        break
      case 'SHIPMENT':
        importResults = await importShipments(rows as CSVRow[])
        break
      default:
        return NextResponse.json(
          { error: `Tipo de entidad no válida: ${entity}` },
          { status: 400 }
        )
    }

    return NextResponse.json({
      success: true,
      entity,
      meta,
      headers,
      preview: rows.slice(0, 5),
      import: importResults,
      summary: {
        total: meta.rowCount,
        success: importResults.success,
        errors: importResults.errors,
        warnings: 0
      }
    })
  } catch (error) {
    console.error('Import error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Error desconocido durante la importación' },
      { status: 500 }
    )
  }
}

async function importProducts(
  products: CSVRow[]
): Promise<{ success: number; errors: number; details: unknown[] }> {
  const details: unknown[] = []
  let success = 0
  let errors = 0

  for (const product of products) {
    try {
      const data = {
        name: product.name || '',
        slug: product.slug || '',
        description: product.description || null,
        price: parseFloat(product.price) || 0,
        costPrice: product.costPrice ? parseFloat(product.costPrice) : null,
        image: product.image || null,
        categoryName: product.categoryName || '',
        spiceLevel: product.spiceLevel ? parseInt(product.spiceLevel) : 0,
        available: product.available === 'true',
        sortOrder: product.sortOrder ? parseInt(product.sortOrder) : 0
      }

      const validResult = validateProducts([data])
      
      if (validResult.errors.length > 0) {
        errors++
        details.push({ action: 'error', slug: data.slug, errors: validResult.errors })
        continue
      }

      const transformed = await transformProduct(data)
      
      await prisma.product.upsert({
        where: { slug: transformed.slug },
        create: transformed,
        update: transformed
      })

      success++
      details.push({ action: 'created', slug: transformed.slug })
    } catch (error) {
      errors++
      details.push({
        action: 'error',
        slug: product.slug,
        error: error instanceof Error ? error.message : 'Error desconocido'
      })
    }
  }

  return { success, errors, details }
}

async function importCategories(
  categories: CSVRow[]
): Promise<{ success: number; errors: number; details: unknown[] }> {
  const details: unknown[] = []
  let success = 0
  let errors = 0

  for (const category of categories) {
    try {
      const data = {
        name: category.name || '',
        slug: category.slug || '',
        description: category.description || null,
        icon: category.icon || null,
        sortOrder: category.sortOrder ? parseInt(category.sortOrder) : 0
      }

      const validResult = validateCategories([data])
      
      if (validResult.errors.length > 0) {
        errors++
        details.push({ action: 'error', slug: data.slug, errors: validResult.errors })
        continue
      }

      const transformed = transformCategory(data)
      
      await prisma.category.upsert({
        where: { slug: transformed.slug },
        create: transformed,
        update: transformed
      })

      success++
      details.push({ action: 'created', slug: transformed.slug })
    } catch (error) {
      errors++
      details.push({
        action: 'error',
        slug: category.slug,
        error: error instanceof Error ? error.message : 'Error desconocido'
      })
    }
  }

  return { success, errors, details }
}

async function importClients(
  clients: CSVRow[]
): Promise<{ success: number; errors: number; details: unknown[] }> {
  const details: unknown[] = []
  let success = 0
  let errors = 0

  for (const client of clients) {
    try {
      const data = {
        name: client.name || '',
        email: client.email || '',
        phone: client.phone || '',
        address: client.address || null,
        province: client.province || null,
        city: client.city || null,
        notes: client.notes || null
      }

      const validResult = validateClients([data])
      
      if (validResult.errors.length > 0) {
        errors++
        details.push({ action: 'error', email: data.email, errors: validResult.errors })
        continue
      }

      const email = data.email.toLowerCase()
      
      await prisma.client.upsert({
        where: { email },
        create: data,
        update: data
      })

      success++
      details.push({ action: 'created', email })
    } catch (error) {
      errors++
      details.push({
        action: 'error',
        email: client.email,
        error: error instanceof Error ? error.message : 'Error desconocido'
      })
    }
  }

  return { success, errors, details }
}

async function importShipments(
  shipments: CSVRow[]
): Promise<{ success: number; errors: number; details: unknown[] }> {
  const details: unknown[] = []
  let success = 0
  let errors = 0

  for (const shipment of shipments) {
    try {
      const data = {
        hbl: shipment.hbl || '',
        clientEmail: shipment.clientEmail || '',
        address: shipment.address || '',
        province: shipment.province || '',
        city: shipment.city || null,
        type: (shipment.type as 'MARITIMO' | 'AEREO' | 'TERRESTRE') || 'MARITIMO',
        status: (shipment.status as 'PENDING' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED') || 'PENDING',
        price: parseFloat(shipment.price) || 0,
        notes: shipment.notes || null
      }

      const validResult = validateShipments([data])
      
      if (validResult.errors.length > 0) {
        errors++
        details.push({ action: 'error', hbl: data.hbl, errors: validResult.errors })
        continue
      }

      const client = await prisma.client.findUnique({
        where: { email: data.clientEmail.toLowerCase() }
      })

      if (!client) {
        throw new Error(`Cliente no encontrado: ${data.clientEmail}`)
      }

      await prisma.shipment.upsert({
        where: { hbl: data.hbl.toUpperCase() },
        create: {
          ...data,
          clientId: client.id
        },
        update: data
      })

      success++
      details.push({ action: 'created', hbl: data.hbl })
    } catch (error) {
      errors++
      details.push({
        action: 'error',
        hbl: shipment.hbl,
        error: error instanceof Error ? error.message : 'Error desconocido'
      })
    }
  }

  return { success, errors, details }
}
