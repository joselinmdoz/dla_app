import "server-only"

import { readdir, readFile, writeFile, mkdir } from "fs/promises"
import path from "path"
import { gunzipSync, gzipSync } from "zlib"
import prisma from "@/lib/prisma"
import { ensurePromotionTables } from "@/lib/promotion-db"

export const BACKUP_FORMAT = "dla-system-backup"
export const BACKUP_VERSION = 1
const MAX_BACKUP_BYTES = 20 * 1024 * 1024
const MAX_MEDIA_BACKUP_BYTES = 150 * 1024 * 1024

type JsonRecord = Record<string, unknown>

export type SystemBackup = {
  format: typeof BACKUP_FORMAT
  version: typeof BACKUP_VERSION
  createdAt: string
  application: string
  data: JsonRecord
}

type GraphicsFile = { path: string; content: Buffer }

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

async function listGraphics(directory: string, prefix = ""): Promise<GraphicsFile[]> {
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

  const files: GraphicsFile[] = []
  for (const entry of entries) {
    const fileName = String(entry.name)
    const relativePath = path.posix.join(prefix, fileName)
    const absolutePath = path.join(directory, fileName)
    if (entry.isDirectory()) {
      files.push(...(await listGraphics(absolutePath, relativePath)))
    } else if (entry.isFile()) {
      const content = await readFile(absolutePath)
      files.push({ path: relativePath, content })
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
  }
}

export function parseSystemBackup(raw: string): SystemBackup {
  if (Buffer.byteLength(raw, "utf8") > MAX_BACKUP_BYTES) {
    throw new Error("El paquete supera el límite de 20 MB")
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
  if (!backup.data || typeof backup.data !== "object") {
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

  return {
    records: Object.values(backup.data).reduce<number>(
      (total, value) => total + (Array.isArray(value) ? value.length : 0),
      0
    ),
  }
}

export function backupFilename() {
  return `dla-salva-${new Date().toISOString().replace(/[:.]/g, "-")}.json`
}

function writeTarString(target: Buffer, value: string, offset: number, length: number) {
  Buffer.from(value).copy(target, offset, 0, Math.max(0, length - 1))
}

function writeTarOctal(target: Buffer, value: number, offset: number, length: number) {
  const octal = Math.floor(value).toString(8).padStart(length - 1, "0")
  writeTarString(target, octal, offset, length)
}

function tarHeader(filePath: string, size: number): Buffer {
  const header = Buffer.alloc(512)
  writeTarString(header, filePath, 0, 100)
  writeTarOctal(header, 0o644, 100, 8)
  writeTarOctal(header, 0, 108, 8)
  writeTarOctal(header, 0, 116, 8)
  writeTarOctal(header, size, 124, 12)
  writeTarOctal(header, Math.floor(Date.now() / 1000), 136, 12)
  header.fill(0x20, 148, 156)
  header[156] = "0".charCodeAt(0)
  writeTarString(header, "ustar", 257, 6)
  writeTarString(header, "00", 263, 2)
  const checksum = header.reduce((sum, byte) => sum + byte, 0)
  writeTarOctal(header, checksum, 148, 8)
  return header
}

export async function createMediaBackup(): Promise<Buffer> {
  const images = await listGraphics(path.join(process.cwd(), "public", "graphics"))
  const chunks: Buffer[] = []
  for (const image of images) {
    const filePath = `graphics/${safeImagePath(image.path)}`
    if (Buffer.byteLength(filePath) > 100) throw new Error(`La ruta de imagen es demasiado larga: ${image.path}`)
    chunks.push(tarHeader(filePath, image.content.length), image.content)
    const padding = image.content.length % 512
    if (padding) chunks.push(Buffer.alloc(512 - padding))
  }
  chunks.push(Buffer.alloc(1024))
  return gzipSync(Buffer.concat(chunks))
}

function readTarString(buffer: Buffer, offset: number, length: number) {
  const end = buffer.indexOf(0, offset)
  return buffer.subarray(offset, end === -1 ? offset + length : Math.min(end, offset + length)).toString("utf8")
}

function readTarOctal(buffer: Buffer, offset: number, length: number) {
  const value = readTarString(buffer, offset, length).trim()
  return value ? Number.parseInt(value, 8) : 0
}

export async function restoreMediaBackup(raw: Buffer) {
  if (raw.length > MAX_MEDIA_BACKUP_BYTES) throw new Error("El archivo de imágenes supera el límite de 150 MB")
  let tar: Buffer
  try {
    tar = gunzipSync(raw)
  } catch {
    throw new Error("El archivo de imágenes no es un paquete tar.gz válido")
  }

  const graphicsDir = path.join(process.cwd(), "public", "graphics")
  let offset = 0
  let restored = 0
  while (offset + 512 <= tar.length) {
    const header = tar.subarray(offset, offset + 512)
    if (header.every((byte) => byte === 0)) break
    const name = readTarString(header, 0, 100)
    const size = readTarOctal(header, 124, 12)
    if (!name.startsWith("graphics/")) throw new Error("El paquete contiene una ruta no permitida")
    const relativePath = safeImagePath(name.slice("graphics/".length))
    const dataStart = offset + 512
    const dataEnd = dataStart + size
    if (!name || !Number.isFinite(size) || size < 0 || dataEnd > tar.length) throw new Error("El paquete de imágenes está dañado")
    const target = path.join(graphicsDir, relativePath)
    await mkdir(path.dirname(target), { recursive: true })
    await writeFile(target, tar.subarray(dataStart, dataEnd))
    restored++
    offset = dataStart + Math.ceil(size / 512) * 512
  }
  return { images: restored }
}

export function mediaBackupFilename() {
  return `dla-imagenes-${new Date().toISOString().replace(/[:.]/g, "-")}.tar.gz`
}
