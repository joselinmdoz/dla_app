import { NextRequest } from "next/server"
import prisma from "@/lib/prisma"
import { PromotionAuditAction } from "@/lib/promotions"

const PROMOTION_TABLE_SETUP_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS "PromotionCode" (
    "id" TEXT PRIMARY KEY,
    "promotionName" TEXT NOT NULL,
    "publicCode" TEXT NOT NULL UNIQUE,
    "tokenHash" TEXT NOT NULL UNIQUE,
    "status" TEXT NOT NULL DEFAULT 'ACTIVE',
    "issuedByUserId" TEXT NOT NULL,
    "issuedByEmail" TEXT,
    "issuedTo" TEXT,
    "notes" TEXT,
    "expiresAt" TIMESTAMP(3),
    "redeemedByUserId" TEXT,
    "redeemedByEmail" TEXT,
    "redeemedAt" TIMESTAMP(3),
    "cancelledByUserId" TEXT,
    "cancelledByEmail" TEXT,
    "cancelledAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE INDEX IF NOT EXISTS "PromotionCode_status_idx" ON "PromotionCode" ("status")`,
  `CREATE INDEX IF NOT EXISTS "PromotionCode_publicCode_idx" ON "PromotionCode" ("publicCode")`,
  `CREATE TABLE IF NOT EXISTS "PromotionCodeAudit" (
    "id" TEXT PRIMARY KEY,
    "promotionCodeId" TEXT,
    "action" TEXT NOT NULL,
    "performedByUserId" TEXT,
    "performedByEmail" TEXT,
    "ip" TEXT,
    "userAgent" TEXT,
    "message" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  )`,
  `CREATE INDEX IF NOT EXISTS "PromotionCodeAudit_promotionCodeId_idx" ON "PromotionCodeAudit" ("promotionCodeId")`,
  `CREATE INDEX IF NOT EXISTS "PromotionCodeAudit_action_idx" ON "PromotionCodeAudit" ("action")`,
] as const

const globalForPromotionTables = globalThis as unknown as {
  promotionTablesReady?: boolean
  promotionTablesReadyPromise?: Promise<void>
}

export async function ensurePromotionTables() {
  if (globalForPromotionTables.promotionTablesReady) return

  if (!globalForPromotionTables.promotionTablesReadyPromise) {
    globalForPromotionTables.promotionTablesReadyPromise = (async () => {
      for (const statement of PROMOTION_TABLE_SETUP_STATEMENTS) {
        await prisma.$executeRawUnsafe(statement)
      }
      globalForPromotionTables.promotionTablesReady = true
    })()
  }

  await globalForPromotionTables.promotionTablesReadyPromise
}

export function getRequestMeta(request: NextRequest): {
  ip: string | null
  userAgent: string | null
} {
  const forwardedFor = request.headers.get("x-forwarded-for")
  const ip = forwardedFor
    ? forwardedFor.split(",")[0].trim()
    : request.headers.get("x-real-ip")
  const userAgent = request.headers.get("user-agent")
  return { ip, userAgent }
}

export async function logPromotionAudit(input: {
  id: string
  promotionCodeId?: string | null
  action: PromotionAuditAction
  performedByUserId?: string | null
  performedByEmail?: string | null
  ip?: string | null
  userAgent?: string | null
  message?: string | null
}) {
  await prisma.$executeRaw`
    INSERT INTO "PromotionCodeAudit" (
      "id",
      "promotionCodeId",
      "action",
      "performedByUserId",
      "performedByEmail",
      "ip",
      "userAgent",
      "message",
      "createdAt"
    )
    VALUES (
      ${input.id},
      ${input.promotionCodeId ?? null},
      ${input.action},
      ${input.performedByUserId ?? null},
      ${input.performedByEmail ?? null},
      ${input.ip ?? null},
      ${input.userAgent ?? null},
      ${input.message ?? null},
      NOW()
    )
  `
}
