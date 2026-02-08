import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { readFile } from 'fs/promises'
import path from 'path'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Obtener la slide de la base de datos
    const slide = await prisma.heroSlide.findUnique({
      where: { id }
    })

    if (!slide) {
      return NextResponse.json(
        { error: 'Slide no encontrada' },
        { status: 404 }
      )
    }

    // Si es una URL externa, redirigir
    if (slide.imageUrl.startsWith('http')) {
      return NextResponse.redirect(slide.imageUrl)
    }

    // Si es una ruta local (como /graphics/...)
    const imagePath = slide.imageUrl.replace(/^\//, '')
    const fullPath = path.join(process.cwd(), 'public', imagePath)

    // Determinar el tipo MIME
    const ext = path.extname(fullPath).toLowerCase()
    const contentType = {
      '.png': 'image/png',
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.gif': 'image/gif',
      '.svg': 'image/svg+xml',
      '.webp': 'image/webp',
    }[ext] || 'application/octet-stream'

    try {
      const imageBuffer = await readFile(fullPath)
      
      return new NextResponse(imageBuffer, {
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      })
    } catch {
      return NextResponse.json(
        { error: 'Imagen no encontrada' },
        { status: 404 }
      )
    }
  } catch (error) {
    console.error('Error serving slide image:', error)
    return NextResponse.json(
      { error: 'Error al servir la imagen' },
      { status: 500 }
    )
  }
}
