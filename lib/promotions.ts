import { createHash, randomBytes } from "node:crypto"

export const PROMOTION_STATUS = {
  ACTIVE: "ACTIVE",
  REDEEMED: "REDEEMED",
  CANCELLED: "CANCELLED",
  EXPIRED: "EXPIRED",
} as const

export type PromotionStatus = (typeof PROMOTION_STATUS)[keyof typeof PROMOTION_STATUS]

export const PROMOTION_AUDIT_ACTION = {
  ISSUED: "ISSUED",
  VERIFIED: "VERIFIED",
  VERIFY_FAILED: "VERIFY_FAILED",
  REDEEMED: "REDEEMED",
  REDEEM_FAILED: "REDEEM_FAILED",
  CANCELLED: "CANCELLED",
} as const

export type PromotionAuditAction =
  (typeof PROMOTION_AUDIT_ACTION)[keyof typeof PROMOTION_AUDIT_ACTION]

type ParsedPromotionValue = {
  raw: string
  token: string | null
  publicCode: string | null
}

export function generatePromotionToken(): string {
  return `pr_${randomBytes(24).toString("base64url")}`
}

export function hashPromotionToken(token: string): string {
  return createHash("sha256").update(token).digest("hex")
}

function randomCodeChunk(length: number): string {
  const alphabet = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"
  const bytes = randomBytes(length)
  let value = ""
  for (let i = 0; i < length; i += 1) {
    value += alphabet[bytes[i] % alphabet.length]
  }
  return value
}

export function generatePromotionPublicCode(): string {
  return `PRM-${randomCodeChunk(4)}-${randomCodeChunk(4)}`
}

export function normalizePromotionValue(input: string): ParsedPromotionValue {
  const raw = input.trim()
  if (!raw) {
    return { raw: "", token: null, publicCode: null }
  }

  let parsedToken: string | null = null
  let parsedCode: string | null = null

  if (raw.includes("://")) {
    try {
      const url = new URL(raw)
      const tokenParam = url.searchParams.get("t") || url.searchParams.get("token")
      const codeParam = url.searchParams.get("c") || url.searchParams.get("code")
      parsedToken = tokenParam ? tokenParam.trim() : null
      parsedCode = codeParam ? codeParam.trim().toUpperCase() : null
    } catch {
      // no-op
    }
  }

  if (!parsedToken && raw.startsWith("DLA-PROMO:")) {
    parsedToken = raw.slice("DLA-PROMO:".length).trim()
  }

  if (!parsedToken && !parsedCode) {
    if (raw.startsWith("pr_")) {
      parsedToken = raw
    } else {
      parsedCode = raw.toUpperCase()
    }
  }

  return {
    raw,
    token: parsedToken || null,
    publicCode: parsedCode || null,
  }
}

export function buildPromotionQrPayload(baseUrl: string, token: string, code: string): string {
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl.slice(0, -1) : baseUrl
  return `${normalizedBase}/promo/claim?t=${encodeURIComponent(token)}&code=${encodeURIComponent(code)}`
}

export function inferPromotionStatus(
  status: string,
  expiresAt: Date | null
): PromotionStatus {
  if (status === PROMOTION_STATUS.ACTIVE && expiresAt && expiresAt.getTime() <= Date.now()) {
    return PROMOTION_STATUS.EXPIRED
  }

  if (
    status === PROMOTION_STATUS.REDEEMED ||
    status === PROMOTION_STATUS.CANCELLED ||
    status === PROMOTION_STATUS.ACTIVE
  ) {
    return status
  }

  return PROMOTION_STATUS.CANCELLED
}

export function statusLabel(status: PromotionStatus): string {
  switch (status) {
    case PROMOTION_STATUS.ACTIVE:
      return "Activo"
    case PROMOTION_STATUS.REDEEMED:
      return "Canjeado"
    case PROMOTION_STATUS.CANCELLED:
      return "Cancelado"
    case PROMOTION_STATUS.EXPIRED:
      return "Expirado"
    default:
      return status
  }
}
