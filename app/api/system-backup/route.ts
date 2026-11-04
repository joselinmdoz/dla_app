import { NextRequest, NextResponse } from "next/server"
import { requireAdminPermissions } from "@/lib/admin-auth"
import { ADMIN_PERMISSIONS } from "@/lib/admin-permissions"
import { backupFilename, createSystemBackup, parseSystemBackup, restoreSystemBackup } from "@/lib/system-backup"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"
export const maxDuration = 60

export async function GET(request: NextRequest) {
  const auth = await requireAdminPermissions(request, ADMIN_PERMISSIONS.SYSTEM_BACKUP_MANAGE)
  if (!auth.authorized) return auth.response

  try {
    const backup = await createSystemBackup()
    return new NextResponse(JSON.stringify(backup), {
      headers: {
        "Content-Type": "application/json; charset=utf-8",
        "Content-Disposition": `attachment; filename="${backupFilename()}"`,
        "Cache-Control": "no-store",
      },
    })
  } catch (error) {
    console.error("System backup export error:", error)
    return NextResponse.json({ error: "No se pudo crear la salva" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  const auth = await requireAdminPermissions(request, ADMIN_PERMISSIONS.SYSTEM_BACKUP_MANAGE)
  if (!auth.authorized) return auth.response

  try {
    const formData = await request.formData()
    const file = formData.get("file")
    const confirmation = formData.get("confirmation")
    if (!(file instanceof File)) return NextResponse.json({ error: "Selecciona un paquete de salva" }, { status: 400 })
    if (confirmation !== "RESTAURAR") return NextResponse.json({ error: "Escribe RESTAURAR para confirmar" }, { status: 400 })

    const backup = parseSystemBackup(await file.text())
    const result = await restoreSystemBackup(backup)
    return NextResponse.json({ success: true, ...result })
  } catch (error) {
    console.error("System backup restore error:", error)
    return NextResponse.json({ error: error instanceof Error ? error.message : "No se pudo restaurar la salva" }, { status: 400 })
  }
}
