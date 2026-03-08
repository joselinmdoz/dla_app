import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import path from 'path'
import { readFile } from 'fs/promises'

type FeatureCardImage = {
  imageUrl: string | null
}

const CREATE_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS "FeatureCard" (
    "id" TEXT PRIMARY KEY,
    "imageUrl" TEXT NOT NULL,
    "altText" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "linkUrl" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await prisma.$executeRawUnsafe(CREATE_TABLE_SQL)
    const [card] = await prisma.$queryRaw<FeatureCardImage[]>`
      SELECT "imageUrl"
      FROM "FeatureCard"
      WHERE "id" = ${id}
      LIMIT 1
    `

    if (!card || !card.imageUrl) {
      return NextResponse.json(
        { error: 'Imagen no encontrada' },
        { status: 404 }
      )
    }

    // Get the image path
    const imagePath = card.imageUrl.replace(/^\//, '')
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
        'Cache-Control': 'no-store, no-cache, must-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
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
