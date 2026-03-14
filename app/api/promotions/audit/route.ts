import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { requireAdminPermissions } from "@/lib/admin-auth"
import { ADMIN_PERMISSIONS } from "@/lib/admin-permissions"
import { ensurePromotionTables } from "@/lib/promotion-db"

type PromotionAuditRow = {
  id: string
  promotionCodeId: string | null
  action: string
  performedByUserId: string | null
  performedByEmail: string | null
  ip: string | null
  userAgent: string | null
  message: string | null
  createdAt: Date
}

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdminPermissions(request, [
      ADMIN_PERMISSIONS.PROMOTIONS_AUDIT,
      ADMIN_PERMISSIONS.PROMOTIONS_MANAGE,
    ])
    if (!auth.authorized) return auth.response

    await ensurePromotionTables()

    const { searchParams } = new URL(request.url)
    const limit = Math.max(1, Math.min(200, Number(searchParams.get("limit") || 100)))

    const rows = await prisma.$queryRaw<PromotionAuditRow[]>`
      SELECT
        "id",
        "promotionCodeId",
        "action",
        "performedByUserId",
        "performedByEmail",
        "ip",
        "userAgent",
        "message",
        "createdAt"
      FROM "PromotionCodeAudit"
      ORDER BY "createdAt" DESC
      LIMIT ${limit}
    `

    return NextResponse.json({ data: rows })
  } catch (error) {
    console.error("Error fetching promotions audit:", error)
    return NextResponse.json(
      { error: "Error al obtener auditoría de promociones" },
      { status: 500 }
    )
  }
}
