import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: { select: { products: true } }
      }
    })
    
    if (!category) {
      return NextResponse.json(
        { error: 'Categoría no encontrada' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(category)
  } catch (error) {
    console.error('Error fetching category:', error)
    return NextResponse.json(
      { error: 'Error al obtener categoría' },
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
    
    const { name, sortOrder } = body

    const category = await prisma.category.update({
      where: { id },
      data: {
        ...(name && { 
          name,
          slug: name.toLowerCase().replace(/\s+/g, '-')
        }),
        ...(sortOrder !== undefined && { sortOrder }),
      },
      include: {
        _count: { select: { products: true } }
      }
    })

    return NextResponse.json(category)
  } catch (error) {
    console.error('Error updating category:', error)
    return NextResponse.json(
      { error: 'Error al actualizar categoría' },
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
    
    // Check if category has products
    const category = await prisma.category.findUnique({
      where: { id },
      include: {
        _count: { select: { products: true } }
      }
    })
    
    if (category && category._count.products > 0) {
      return NextResponse.json(
        { error: 'No se puede eliminar una categoría con productos asociados' },
        { status: 400 }
      )
    }
    
    await prisma.category.delete({
      where: { id }
    })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting category:', error)
    return NextResponse.json(
      { error: 'Error al eliminar categoría' },
      { status: 500 }
    )
  }
}
