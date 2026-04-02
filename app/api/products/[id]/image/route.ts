import { NextRequest, NextResponse } from "next/server"
import path from "path"
import { readFile } from "fs/promises"
import prisma from "@/lib/prisma"
import { PRODUCT_IMAGE_FALLBACK, resolveProductImage } from "@/lib/product-image"

export const dynamic = "force-dynamic"
export const revalidate = 0

function isExternalImage(value: string): boolean {
  return /^https?:\/\//i.test(value) || value.startsWith("data:") || value.startsWith("blob:")
}

function getContentType(filePath: string): string {
  const ext = path.extname(filePath).toLowerCase()
  const map: Record<string, string> = {
    ".png": "image/png",
    ".jpg": "image/jpeg",
    ".jpeg": "image/jpeg",
    ".gif": "image/gif",
    ".svg": "image/svg+xml",
    ".webp": "image/webp",
    ".avif": "image/avif",
  }
  return map[ext] || "application/octet-stream"
}

async function readLocalPublicFile(urlPath: string): Promise<{ body: Uint8Array; contentType: string }> {
  const imagePath = urlPath.replace(/^\/+/, "")
  const fullPath = path.join(process.cwd(), "public", imagePath)
  const buffer = await readFile(fullPath)
  return {
    body: new Uint8Array(buffer),
    contentType: getContentType(fullPath),
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const product = await prisma.product.findUnique({
      where: { id },
      select: { image: true },
    })

    if (!product) {
      return NextResponse.json({ error: "Producto no encontrado" }, { status: 404 })
    }

    const resolvedImage = resolveProductImage(product.image)

    if (isExternalImage(resolvedImage)) {
      return NextResponse.redirect(resolvedImage)
    }

    const primary = await readLocalPublicFile(resolvedImage).catch(() => null)
    const fallback = primary
      ? null
      : await readLocalPublicFile(PRODUCT_IMAGE_FALLBACK).catch(() => null)

    const selected = primary ?? fallback
    if (!selected) {
      return NextResponse.json({ error: "Imagen no encontrada" }, { status: 404 })
    }

    const responseBuffer = selected.body.buffer.slice(
      selected.body.byteOffset,
      selected.body.byteOffset + selected.body.byteLength
    ) as ArrayBuffer
    const responseBody = new Blob([responseBuffer], { type: selected.contentType })

    return new NextResponse(responseBody, {
      headers: {
        "Content-Type": selected.contentType,
        "Cache-Control": "no-store, no-cache, must-revalidate, max-age=0",
        Pragma: "no-cache",
        Expires: "0",
      },
    })
  } catch (error) {
    console.error("Error serving product image:", error)
    return NextResponse.json({ error: "Error al servir la imagen" }, { status: 500 })
  }
}
