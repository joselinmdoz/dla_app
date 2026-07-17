import "server-only"

import { existsSync } from "fs"
import path from "path"
import { defaultLandingContent, LandingContent } from "@/lib/landing-content"

const existenceCache = new Map<string, true>()

function isExternalAsset(value: string): boolean {
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
    existenceCache.set(urlPath, true)
  } else {
    existenceCache.delete(urlPath)
  }

  return exists
}

function resolveLandingAsset(asset: string, fallback: string): string {
  const trimmed = asset.trim()
  if (!trimmed) return fallback
  if (isExternalAsset(trimmed)) return trimmed

  const normalized = normalizePath(trimmed)
  return fileExistsInPublic(normalized) ? normalized : fallback
}

export function sanitizeLandingContentAssets(content: LandingContent): LandingContent {
  return {
    ...content,
    business: {
      ...content.business,
      logoUrl: resolveLandingAsset(content.business.logoUrl, defaultLandingContent.business.logoUrl),
      supportImageUrl: resolveLandingAsset(
        content.business.supportImageUrl,
        defaultLandingContent.business.supportImageUrl
      ),
    },
    hero: {
      ...content.hero,
      fallbackImageUrl: resolveLandingAsset(
        content.hero.fallbackImageUrl,
        defaultLandingContent.hero.fallbackImageUrl
      ),
    },
    location: {
      ...content.location,
      mapImageUrl: resolveLandingAsset(content.location.mapImageUrl, defaultLandingContent.location.mapImageUrl),
    },
    seo: {
      ...content.seo,
      ogImageUrl: resolveLandingAsset(content.seo.ogImageUrl, defaultLandingContent.seo.ogImageUrl),
      twitterImageUrl: resolveLandingAsset(
        content.seo.twitterImageUrl,
        defaultLandingContent.seo.twitterImageUrl
      ),
      faviconUrl: resolveLandingAsset(content.seo.faviconUrl, defaultLandingContent.seo.faviconUrl),
      shortcutIconUrl: resolveLandingAsset(
        content.seo.shortcutIconUrl,
        defaultLandingContent.seo.shortcutIconUrl
      ),
      appleIconUrl: resolveLandingAsset(content.seo.appleIconUrl, defaultLandingContent.seo.appleIconUrl),
      manifestUrl: resolveLandingAsset(content.seo.manifestUrl, defaultLandingContent.seo.manifestUrl),
    },
  }
}
