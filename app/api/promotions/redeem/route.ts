import { randomUUID } from "node:crypto"
import { NextRequest, NextResponse } from "next/server"
import { Prisma } from "@prisma/client"
import prisma from "@/lib/prisma"
import { requireAdminPermissions } from "@/lib/admin-auth"
import { ADMIN_PERMISSIONS } from "@/lib/admin-permissions"
import { findPromotionByInput, PromotionCodeRow } from "@/lib/promotion-lookup"
import {
  inferPromotionStatus,
  PROMOTION_AUDIT_ACTION,
  PROMOTION_STATUS,
} from "@/lib/promotions"
import { getRequestMeta, logPromotionAudit } from "@/lib/promotion-db"
import { consumeRateLimit } from "@/lib/rate-limit"

function selectPromotionColumns() {
  return Prisma.sql`
    "id",
    "promotionName",
    "publicCode",
    "tokenHash",
    "status",
    "issuedByUserId",
    "issuedByEmail",
    "issuedTo",
    "notes",
    "expiresAt",
    "redeemedByUserId",
    "redeemedByEmail",
    "redeemedAt",
    "cancelledByUserId",
    "cancelledByEmail",
    "cancelledAt",
    "createdAt",
    "updatedAt"
  `
}

function mapCode(row: PromotionCodeRow) {
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

    const { row } = await findPromotionByInput(value)
    const { ip, userAgent } = getRequestMeta(request)
    const rate = consumeRateLimit({
      key: `promo:redeem:${auth.user.id}:${ip || "no-ip"}`,
      limit: 20,
      windowMs: 60_000,
    })

    if (!rate.allowed) {
      return NextResponse.json(
        { error: "Demasiados intentos de canje. Intenta nuevamente." },
        { status: 429 }
      )
    }

    if (!row) {
      await logPromotionAudit({
        id: randomUUID(),
        action: PROMOTION_AUDIT_ACTION.REDEEM_FAILED,
        performedByUserId: auth.user.id,
        performedByEmail: auth.user.email,
        ip,
        userAgent,
        message: `Canje fallido: código no encontrado (${value})`,
      })

      return NextResponse.json(
        { success: false, reason: "Código no encontrado", code: null }
      )
    }

    const updatedRows = await prisma.$queryRaw<PromotionCodeRow[]>`
      UPDATE "PromotionCode"
      SET
        "status" = ${PROMOTION_STATUS.REDEEMED},
        "redeemedByUserId" = ${auth.user.id},
        "redeemedByEmail" = ${auth.user.email},
        "redeemedAt" = NOW(),
        "updatedAt" = NOW()
      WHERE
        "id" = ${row.id}
        AND "status" = ${PROMOTION_STATUS.ACTIVE}
        AND ("expiresAt" IS NULL OR "expiresAt" > NOW())
      RETURNING
        "id",
        "promotionName",
        "publicCode",
        "tokenHash",
        "status",
        "issuedByUserId",
        "issuedByEmail",
        "issuedTo",
        "notes",
        "expiresAt",
        "redeemedByUserId",
        "redeemedByEmail",
        "redeemedAt",
        "cancelledByUserId",
        "cancelledByEmail",
        "cancelledAt",
        "createdAt",
        "updatedAt"
    `

    const redeemed = updatedRows[0]

    if (!redeemed) {
      const latestRows = await prisma.$queryRaw<PromotionCodeRow[]>(
        Prisma.sql`
          SELECT ${selectPromotionColumns()}
          FROM "PromotionCode"
          WHERE "id" = ${row.id}
          LIMIT 1
        `
      )
      const latest = latestRows[0] || row
      const latestStatus = inferPromotionStatus(latest.status, latest.expiresAt)
      const reason =
        latestStatus === PROMOTION_STATUS.REDEEMED
          ? "Código ya canjeado"
          : latestStatus === PROMOTION_STATUS.CANCELLED
            ? "Código cancelado"
            : latestStatus === PROMOTION_STATUS.EXPIRED
              ? "Código expirado"
              : "No se pudo canjear el código"

      await logPromotionAudit({
        id: randomUUID(),
        promotionCodeId: latest.id,
        action: PROMOTION_AUDIT_ACTION.REDEEM_FAILED,
        performedByUserId: auth.user.id,
        performedByEmail: auth.user.email,
        ip,
        userAgent,
        message: `Canje fallido: ${reason} (${latest.publicCode})`,
      })

      return NextResponse.json(
        {
          success: false,
          reason,
          code: mapCode(latest),
        }
      )
    }

    await logPromotionAudit({
      id: randomUUID(),
      promotionCodeId: redeemed.id,
      action: PROMOTION_AUDIT_ACTION.REDEEMED,
      performedByUserId: auth.user.id,
      performedByEmail: auth.user.email,
      ip,
      userAgent,
      message: `Código canjeado (${redeemed.publicCode})`,
    })

    return NextResponse.json({
      success: true,
      code: mapCode(redeemed),
    })
  } catch (error) {
    console.error("Error redeeming promotion code:", error)
    return NextResponse.json(
      { error: "Error al canjear el código" },
      { status: 500 }
    )
  }
}
