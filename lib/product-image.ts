import { existsSync } from "fs"
import path from "path"

export const PRODUCT_IMAGE_FALLBACK = "/graphics/product-no-image.svg"

const existenceCache = new Map<string, true>()

function isExternalImage(value: string): boolean {
  return /^https?:\/\//i.test(value) || value.startsWith("data:") || value.startsWith("blob:")
}

function normalizePath(value: string): string {
  return value.startsWith("/") ? value : `/${value}`
}

function fileExistsInPublic(urlPath: string): boolean {
  const cached = existenceCache.get(urlPath)
  if (cached) return true

  const relativePath = urlPath.replace(/^\/+/, "")
  const absolutePath = path.join(process.cwd(), "public", relativePath)
  const exists = existsSync(absolutePath)
  if (exists) {
    // Cache only positive lookups. Missing files are re-checked on every request
    // so newly uploaded images become visible immediately without restarting.
    existenceCache.set(urlPath, true)
  } else {
    existenceCache.delete(urlPath)
  }
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
