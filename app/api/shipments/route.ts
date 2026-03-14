import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminPermissions } from '@/lib/admin-auth'
import { ADMIN_PERMISSIONS } from '@/lib/admin-permissions'

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdminPermissions(request, [
      ADMIN_PERMISSIONS.SHIPMENTS_MANAGE,
      ADMIN_PERMISSIONS.DATA_MANAGE,
    ])
    if (!auth.authorized) return auth.response

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const clientId = searchParams.get('clientId')
    const skip = (page - 1) * limit

    const where: any = {}

    if (status && status !== 'all') {
      where.status = status.toUpperCase()
    }

    if (clientId && clientId !== 'all') {
      where.clientId = clientId
    }

    if (search) {
      where.OR = [
        { hbl: { contains: search, mode: 'insensitive' } },
        { client: { name: { contains: search, mode: 'insensitive' } } },
      ]
    }

    const [shipments, total] = await Promise.all([
      prisma.shipment.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          client: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true,
            }
          },
          products: {
            include: {
              product: {
                select: {
                  id: true,
                  name: true,
                }
              }
            }
          }
        },
      }),
      prisma.shipment.count({ where }),
    ])

    // Convertir Decimal a string para JSON
    const shipmentsWithStringPrice = shipments.map(shipment => ({
      ...shipment,
      price: shipment.price.toString(),
    }))

    return NextResponse.json({
      data: shipmentsWithStringPrice,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching shipments:', error)
    return NextResponse.json(
      { error: 'Error al obtener envíos' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdminPermissions(request, [
      ADMIN_PERMISSIONS.SHIPMENTS_MANAGE,
      ADMIN_PERMISSIONS.DATA_MANAGE,
    ])
    if (!auth.authorized) return auth.response

    const body = await request.json()
    const {
      hbl,
      clientId,
      address,
      province,
      city,
      type,
      price,
      notes,
      trackingUrl,
      products,
    } = body

    if (!hbl || !address || !province) {
      return NextResponse.json(
        { error: 'HBL, dirección y provincia son requeridos' },
        { status: 400 }
      )
    }

    // Verificar cliente si se proporciona
    if (clientId) {
      const clientExists = await prisma.client.findUnique({ where: { id: clientId } })
      if (!clientExists) {
        return NextResponse.json(
          { error: 'Cliente no encontrado' },
          { status: 400 }
        )
      }
    }

    // Generar HBL único si ya existe
    let finalHbl = hbl
    const existingWithHbl = await prisma.shipment.findUnique({ where: { hbl: finalHbl } })
    if (existingWithHbl) {
      finalHbl = `${hbl}-${Date.now()}`
    }

    // Calcular precio total si viene de productos
    let finalPrice = price
    if (products && products.length > 0) {
      finalPrice = products.reduce((sum: number, sp: any) => sum + (sp.unitPrice * sp.quantity), 0)
    }

    const shipment = await prisma.shipment.create({
      data: {
        hbl: finalHbl,
        clientId: clientId || null,
        address,
        province,
        city,
        type: type || 'MARITIMO',
        price: parseFloat(finalPrice.toString()),
        notes,
        trackingUrl,
        products: products && products.length > 0 ? {
          create: products.map((sp: any) => ({
            productId: sp.productId,
            quantity: sp.quantity,
            unitPrice: sp.unitPrice,
          }))
        } : undefined,
      },
      include: {
        client: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
          }
        },
        products: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
              }
            }
          }
        }
      },
    })

    return NextResponse.json({
      ...shipment,
      price: shipment.price.toString(),
    })
  } catch (error) {
    console.error('Error creating shipment:', error)
    return NextResponse.json(
      { error: 'Error al crear envío' },
      { status: 500 }
    )
  }
}
