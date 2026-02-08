import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET - Obtener una slide por ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const slide = await prisma.heroSlide.findUnique({
      where: { id }
    })

    if (!slide) {
      return NextResponse.json(
        { error: 'Slide no encontrada' },
        { status: 404 }
      )
    }

    return NextResponse.json(slide)
  } catch (error) {
    console.error('Error fetching hero slide:', error)
    return NextResponse.json(
      { error: 'Error al obtener la slide' },
      { status: 500 }
    )
  }
}

// PUT - Actualizar una slide por ID
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { imageUrl, altText, title, linkUrl, sortOrder, isActive } = body

    const slide = await prisma.heroSlide.update({
      where: { id },
      data: {
        imageUrl,
        altText,
        title: title || null,
        linkUrl: linkUrl || null,
        sortOrder: sortOrder ?? 0,
        isActive: isActive ?? true
      }
    })

    return NextResponse.json(slide)
  } catch (error) {
    console.error('Error updating hero slide:', error)
    return NextResponse.json(
      { error: 'Error al actualizar la slide' },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar una slide por ID
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await prisma.heroSlide.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting hero slide:', error)
    return NextResponse.json(
      { error: 'Error al eliminar la slide' },
      { status: 500 }
    )
  }
}
