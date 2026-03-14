import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { randomUUID } from 'node:crypto'
import { requireAdminPermissions } from '@/lib/admin-auth'
import { ADMIN_PERMISSIONS } from '@/lib/admin-permissions'

type FeatureCardRow = {
  id: string
  imageUrl: string
  altText: string
  title: string | null
  description: string | null
  linkUrl: string | null
  sortOrder: number
  isActive: boolean
  createdAt: Date
  updatedAt: Date
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

async function ensureFeatureCardsTable() {
  await prisma.$executeRawUnsafe(CREATE_TABLE_SQL)
}

// GET - Obtener todas las tarjetas activas ordenadas
export async function GET() {
  try {
    await ensureFeatureCardsTable()
    const cards = await prisma.$queryRaw<FeatureCardRow[]>`
      SELECT
        "id",
        "imageUrl",
        "altText",
        "title",
        "description",
        "linkUrl",
        "sortOrder",
        "isActive",
        "createdAt",
        "updatedAt"
      FROM "FeatureCard"
      WHERE "isActive" = true
      ORDER BY "sortOrder" ASC
    `

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
    const auth = await requireAdminPermissions(
      request,
      ADMIN_PERMISSIONS.FEATURE_CARDS_MANAGE
    )
    if (!auth.authorized) return auth.response

    const body = await request.json()
    const { imageUrl, altText, title, description, linkUrl, sortOrder, isActive } = body

    if (!imageUrl || !altText) {
      return NextResponse.json(
        { error: 'La imagen y el texto alternativo son requeridos' },
        { status: 400 }
      )
    }

    await ensureFeatureCardsTable()

    const id = randomUUID()
    await prisma.$executeRaw`
      INSERT INTO "FeatureCard" (
        "id",
        "imageUrl",
        "altText",
        "title",
        "description",
        "linkUrl",
        "sortOrder",
        "isActive",
        "createdAt",
        "updatedAt"
      )
      VALUES (
        ${id},
        ${String(imageUrl)},
        ${String(altText)},
        ${title ? String(title) : null},
        ${description ? String(description) : null},
        ${linkUrl ? String(linkUrl) : null},
        ${Number(sortOrder) || 0},
        ${isActive ?? true},
        NOW(),
        NOW()
      )
    `

    const [card] = await prisma.$queryRaw<FeatureCardRow[]>`
      SELECT
        "id",
        "imageUrl",
        "altText",
        "title",
        "description",
        "linkUrl",
        "sortOrder",
        "isActive",
        "createdAt",
        "updatedAt"
      FROM "FeatureCard"
      WHERE "id" = ${id}
      LIMIT 1
    `

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
    const auth = await requireAdminPermissions(
      request,
      ADMIN_PERMISSIONS.FEATURE_CARDS_MANAGE
    )
    if (!auth.authorized) return auth.response

    const cardsBody = await request.json()

    if (!Array.isArray(cardsBody)) {
      return NextResponse.json(
        { error: 'Formato inválido para actualización de tarjetas' },
        { status: 400 }
      )
    }

    const cards = cardsBody as Array<Partial<FeatureCardRow>>
    await ensureFeatureCardsTable()

    // Usar transaction para actualizar todas las tarjetas
    await prisma.$transaction(
      cards.map((card) =>
        prisma.$executeRaw`
          UPDATE "FeatureCard"
          SET
            "sortOrder" = ${Number(card.sortOrder) || 0},
            "isActive" = ${card.isActive ?? true},
            "imageUrl" = ${String(card.imageUrl ?? '')},
            "altText" = ${String(card.altText ?? '')},
            "title" = ${card.title ? String(card.title) : null},
            "description" = ${card.description ? String(card.description) : null},
            "linkUrl" = ${card.linkUrl ? String(card.linkUrl) : null},
            "updatedAt" = NOW()
          WHERE "id" = ${String(card.id ?? '')}
        `
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
    const auth = await requireAdminPermissions(
      request,
      ADMIN_PERMISSIONS.FEATURE_CARDS_MANAGE
    )
    if (!auth.authorized) return auth.response

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Se requiere el ID de la tarjeta' },
        { status: 400 }
      )
    }

    await ensureFeatureCardsTable()

    await prisma.$executeRaw`
      DELETE FROM "FeatureCard"
      WHERE "id" = ${id}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting feature card:', error)
    return NextResponse.json(
      { error: 'Error al eliminar la tarjeta' },
      { status: 500 }
    )
  }
}
