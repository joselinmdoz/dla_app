import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import path from "path"
import { readFile } from "fs/promises"

type OfficeImageRecord = {
  imageUrl: string | null
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

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    await prisma.$executeRawUnsafe(CREATE_TABLE_SQL)
    const [image] = await prisma.$queryRaw<OfficeImageRecord[]>`
      SELECT "imageUrl"
      FROM "OfficeImage"
      WHERE "id" = ${id}
      LIMIT 1
    `

    if (!image?.imageUrl) {
      return NextResponse.json(
        { error: "Imagen no encontrada" },
        { status: 404 }
      )
    }

    const imagePath = image.imageUrl.replace(/^\//, "")
    const fullPath = path.join(process.cwd(), "public", imagePath)

    const ext = path.extname(imagePath).toLowerCase()
    const contentTypes: Record<string, string> = {
      ".jpg": "image/jpeg",
      ".jpeg": "image/jpeg",
      ".png": "image/png",
      ".gif": "image/gif",
      ".webp": "image/webp",
      ".svg": "image/svg+xml",
    }

    const fileBuffer = await readFile(fullPath)

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentTypes[ext] || "application/octet-stream",
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    })
  } catch (error) {
    console.error("Error serving office image:", error)
    return NextResponse.json(
      { error: "Error al servir la imagen" },
      { status: 500 }
    )
  }
}
