import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

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

    // Si la imagen es una URL externa (como /graphics/...), redirigir
    if (slide.imageUrl.startsWith('http') || slide.imageUrl.startsWith('/')) {
      return NextResponse.redirect(new URL(slide.imageUrl, request.url))
    }

    // Si la imagen está almacenada como base64 o datos binarios
    return NextResponse.json({ imageUrl: slide.imageUrl })
  } catch (error) {
    console.error('Error fetching slide image:', error)
    return NextResponse.json(
      { error: 'Error al obtener la imagen' },
      { status: 500 }
    )
  }
}
