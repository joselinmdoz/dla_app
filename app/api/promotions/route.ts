import { randomUUID } from "node:crypto"
import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/prisma"
import { requireAdminPermissions } from "@/lib/admin-auth"
import { ADMIN_PERMISSIONS, hasAnyPermission } from "@/lib/admin-permissions"
import {
  buildPromotionQrPayload,
  generatePromotionPublicCode,
  generatePromotionToken,
  hashPromotionToken,
  inferPromotionStatus,
  PROMOTION_AUDIT_ACTION,
  PROMOTION_STATUS,
} from "@/lib/promotions"
import {
  ensurePromotionTables,
  getRequestMeta,
  logPromotionAudit,
} from "@/lib/promotion-db"

type PromotionCodeRow = {
  id: string
  promotionName: string
  publicCode: string
  tokenHash: string
  status: string
  issuedByUserId: string
  issuedByEmail: string | null
  issuedTo: string | null
  notes: string | null
  expiresAt: Date | null
  redeemedByUserId: string | null
  redeemedByEmail: string | null
  redeemedAt: Date | null
  cancelledByUserId: string | null
  cancelledByEmail: string | null
  cancelledAt: Date | null
  createdAt: Date
  updatedAt: Date
}

function mapPromotionCode(row: PromotionCodeRow) {
  const status = inferPromotionStatus(row.status, row.expiresAt)
  const { tokenHash: _tokenHash, ...safeRow } = row
  return {
    ...safeRow,
    status,
  }
}

function getRequestBaseUrl(request: NextRequest): string {
  const host =
    request.headers.get("x-forwarded-host") || request.headers.get("host")
  const protocol = request.headers.get("x-forwarded-proto") || "http"
  if (!host) return "http://localhost:3000"
  return `${protocol}://${host}`
}

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdminPermissions(request, [
      ADMIN_PERMISSIONS.PROMOTIONS_ISSUE,
      ADMIN_PERMISSIONS.PROMOTIONS_REDEEM,
      ADMIN_PERMISSIONS.PROMOTIONS_AUDIT,
      ADMIN_PERMISSIONS.PROMOTIONS_MANAGE,
    ])
    if (!auth.authorized) return auth.response

    await ensurePromotionTables()

    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")?.trim() || ""
    const status = searchParams.get("status")?.trim().toUpperCase() || "ALL"
    const limit = Math.max(1, Math.min(100, Number(searchParams.get("limit") || 50)))

    const hasGlobalRead = hasAnyPermission(auth.user.role, auth.user.permissions, [
      ADMIN_PERMISSIONS.PROMOTIONS_MANAGE,
      ADMIN_PERMISSIONS.PROMOTIONS_AUDIT,
    ])

    const rows = await prisma.$queryRaw<PromotionCodeRow[]>`
      SELECT
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
      FROM "PromotionCode"
      WHERE
        ${hasGlobalRead}
        OR "issuedByUserId" = ${auth.user.id}
        OR "redeemedByUserId" = ${auth.user.id}
      ORDER BY "createdAt" DESC
      LIMIT ${limit}
    `

    let filtered = rows
    if (search) {
      const lowerSearch = search.toLowerCase()
      filtered = filtered.filter((row) =>
        row.publicCode.toLowerCase().includes(lowerSearch) ||
        row.promotionName.toLowerCase().includes(lowerSearch) ||
        (row.issuedTo || "").toLowerCase().includes(lowerSearch) ||
        (row.issuedByEmail || "").toLowerCase().includes(lowerSearch)
      )
    }

    if (status !== "ALL") {
      filtered = filtered.filter(
        (row) => inferPromotionStatus(row.status, row.expiresAt) === status
      )
    }

    return NextResponse.json({
      data: filtered.map(mapPromotionCode),
    })
  } catch (error) {
    console.error("Error fetching promotions:", error)
    return NextResponse.json(
      { error: "Error al obtener promociones" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdminPermissions(request, [
      ADMIN_PERMISSIONS.PROMOTIONS_ISSUE,
      ADMIN_PERMISSIONS.PROMOTIONS_MANAGE,
    ])
    if (!auth.authorized) return auth.response

    await ensurePromotionTables()

    const body = await request.json()
    const promotionName = String(body.promotionName || "").trim()
    const issuedTo =
      body.issuedTo === undefined || body.issuedTo === null || body.issuedTo === ""
        ? null
        : String(body.issuedTo).trim()
    const notes =
      body.notes === undefined || body.notes === null || body.notes === ""
        ? null
        : String(body.notes).trim()
    const expiresAt =
      body.expiresAt && typeof body.expiresAt === "string"
        ? new Date(body.expiresAt)
        : null

    if (!promotionName) {
      return NextResponse.json(
        { error: "El nombre de la promoción es requerido" },
        { status: 400 }
      )
    }

    if (expiresAt && Number.isNaN(expiresAt.getTime())) {
      return NextResponse.json(
        { error: "La fecha de expiración es inválida" },
        { status: 400 }
      )
    }

    const token = generatePromotionToken()
    const tokenHash = hashPromotionToken(token)
    let id = ""
    let publicCode = ""
    let inserted = false

    for (let attempt = 0; attempt < 5; attempt += 1) {
      id = randomUUID()
      publicCode = generatePromotionPublicCode()
      try {
        await prisma.$executeRaw`
          INSERT INTO "PromotionCode" (
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
            "createdAt",
            "updatedAt"
          )
          VALUES (
            ${id},
            ${promotionName},
            ${publicCode},
            ${tokenHash},
            ${PROMOTION_STATUS.ACTIVE},
            ${auth.user.id},
            ${auth.user.email},
            ${issuedTo},
            ${notes},
            ${expiresAt},
            NOW(),
            NOW()
          )
        `
        inserted = true
        break
      } catch (error: any) {
        if (error?.code !== "23505") {
          throw error
        }
      }
    }

    if (!inserted) {
      return NextResponse.json(
        { error: "No se pudo generar un código único. Intenta nuevamente." },
        { status: 500 }
      )
    }

    const row = await prisma.$queryRaw<PromotionCodeRow[]>`
      SELECT
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
      FROM "PromotionCode"
      WHERE "id" = ${id}
      LIMIT 1
    `

    const created = row[0]
    const baseUrl = getRequestBaseUrl(request)
    const qrPayload = buildPromotionQrPayload(baseUrl, token, publicCode)

    const { ip, userAgent } = getRequestMeta(request)
    await logPromotionAudit({
      id: randomUUID(),
      promotionCodeId: created.id,
      action: PROMOTION_AUDIT_ACTION.ISSUED,
      performedByUserId: auth.user.id,
      performedByEmail: auth.user.email,
      ip,
      userAgent,
      message: `Código emitido: ${created.publicCode}`,
    })

    return NextResponse.json({
      data: mapPromotionCode(created),
      redeemToken: token,
      qrPayload,
    })
  } catch (error) {
    console.error("Error creating promotion code:", error)
    return NextResponse.json(
      { error: "Error al generar código de promoción" },
      { status: 500 }
    )
  }
}
