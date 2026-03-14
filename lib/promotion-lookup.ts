import { Prisma } from "@prisma/client"
import prisma from "@/lib/prisma"
import { ensurePromotionTables } from "@/lib/promotion-db"
import { hashPromotionToken, normalizePromotionValue } from "@/lib/promotions"

export type PromotionCodeRow = {
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

export async function findPromotionByInput(
  inputValue: string
): Promise<{
  row: PromotionCodeRow | null
  parsed: { raw: string; token: string | null; publicCode: string | null }
}> {
  await ensurePromotionTables()
  const parsed = normalizePromotionValue(inputValue)

  if (!parsed.token && !parsed.publicCode) {
    return { row: null, parsed }
  }

  const whereClause = parsed.token
    ? Prisma.sql`"tokenHash" = ${hashPromotionToken(parsed.token)}`
    : Prisma.sql`"publicCode" = ${parsed.publicCode}`

  const rows = await prisma.$queryRaw<PromotionCodeRow[]>(
    Prisma.sql`
      SELECT ${selectPromotionColumns()}
      FROM "PromotionCode"
      WHERE ${whereClause}
      LIMIT 1
    `
  )

  return {
    row: rows[0] ?? null,
    parsed,
  }
}
