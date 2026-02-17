import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import path from 'path'
import { readFile } from 'fs/promises'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const slide = await prisma.featureCard.findUnique({
      where: { id }
    })

    if (!slide || !slide.imageUrl) {
      return NextResponse.json(
        { error: 'Imagen no encontrada' },
        { status: 404 }
      )
    }

    // Get the image path
    const imagePath = slide.imageUrl.replace(/^\//, '')
    const fullPath = path.join(process.cwd(), 'public', imagePath)

    // Determine content type based on file extension
    const ext = path.extname(imagePath).toLowerCase()
    const contentTypes: Record<string, string> = {
      '.jpg': 'image/jpeg',
      '.jpeg': 'image/jpeg',
      '.png': 'image/png',
      '.gif': 'image/gif',
      '.webp': 'image/webp',
      '.svg': 'image/svg+xml'
    }
    
    const contentType = contentTypes[ext] || 'application/octet-stream'

    // Read and return the file
    const fileBuffer = await readFile(fullPath)
    
    return new NextResponse(fileBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (error) {
    console.error('Error serving feature card image:', error)
    return NextResponse.json(
      { error: 'Error al servir la imagen' },
      { status: 500 }
    )
  }
}
