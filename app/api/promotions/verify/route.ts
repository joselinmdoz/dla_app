import { randomUUID } from "node:crypto"
import { NextRequest, NextResponse } from "next/server"
import { requireAdminPermissions } from "@/lib/admin-auth"
import { ADMIN_PERMISSIONS } from "@/lib/admin-permissions"
import { findPromotionByInput } from "@/lib/promotion-lookup"
import {
  inferPromotionStatus,
  PROMOTION_AUDIT_ACTION,
  PROMOTION_STATUS,
} from "@/lib/promotions"
import { getRequestMeta, logPromotionAudit } from "@/lib/promotion-db"
import { consumeRateLimit } from "@/lib/rate-limit"

function mapCodeForResponse(row: {
  id: string
  promotionName: string
  publicCode: string
  status: string
  issuedTo: string | null
  notes: string | null
  expiresAt: Date | null
  issuedByEmail: string | null
  redeemedByEmail: string | null
  redeemedAt: Date | null
  cancelledByEmail: string | null
  cancelledAt: Date | null
  createdAt: Date
}) {
  return {
    id: row.id,
    promotionName: row.promotionName,
    publicCode: row.publicCode,
    status: inferPromotionStatus(row.status, row.expiresAt),
    issuedTo: row.issuedTo,
    notes: row.notes,
    expiresAt: row.expiresAt,
    issuedByEmail: row.issuedByEmail,
    redeemedByEmail: row.redeemedByEmail,
    redeemedAt: row.redeemedAt,
    cancelledByEmail: row.cancelledByEmail,
    cancelledAt: row.cancelledAt,
    createdAt: row.createdAt,
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdminPermissions(request, [
      ADMIN_PERMISSIONS.PROMOTIONS_REDEEM,
      ADMIN_PERMISSIONS.PROMOTIONS_MANAGE,
      ADMIN_PERMISSIONS.PROMOTIONS_AUDIT,
    ])
    if (!auth.authorized) return auth.response

    const body = await request.json()
    const value = String(body.value || "").trim()

    if (!value) {
      return NextResponse.json(
        { error: "Debes proporcionar un código o token" },
        { status: 400 }
      )
    }

    const { row, parsed } = await findPromotionByInput(value)
    const { ip, userAgent } = getRequestMeta(request)
    const rate = consumeRateLimit({
      key: `promo:verify:${auth.user.id}:${ip || "no-ip"}`,
      limit: 40,
      windowMs: 60_000,
    })

    if (!rate.allowed) {
      return NextResponse.json(
        { error: "Demasiados intentos. Espera unos segundos." },
        { status: 429 }
      )
    }

    if (!row) {
      await logPromotionAudit({
        id: randomUUID(),
        action: PROMOTION_AUDIT_ACTION.VERIFY_FAILED,
        performedByUserId: auth.user.id,
        performedByEmail: auth.user.email,
        ip,
        userAgent,
        message: `Código no encontrado (${parsed.raw})`,
      })

      return NextResponse.json({
        valid: false,
        status: null,
        reason: "Código no encontrado",
      })
    }

    const status = inferPromotionStatus(row.status, row.expiresAt)
    const valid = status === PROMOTION_STATUS.ACTIVE
    const reason = valid
      ? "Código válido"
      : status === PROMOTION_STATUS.REDEEMED
        ? "Código ya canjeado"
        : status === PROMOTION_STATUS.CANCELLED
          ? "Código cancelado"
          : "Código expirado"

    await logPromotionAudit({
      id: randomUUID(),
      promotionCodeId: row.id,
      action: valid
        ? PROMOTION_AUDIT_ACTION.VERIFIED
        : PROMOTION_AUDIT_ACTION.VERIFY_FAILED,
      performedByUserId: auth.user.id,
      performedByEmail: auth.user.email,
      ip,
      userAgent,
      message: `${reason} (${row.publicCode})`,
    })

    return NextResponse.json({
      valid,
      status,
      reason,
      code: mapCodeForResponse(row),
    })
  } catch (error) {
    console.error("Error verifying promotion code:", error)
    return NextResponse.json(
      { error: "Error al validar el código" },
      { status: 500 }
    )
  }
}
