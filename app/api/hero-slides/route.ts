import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { HeroSlide } from '@prisma/client'
import { requireAdminPermissions } from '@/lib/admin-auth'
import { ADMIN_PERMISSIONS } from '@/lib/admin-permissions'

// GET - Obtener todas las slides activas ordenadas
export async function GET() {
  try {
    const slides = await prisma.heroSlide.findMany({
      where: {
        isActive: true
      },
      orderBy: {
        sortOrder: 'asc'
      }
    })
    return NextResponse.json(slides)
  } catch (error) {
    console.error('Error fetching hero slides:', error)
    return NextResponse.json(
      { error: 'Error al obtener las slides' },
      { status: 500 }
    )
  }
}

// POST - Crear nueva slide
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdminPermissions(
      request,
      ADMIN_PERMISSIONS.HERO_SLIDES_MANAGE
    )
    if (!auth.authorized) return auth.response

    const body = await request.json()
    const { imageUrl, altText, title, linkUrl, sortOrder, isActive } = body

    const slide = await prisma.heroSlide.create({
      data: {
        imageUrl,
        altText,
        title: title || null,
        linkUrl: linkUrl || null,
        sortOrder: sortOrder || 0,
        isActive: isActive ?? true
      }
    })

    return NextResponse.json(slide, { status: 201 })
  } catch (error) {
    console.error('Error creating hero slide:', error)
    return NextResponse.json(
      { error: 'Error al crear la slide' },
      { status: 500 }
    )
  }
}

// PUT - Actualizar todas las slides (para reorder)
export async function PUT(request: NextRequest) {
  try {
    const auth = await requireAdminPermissions(
      request,
      ADMIN_PERMISSIONS.HERO_SLIDES_MANAGE
    )
    if (!auth.authorized) return auth.response

    const slides: HeroSlide[] = await request.json()

    // Usar transaction para actualizar todas las slides
    await prisma.$transaction(
      slides.map((slide) =>
        prisma.heroSlide.update({
          where: { id: slide.id },
          data: {
            sortOrder: slide.sortOrder,
            isActive: slide.isActive,
            imageUrl: slide.imageUrl,
            altText: slide.altText,
            title: slide.title,
            linkUrl: slide.linkUrl
          }
        })
      )
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating hero slides:', error)
    return NextResponse.json(
      { error: 'Error al actualizar las slides' },
      { status: 500 }
    )
  }
}

// DELETE - Eliminar una slide
export async function DELETE(request: NextRequest) {
  try {
    const auth = await requireAdminPermissions(
      request,
      ADMIN_PERMISSIONS.HERO_SLIDES_MANAGE
    )
    if (!auth.authorized) return auth.response

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Se requiere el ID de la slide' },
        { status: 400 }
      )
    }

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
