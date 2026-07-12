import "server-only"

import { cache } from "react"
import prisma from "@/lib/prisma"
import { defaultLandingContent, parseLandingContent } from "@/lib/landing-content"

type SettingRow = {
  key: string
  value: string
}

const CREATE_TABLE_SQL = `
  CREATE TABLE IF NOT EXISTS "SiteSettings" (
    "id" TEXT PRIMARY KEY,
    "key" TEXT NOT NULL UNIQUE,
    "value" TEXT NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
  );
`

async function ensureSiteSettingsTable() {
  await prisma.$executeRawUnsafe(CREATE_TABLE_SQL)
}

export const getSiteSettings = cache(async () => {
  await ensureSiteSettingsTable()
  const settings = await prisma.$queryRaw<SettingRow[]>`
    SELECT "key", "value"
    FROM "SiteSettings"
  `

  return settings.reduce<Record<string, string>>((acc, setting) => {
    acc[setting.key] = setting.value
    return acc
  }, {})
})

export const getLandingContentServer = cache(async () => {
  const settings = await getSiteSettings()
  return parseLandingContent(settings.landingContent)
})

export function getStructuredDataFromContent(structuredDataJson: string) {
  const raw = structuredDataJson.trim()
  if (!raw) return null

  try {
    return JSON.parse(raw)
  } catch {
    return JSON.parse(defaultLandingContent.seo.structuredDataJson)
  }
}

