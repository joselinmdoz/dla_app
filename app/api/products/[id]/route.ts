import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminPermissions } from '@/lib/admin-auth'
import { ADMIN_PERMISSIONS } from '@/lib/admin-permissions'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const product = await prisma.product.findUnique({
      where: { id },
      include: { category: true }
    })
    
    if (!product) {
      return NextResponse.json(
        { error: 'Producto no encontrado' },
        { status: 404 }
      )
    }
    
    const productWithStringPrice = {
      ...product,
      price: product.price.toString(),
      costPrice: product.costPrice ? product.costPrice.toString() : null
    }
    
    return NextResponse.json(productWithStringPrice)
  } catch (error) {
    console.error('Error fetching product:', error)
    return NextResponse.json(
      { error: 'Error al obtener producto' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdminPermissions(request, [
      ADMIN_PERMISSIONS.PRODUCTS_MANAGE,
      ADMIN_PERMISSIONS.DATA_MANAGE,
    ])
    if (!auth.authorized) return auth.response

    const { id } = await params
    const body = await request.json()
    
    const { 
      name, 
      description, 
      price, 
      costPrice,
      image, 
      spiceLevel, 
      available, 
      sortOrder, 
      categoryId,
      content
    } = body

    const product = await prisma.product.update({
      where: { id },
      data: {
        name: name ?? undefined,
        description: description === undefined ? undefined : description,
        price: price === undefined ? undefined : parseFloat(price.toString()),
        costPrice:
          costPrice === undefined
            ? undefined
            : costPrice !== null && costPrice !== ''
              ? parseFloat(costPrice.toString())
              : null,
        image: image === undefined ? undefined : image,
        spiceLevel: spiceLevel === undefined ? undefined : Number(spiceLevel),
        available: available === undefined ? undefined : available,
        sortOrder: sortOrder === undefined ? undefined : Number(sortOrder),
        categoryId: categoryId ?? undefined,
        content: content === undefined ? undefined : content,
      },
      include: { category: true },
    })

    return NextResponse.json({
      ...product,
      price: product.price.toString(),
      costPrice: product.costPrice ? product.costPrice.toString() : null
    })
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json(
      { error: 'Error al actualizar producto' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdminPermissions(request, [
      ADMIN_PERMISSIONS.PRODUCTS_MANAGE,
      ADMIN_PERMISSIONS.DATA_MANAGE,
    ])
    if (!auth.authorized) return auth.response

    const { id } = await params
    
    await prisma.product.delete({
      where: { id }
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json(
      { error: 'Error al eliminar producto' },
      { status: 500 }
    )
  }
}
