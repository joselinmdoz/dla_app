import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const shipment = await prisma.shipment.findUnique({
      where: { id },
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
    
    if (!shipment) {
      return NextResponse.json(
        { error: 'Envío no encontrado' },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      ...shipment,
      price: shipment.price.toString(),
    })
  } catch (error) {
    console.error('Error fetching shipment:', error)
    return NextResponse.json(
      { error: 'Error al obtener envío' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    
    const {
      clientId,
      address,
      province,
      city,
      type,
      status,
      price,
      notes,
      trackingUrl,
      products,
    } = body

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

    // Calcular precio si viene de productos
    let finalPrice = price
    if (products && products.length > 0) {
      finalPrice = products.reduce((sum: number, sp: any) => sum + (sp.unitPrice * sp.quantity), 0)
    }

    // Actualizar productos: eliminar existentes y crear nuevos
    const updateData: any = {
      clientId,
      address,
      province,
      city,
      type,
      status: status?.toUpperCase(),
      price: finalPrice ? parseFloat(finalPrice.toString()) : undefined,
      notes,
      trackingUrl,
    }

    // Si hay productos, reemplazar completamente
    if (products) {
      await prisma.shipmentProduct.deleteMany({
        where: { shipmentId: id }
      })
      if (products.length > 0) {
        updateData.products = {
          create: products.map((sp: any) => ({
            productId: sp.productId,
            quantity: sp.quantity,
            unitPrice: sp.unitPrice,
          }))
        }
      }
    }

    const shipment = await prisma.shipment.update({
      where: { id },
      data: updateData,
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
    console.error('Error updating shipment:', error)
    return NextResponse.json(
      { error: 'Error al actualizar envío' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    await prisma.shipment.delete({
      where: { id },
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting shipment:', error)
    return NextResponse.json(
      { error: 'Error al eliminar envío' },
      { status: 500 }
    )
  }
}
