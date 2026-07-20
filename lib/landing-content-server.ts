import "server-only"

import { existsSync } from "fs"
import path from "path"
import { defaultLandingContent, LandingContent } from "@/lib/landing-content"

const existenceCache = new Map<string, true>()
export type LandingAssetKey =
  | "logo"
  | "support-image"
  | "hero-fallback"
  | "location-map"
  | "seo-og"
  | "seo-twitter"
  | "seo-favicon"
  | "seo-shortcut"
  | "seo-apple"

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

function normalizeLandingLink(value: string, fallback: string): string {
  const trimmed = value.trim()
  if (!trimmed) return fallback

  if (trimmed === "/products" || trimmed.startsWith("/products?")) {
    return "#menu"
  }

  return trimmed
}

export function isExternalLandingAsset(value: string): boolean {
  return isExternalAsset(value)
}

export function getLandingAssetPath(content: LandingContent, key: LandingAssetKey): string {
  switch (key) {
    case "logo":
      return resolveLandingAsset(content.business.logoUrl, defaultLandingContent.business.logoUrl)
    case "support-image":
      return resolveLandingAsset(content.business.supportImageUrl, defaultLandingContent.business.supportImageUrl)
    case "hero-fallback":
      return resolveLandingAsset(content.hero.fallbackImageUrl, defaultLandingContent.hero.fallbackImageUrl)
    case "location-map":
      return resolveLandingAsset(content.location.mapImageUrl, defaultLandingContent.location.mapImageUrl)
    case "seo-og":
      return resolveLandingAsset(content.seo.ogImageUrl, defaultLandingContent.seo.ogImageUrl)
    case "seo-twitter":
      return resolveLandingAsset(content.seo.twitterImageUrl, defaultLandingContent.seo.twitterImageUrl)
    case "seo-favicon":
      return resolveLandingAsset(content.seo.faviconUrl, defaultLandingContent.seo.faviconUrl)
    case "seo-shortcut":
      return resolveLandingAsset(content.seo.shortcutIconUrl, defaultLandingContent.seo.shortcutIconUrl)
    case "seo-apple":
      return resolveLandingAsset(content.seo.appleIconUrl, defaultLandingContent.seo.appleIconUrl)
  }
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
    featureCards: {
      ...content.featureCards,
      ctaUrl: normalizeLandingLink(content.featureCards.ctaUrl, defaultLandingContent.featureCards.ctaUrl),
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
