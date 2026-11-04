import { NextRequest, NextResponse } from "next/server"
import { requireAdminPermissions } from "@/lib/admin-auth"
import { ADMIN_PERMISSIONS } from "@/lib/admin-permissions"
import { createMediaBackup, mediaBackupFilename, restoreMediaBackup } from "@/lib/system-backup"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const maxDuration = 120

export async function GET(request: NextRequest) {
  const auth = await requireAdminPermissions(request, ADMIN_PERMISSIONS.SYSTEM_BACKUP_MANAGE)
  if (!auth.authorized) return auth.response
  try {
    const archive = await createMediaBackup()
    return new NextResponse(new Uint8Array(archive), {
      headers: {
        "Content-Type": "application/gzip",
        "Content-Disposition": `attachment; filename="${mediaBackupFilename()}"`,
        "Cache-Control": "no-store",
      },
    })
  } catch (error) {
    console.error("Media backup export error:", error)
    return NextResponse.json({ error: "No se pudo exportar las imágenes" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdminPermissions(request, ADMIN_PERMISSIONS.SYSTEM_BACKUP_MANAGE)
  if (!auth.authorized) return auth.response
  try {
    const formData = await request.formData()
    const file = formData.get("file")
    if (!(file instanceof File)) return NextResponse.json({ error: "Selecciona el archivo de imágenes" }, { status: 400 })
    const result = await restoreMediaBackup(Buffer.from(await file.arrayBuffer()))
    return NextResponse.json({ success: true, ...result })
  } catch (error) {
    console.error("Media backup restore error:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "No se pudo restaurar las imágenes" }, { status: 400 })
  }
}
