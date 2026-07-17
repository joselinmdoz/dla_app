import { readFile } from "fs/promises"
import path from "path"
import { NextRequest, NextResponse } from "next/server"

const contentTypes: Record<string, string> = {
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".xml": "application/xml; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".webmanifest": "application/manifest+json; charset=utf-8",
}

function isUnsafeSegment(segment: string) {
  return segment.length === 0 || segment === "." || segment === ".." || segment.includes("/") || segment.includes("\\")
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ assetPath: string[] }> }
) {
  try {
    const { assetPath } = await params

    if (!Array.isArray(assetPath) || assetPath.length === 0) {
      return NextResponse.json({ error: "Ruta de archivo inválida" }, { status: 400 })
    }

    const safeSegments = assetPath.map((segment) => decodeURIComponent(segment))

    if (safeSegments.some(isUnsafeSegment)) {
      return NextResponse.json({ error: "Ruta de archivo inválida" }, { status: 400 })
    }

    const publicRoot = path.join(process.cwd(), "public")
    const fullPath = path.join(publicRoot, ...safeSegments)
    const normalizedPublicRoot = path.normalize(`${publicRoot}${path.sep}`)
    const normalizedFullPath = path.normalize(fullPath)

    if (!normalizedFullPath.startsWith(normalizedPublicRoot)) {
      return NextResponse.json({ error: "Ruta de archivo inválida" }, { status: 400 })
    }

    const fileBuffer = await readFile(normalizedFullPath)
    const ext = path.extname(normalizedFullPath).toLowerCase()
    const contentType = contentTypes[ext] || "application/octet-stream"

    return new NextResponse(fileBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    })
  } catch (error) {
    console.error("Error serving public asset:", error)
    return NextResponse.json({ error: "Archivo no encontrado" }, { status: 404 })
  }
}
