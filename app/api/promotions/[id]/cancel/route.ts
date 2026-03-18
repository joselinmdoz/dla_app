import { randomUUID } from "node:crypto"
import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { requireAdminPermissions } from "@/lib/admin-auth"
import { ADMIN_PERMISSIONS } from "@/lib/admin-permissions"
import {
  inferPromotionStatus,
  PROMOTION_AUDIT_ACTION,
  PROMOTION_STATUS,
} from "@/lib/promotions"
import { ensurePromotionTables, getRequestMeta, logPromotionAudit } from "@/lib/promotion-db"

type PromotionCodeRow = {
  id: string
  promotionName: string
  publicCode: string
  status: string
  expiresAt: Date | null
  cancelledByEmail: string | null
  cancelledAt: Date | null
  redeemedByEmail: string | null
  redeemedAt: Date | null
}

function mapCode(row: PromotionCodeRow) {
  return {
    id: row.id,
    promotionName: row.promotionName,
    publicCode: row.publicCode,
    status: inferPromotionStatus(row.status, row.expiresAt),
    cancelledByEmail: row.cancelledByEmail,
    cancelledAt: row.cancelledAt,
    redeemedByEmail: row.redeemedByEmail,
    redeemedAt: row.redeemedAt,
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdminPermissions(
      request,
      ADMIN_PERMISSIONS.PROMOTIONS_MANAGE
    )
    if (!auth.authorized) return auth.response

    await ensurePromotionTables()

    const { id } = await params

    const rows = await prisma.$queryRaw<PromotionCodeRow[]>`
      UPDATE "PromotionCode"
      SET
        "status" = ${PROMOTION_STATUS.CANCELLED},
        "cancelledByUserId" = ${auth.user.id},
        "cancelledByEmail" = ${auth.user.email},
        "cancelledAt" = NOW(),
        "updatedAt" = NOW()
      WHERE
        "id" = ${id}
        AND "status" = ${PROMOTION_STATUS.ACTIVE}
      RETURNING
        "id",
        "promotionName",
        "publicCode",
        "status",
        "expiresAt",
        "cancelledByEmail",
        "cancelledAt",
        "redeemedByEmail",
        "redeemedAt"
    `

    const updated = rows[0]

    if (!updated) {
      return NextResponse.json(
        { error: "No se pudo cancelar el código (estado inválido o no existe)" },
        { status: 409 }
      )
    }

    const { ip, userAgent } = getRequestMeta(request)
    await logPromotionAudit({
      id: randomUUID(),
      promotionCodeId: updated.id,
      action: PROMOTION_AUDIT_ACTION.CANCELLED,
      performedByUserId: auth.user.id,
      performedByEmail: auth.user.email,
      ip,
      userAgent,
      message: `Código cancelado manualmente (${updated.publicCode})`,
    })

    return NextResponse.json({ success: true, code: mapCode(updated) })
  } catch (error) {
    console.error("Error cancelling promotion code:", error)
    return NextResponse.json(
      { error: "Error al cancelar código" },
      { status: 500 }
    )
  }
}
