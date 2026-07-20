import { NextRequest, NextResponse } from "next/server"
import path from "path"
import { readFile } from "fs/promises"
import { getLandingContentServer } from "@/lib/site-settings"
import { getLandingAssetPath, isExternalLandingAsset, type LandingAssetKey } from "@/lib/landing-content-server"

export const dynamic = "force-dynamic"
export const revalidate = 0

const allowedKeys: LandingAssetKey[] = [
  "logo",
  "support-image",
  "hero-fallback",
  "location-map",
  "seo-og",
  "seo-twitter",
  "seo-favicon",
  "seo-shortcut",
  "seo-apple",
]

function isLandingAssetKey(value: string): value is LandingAssetKey {
  return allowedKeys.includes(value as LandingAssetKey)
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
    ".ico": "image/x-icon",
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
  { params }: { params: Promise<{ assetKey: string }> }
) {
  try {
    const { assetKey } = await params

    if (!isLandingAssetKey(assetKey)) {
      return NextResponse.json({ error: "Asset no válido" }, { status: 404 })
    }

    const content = await getLandingContentServer()
    const resolvedAsset = getLandingAssetPath(content, assetKey)

    if (isExternalLandingAsset(resolvedAsset)) {
      return NextResponse.redirect(resolvedAsset)
    }

    const selected = await readLocalPublicFile(resolvedAsset).catch(() => null)
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
    console.error("Error serving landing asset:", error)
    return NextResponse.json({ error: "Error al servir la imagen" }, { status: 500 })
  }
}
