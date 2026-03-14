import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { randomUUID } from "node:crypto"
import { requireAdminPermissions } from "@/lib/admin-auth"
import { ADMIN_PERMISSIONS } from "@/lib/admin-permissions"

type OfficeImageRow = {
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
  CREATE TABLE IF NOT EXISTS "OfficeImage" (
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

async function ensureOfficeImagesTable() {
  await prisma.$executeRawUnsafe(CREATE_TABLE_SQL)
}

export async function GET(request: NextRequest) {
  try {
    await ensureOfficeImagesTable()
    const includeInactive = request.nextUrl.searchParams.get("includeInactive") === "true"
    let canListInactive = false
    if (includeInactive) {
      const auth = await requireAdminPermissions(
        request,
        ADMIN_PERMISSIONS.OFFICE_IMAGES_MANAGE
      )
      canListInactive = auth.authorized
    }
    const images = canListInactive
      ? await prisma.$queryRaw<OfficeImageRow[]>`
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
          FROM "OfficeImage"
          ORDER BY "sortOrder" ASC
        `
      : await prisma.$queryRaw<OfficeImageRow[]>`
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
          FROM "OfficeImage"
          WHERE "isActive" = true
          ORDER BY "sortOrder" ASC
        `

    return NextResponse.json(images)
  } catch (error) {
    console.error("Error fetching office images:", error)
    return NextResponse.json(
      { error: "Error al obtener las imágenes de oficinas" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdminPermissions(
      request,
      ADMIN_PERMISSIONS.OFFICE_IMAGES_MANAGE
    )
    if (!auth.authorized) return auth.response

    const body = await request.json()
    const { imageUrl, altText, title, description, linkUrl, sortOrder, isActive } = body

    if (!imageUrl || !altText) {
      return NextResponse.json(
        { error: "La imagen y el texto alternativo son requeridos" },
        { status: 400 }
      )
    }

    await ensureOfficeImagesTable()

    const id = randomUUID()
    await prisma.$executeRaw`
      INSERT INTO "OfficeImage" (
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

    const [image] = await prisma.$queryRaw<OfficeImageRow[]>`
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
      FROM "OfficeImage"
      WHERE "id" = ${id}
      LIMIT 1
    `

    return NextResponse.json(image, { status: 201 })
  } catch (error) {
    console.error("Error creating office image:", error)
    return NextResponse.json(
      { error: "Error al crear la imagen de oficina" },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const auth = await requireAdminPermissions(
      request,
      ADMIN_PERMISSIONS.OFFICE_IMAGES_MANAGE
    )
    if (!auth.authorized) return auth.response

    const imagesBody = await request.json()

    if (!Array.isArray(imagesBody)) {
      return NextResponse.json(
        { error: "Formato inválido para actualización de imágenes" },
        { status: 400 }
      )
    }

    const images = imagesBody as Array<Partial<OfficeImageRow>>
    await ensureOfficeImagesTable()

    await prisma.$transaction(
      images.map((image) =>
        prisma.$executeRaw`
          UPDATE "OfficeImage"
          SET
            "sortOrder" = ${Number(image.sortOrder) || 0},
            "isActive" = ${image.isActive ?? true},
            "imageUrl" = ${String(image.imageUrl ?? "")},
            "altText" = ${String(image.altText ?? "")},
            "title" = ${image.title ? String(image.title) : null},
            "description" = ${image.description ? String(image.description) : null},
            "linkUrl" = ${image.linkUrl ? String(image.linkUrl) : null},
            "updatedAt" = NOW()
          WHERE "id" = ${String(image.id ?? "")}
        `
      )
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating office images:", error)
    return NextResponse.json(
      { error: "Error al actualizar las imágenes de oficinas" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const auth = await requireAdminPermissions(
      request,
      ADMIN_PERMISSIONS.OFFICE_IMAGES_MANAGE
    )
    if (!auth.authorized) return auth.response

    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json(
        { error: "Se requiere el ID de la imagen" },
        { status: 400 }
      )
    }

    await ensureOfficeImagesTable()

    await prisma.$executeRaw`
      DELETE FROM "OfficeImage"
      WHERE "id" = ${id}
    `

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting office image:", error)
    return NextResponse.json(
      { error: "Error al eliminar la imagen de oficina" },
      { status: 500 }
    )
  }
}
