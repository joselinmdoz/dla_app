import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { FeatureCard } from '@prisma/client'

// GET - Obtener todas las tarjetas activas ordenadas
export async function GET() {
  try {
    const cards = await prisma.featureCard.findMany({
      where: {
        isActive: true
      },
      orderBy: {
        sortOrder: 'asc'
      }
    })
    return NextResponse.json(cards)
  } catch (error) {
    console.error('Error fetching feature cards:', error)
    return NextResponse.json(
      { error: 'Error al obtener las tarjetas' },
      { status: 500 }
    )
  }
}

// POST - Crear nueva tarjeta
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { imageUrl, altText, title, description, linkUrl, sortOrder, isActive } = body

    const card = await prisma.featureCard.create({
      data: {
        imageUrl,
        altText,
        title: title || null,
        description: description || null,
        linkUrl: linkUrl || null,
        sortOrder: sortOrder || 0,
        isActive: isActive ?? true
      }
    })

    return NextResponse.json(card, { status: 201 })
  } catch (error) {
    console.error('Error creating feature card:', error)
    return NextResponse.json(
      { error: 'Error al crear la tarjeta' },
      { status: 500 }
    )
  }
}

// PUT - Actualizar todas las tarjetas (para reorder)
export async function PUT(request: NextRequest) {
  try {
    const cards: FeatureCard[] = await request.json()

    // Usar transaction para actualizar todas las tarjetas
    await prisma.$transaction(
      cards.map((card) =>
        prisma.featureCard.update({
          where: { id: card.id },
          data: {
            sortOrder: card.sortOrder,
            isActive: card.isActive,
            imageUrl: card.imageUrl,
            altText: card.altText,
            title: card.title,
            description: card.description,
            linkUrl: card.linkUrl
          }
        })
      )
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating feature cards:', error)
    return NextResponse.json(
      { error: 'Error al actualizar las tarjetas' },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar una tarjeta
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Se requiere el ID de la tarjeta' },
        { status: 400 }
      )
    }

    await prisma.featureCard.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting feature card:', error)
    return NextResponse.json(
      { error: 'Error al eliminar la tarjeta' },
      { status: 500 }
    )
  }
}
