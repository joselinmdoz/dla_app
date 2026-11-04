import "server-only"

import { readdir, readFile, writeFile, mkdir } from "fs/promises"
import path from "path"
import prisma from "@/lib/prisma"
import { ensurePromotionTables } from "@/lib/promotion-db"

export const BACKUP_FORMAT = "dla-system-backup"
export const BACKUP_VERSION = 1
const MAX_BACKUP_BYTES = 100 * 1024 * 1024

type JsonRecord = Record<string, unknown>

export type SystemBackup = {
  format: typeof BACKUP_FORMAT
  version: typeof BACKUP_VERSION
  createdAt: string
  application: string
  data: JsonRecord
  images: Array<{ path: string; contentBase64: string }>
}

const OFFICE_IMAGES_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS "OfficeImage" (
    "id" TEXT PRIMARY KEY,
    "imageUrl" TEXT NOT NULL,
    "altText" TEXT NOT NULL,
    "title" TEXT,
    "description" TEXT,
    "linkUrl" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  )
`

async function ensureExtraTables() {
  await prisma.$executeRawUnsafe(OFFICE_IMAGES_TABLE_SQL)
  await ensurePromotionTables()
}

function serializable<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T
}

async function listGraphics(directory: string, prefix = ""): Promise<Array<{ path: string; contentBase64: string }>> {
  let entries: Array<{
    name: string | Buffer
    isDirectory: () => boolean
    isFile: () => boolean
  }>
  try {
    entries = await readdir(directory, { withFileTypes: true })
  } catch {
    return []
  }

  const files: Array<{ path: string; contentBase64: string }> = []
  for (const entry of entries) {
    const fileName = String(entry.name)
    const relativePath = path.posix.join(prefix, fileName)
    const absolutePath = path.join(directory, fileName)
    if (entry.isDirectory()) {
      files.push(...(await listGraphics(absolutePath, relativePath)))
    } else if (entry.isFile()) {
      const content = await readFile(absolutePath)
      files.push({ path: relativePath, contentBase64: content.toString("base64") })
    }
  }
  return files
}

export async function createSystemBackup(): Promise<SystemBackup> {
  await ensureExtraTables()

  const [
    users,
    provinces,
    shippingTypes,
    cargoTypes,
    paymentMethods,
    categories,
    clients,
    products,
    shipments,
    shipmentProducts,
    heroSlides,
    featureCards,
    siteSettings,
    officeImages,
    promotionCodes,
    promotionAudits,
    images,
  ] = await Promise.all([
    prisma.user.findMany(),
    prisma.province.findMany(),
    prisma.shippingType.findMany(),
    prisma.cargoCatalog.findMany(),
    prisma.paymentCatalog.findMany(),
    prisma.category.findMany(),
    prisma.client.findMany(),
    prisma.product.findMany(),
    prisma.shipment.findMany(),
    prisma.shipmentProduct.findMany(),
    prisma.heroSlide.findMany(),
    prisma.featureCard.findMany(),
    prisma.siteSettings.findMany(),
    prisma.$queryRaw<JsonRecord[]>`SELECT * FROM "OfficeImage"`,
    prisma.$queryRaw<JsonRecord[]>`SELECT * FROM "PromotionCode"`,
    prisma.$queryRaw<JsonRecord[]>`SELECT * FROM "PromotionCodeAudit"`,
    listGraphics(path.join(process.cwd(), "public", "graphics")),
  ])

  return {
    format: BACKUP_FORMAT,
    version: BACKUP_VERSION,
    createdAt: new Date().toISOString(),
    application: "DLA Viajes y Envíos",
    data: serializable({
      users, provinces, shippingTypes, cargoTypes, paymentMethods, categories,
      clients, products, shipments, shipmentProducts, heroSlides, featureCards,
      siteSettings, officeImages, promotionCodes, promotionAudits,
    }),
    images,
  }
}

export function parseSystemBackup(raw: string): SystemBackup {
  if (Buffer.byteLength(raw, "utf8") > MAX_BACKUP_BYTES) {
    throw new Error("El paquete supera el límite de 100 MB")
  }
  let parsed: unknown
  try {
    parsed = JSON.parse(raw)
  } catch {
    throw new Error("El archivo no contiene un paquete JSON válido")
  }
  if (!parsed || typeof parsed !== "object") throw new Error("Formato de paquete inválido")
  const backup = parsed as Partial<SystemBackup>
  if (backup.format !== BACKUP_FORMAT || backup.version !== BACKUP_VERSION) {
    throw new Error("El paquete no corresponde a una salva compatible de DLA")
  }
  if (!backup.data || typeof backup.data !== "object" || !Array.isArray(backup.images)) {
    throw new Error("El paquete está incompleto")
  }
  return backup as SystemBackup
}

function rows(backup: SystemBackup, name: string): JsonRecord[] {
  const value = backup.data[name]
  if (value === undefined) return []
  if (!Array.isArray(value) || value.some((row) => !row || typeof row !== "object")) {
    throw new Error(`Datos inválidos en la sección ${name}`)
  }
  return value as JsonRecord[]
}

function date(value: unknown): Date {
  const result = new Date(String(value))
  if (Number.isNaN(result.getTime())) throw new Error("El paquete contiene una fecha inválida")
  return result
}

function safeImagePath(relativePath: string): string {
  if (!relativePath || path.isAbsolute(relativePath) || relativePath.split(/[\\/]/).includes("..")) {
    throw new Error("El paquete contiene una ruta de imagen no permitida")
  }
  return relativePath
}

export async function restoreSystemBackup(backup: SystemBackup) {
  await ensureExtraTables()
  const users = rows(backup, "users")
  const provinces = rows(backup, "provinces")
  const shippingTypes = rows(backup, "shippingTypes")
  const cargoTypes = rows(backup, "cargoTypes")
  const paymentMethods = rows(backup, "paymentMethods")
  const categories = rows(backup, "categories")
  const clients = rows(backup, "clients")
  const products = rows(backup, "products")
  const shipments = rows(backup, "shipments")
  const shipmentProducts = rows(backup, "shipmentProducts")
  const heroSlides = rows(backup, "heroSlides")
  const featureCards = rows(backup, "featureCards")
  const siteSettings = rows(backup, "siteSettings")
  const officeImages = rows(backup, "officeImages")
  const promotionCodes = rows(backup, "promotionCodes")
  const promotionAudits = rows(backup, "promotionAudits")

  await prisma.$transaction(async (tx) => {
    await tx.$executeRawUnsafe('DELETE FROM "PromotionCodeAudit"')
    await tx.$executeRawUnsafe('DELETE FROM "PromotionCode"')
    await tx.$executeRawUnsafe('DELETE FROM "OfficeImage"')
    await tx.shipmentProduct.deleteMany()
    await tx.shipment.deleteMany()
    await tx.product.deleteMany()
    await tx.client.updateMany({ data: { referredById: null } })
    await tx.client.deleteMany()
    await tx.category.deleteMany()
    await tx.shippingType.deleteMany()
    await tx.cargoCatalog.deleteMany()
    await tx.paymentCatalog.deleteMany()
    await tx.province.deleteMany()
    await tx.heroSlide.deleteMany()
    await tx.featureCard.deleteMany()
    await tx.siteSettings.deleteMany()
    await tx.user.deleteMany()

    if (users.length) await tx.user.createMany({ data: users.map((r) => ({ ...r, createdAt: date(r.createdAt), updatedAt: date(r.updatedAt) })) as never })
    if (provinces.length) await tx.province.createMany({ data: provinces.map((r) => ({ ...r, createdAt: date(r.createdAt), updatedAt: date(r.updatedAt) })) as never })
    if (shippingTypes.length) await tx.shippingType.createMany({ data: shippingTypes.map((r) => ({ ...r, createdAt: date(r.createdAt), updatedAt: date(r.updatedAt) })) as never })
    if (cargoTypes.length) await tx.cargoCatalog.createMany({ data: cargoTypes.map((r) => ({ ...r, createdAt: date(r.createdAt), updatedAt: date(r.updatedAt) })) as never })
    if (paymentMethods.length) await tx.paymentCatalog.createMany({ data: paymentMethods.map((r) => ({ ...r, createdAt: date(r.createdAt), updatedAt: date(r.updatedAt) })) as never })
    if (categories.length) await tx.category.createMany({ data: categories.map((r) => ({ ...r, createdAt: date(r.createdAt), updatedAt: date(r.updatedAt) })) as never })
    if (clients.length) {
      await tx.client.createMany({ data: clients.map((r) => ({ ...r, referredById: null, createdAt: date(r.createdAt), updatedAt: date(r.updatedAt) })) as never })
      for (const client of clients) {
        if (client.referredById) await tx.client.update({ where: { id: String(client.id) }, data: { referredById: String(client.referredById) } })
      }
    }
    if (products.length) await tx.product.createMany({ data: products.map((r) => ({ ...r, createdAt: date(r.createdAt), updatedAt: date(r.updatedAt) })) as never })
    if (heroSlides.length) await tx.heroSlide.createMany({ data: heroSlides.map((r) => ({ ...r, createdAt: date(r.createdAt), updatedAt: date(r.updatedAt) })) as never })
    if (featureCards.length) await tx.featureCard.createMany({ data: featureCards.map((r) => ({ ...r, createdAt: date(r.createdAt), updatedAt: date(r.updatedAt) })) as never })
    if (siteSettings.length) await tx.siteSettings.createMany({ data: siteSettings.map((r) => ({ ...r, updatedAt: date(r.updatedAt) })) as never })
    if (shipments.length) await tx.shipment.createMany({ data: shipments.map((r) => ({ ...r, createdAt: date(r.createdAt), updatedAt: date(r.updatedAt) })) as never })
    if (shipmentProducts.length) await tx.shipmentProduct.createMany({ data: shipmentProducts.map((r) => ({ ...r, createdAt: date(r.createdAt) })) as never })

    for (const row of officeImages) {
      await tx.$executeRaw`INSERT INTO "OfficeImage" ("id", "imageUrl", "altText", "title", "description", "linkUrl", "sortOrder", "isActive", "createdAt", "updatedAt") VALUES (${String(row.id)}, ${String(row.imageUrl)}, ${String(row.altText)}, ${row.title ? String(row.title) : null}, ${row.description ? String(row.description) : null}, ${row.linkUrl ? String(row.linkUrl) : null}, ${Number(row.sortOrder) || 0}, ${Boolean(row.isActive)}, ${date(row.createdAt)}, ${date(row.updatedAt)})`
    }
    for (const row of promotionCodes) {
      await tx.$executeRaw`INSERT INTO "PromotionCode" ("id", "promotionName", "publicCode", "tokenHash", "status", "issuedByUserId", "issuedByEmail", "issuedTo", "notes", "expiresAt", "redeemedByUserId", "redeemedByEmail", "redeemedAt", "cancelledByUserId", "cancelledByEmail", "cancelledAt", "createdAt", "updatedAt") VALUES (${String(row.id)}, ${String(row.promotionName)}, ${String(row.publicCode)}, ${String(row.tokenHash)}, ${String(row.status)}, ${String(row.issuedByUserId)}, ${row.issuedByEmail ? String(row.issuedByEmail) : null}, ${row.issuedTo ? String(row.issuedTo) : null}, ${row.notes ? String(row.notes) : null}, ${row.expiresAt ? date(row.expiresAt) : null}, ${row.redeemedByUserId ? String(row.redeemedByUserId) : null}, ${row.redeemedByEmail ? String(row.redeemedByEmail) : null}, ${row.redeemedAt ? date(row.redeemedAt) : null}, ${row.cancelledByUserId ? String(row.cancelledByUserId) : null}, ${row.cancelledByEmail ? String(row.cancelledByEmail) : null}, ${row.cancelledAt ? date(row.cancelledAt) : null}, ${date(row.createdAt)}, ${date(row.updatedAt)})`
    }
    for (const row of promotionAudits) {
      await tx.$executeRaw`INSERT INTO "PromotionCodeAudit" ("id", "promotionCodeId", "action", "performedByUserId", "performedByEmail", "ip", "userAgent", "message", "createdAt") VALUES (${String(row.id)}, ${row.promotionCodeId ? String(row.promotionCodeId) : null}, ${String(row.action)}, ${row.performedByUserId ? String(row.performedByUserId) : null}, ${row.performedByEmail ? String(row.performedByEmail) : null}, ${row.ip ? String(row.ip) : null}, ${row.userAgent ? String(row.userAgent) : null}, ${row.message ? String(row.message) : null}, ${date(row.createdAt)})`
    }
  }, { timeout: 60_000 })

  const graphicsDir = path.join(process.cwd(), "public", "graphics")
  for (const image of backup.images) {
    const relativePath = safeImagePath(image.path)
    if (typeof image.contentBase64 !== "string") throw new Error("Contenido de imagen inválido")
    const target = path.join(graphicsDir, relativePath)
    await mkdir(path.dirname(target), { recursive: true })
    await writeFile(target, Buffer.from(image.contentBase64, "base64"))
  }

  return {
    records: Object.values(backup.data).reduce<number>(
      (total, value) => total + (Array.isArray(value) ? value.length : 0),
      0
    ),
    images: backup.images.length,
  }
}

export function backupFilename() {
  return `dla-salva-${new Date().toISOString().replace(/[:.]/g, "-")}.json`
}
