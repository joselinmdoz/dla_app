import { existsSync } from "fs"
import path from "path"

export const PRODUCT_IMAGE_FALLBACK = "/graphics/product-no-image.svg"

const existenceCache = new Map<string, boolean>()

function isExternalImage(value: string): boolean {
  return /^https?:\/\//i.test(value) || value.startsWith("data:") || value.startsWith("blob:")
}

function normalizePath(value: string): string {
  return value.startsWith("/") ? value : `/${value}`
}

function fileExistsInPublic(urlPath: string): boolean {
  const cached = existenceCache.get(urlPath)
  if (cached !== undefined) return cached

  const relativePath = urlPath.replace(/^\/+/, "")
  const absolutePath = path.join(process.cwd(), "public", relativePath)
  const exists = existsSync(absolutePath)
  existenceCache.set(urlPath, exists)
  return exists
}

export function resolveProductImage(image: string | null | undefined): string {
  if (!image || image.trim().length === 0) {
    return PRODUCT_IMAGE_FALLBACK
  }

  const trimmed = image.trim()
  if (isExternalImage(trimmed)) {
    return trimmed
  }

  const normalized = normalizePath(trimmed)
  return fileExistsInPublic(normalized) ? normalized : PRODUCT_IMAGE_FALLBACK
}

