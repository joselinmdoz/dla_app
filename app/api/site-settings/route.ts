import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { randomUUID } from 'node:crypto'
import { requireAdminPermissions } from '@/lib/admin-auth'
import { ADMIN_PERMISSIONS } from '@/lib/admin-permissions'
import { parseLandingContent } from '@/lib/landing-content'
import { sanitizeLandingContentAssets } from '@/lib/landing-content-server'

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

// GET - Obtener todas las configuraciones
export async function GET() {
  try {
    await ensureSiteSettingsTable()
    const settings = await prisma.$queryRaw<SettingRow[]>`
      SELECT "key", "value"
      FROM "SiteSettings"
    `

    // Convertir a objeto clave-valor
    const settingsObject = settings.reduce<Record<string, string>>((acc, setting) => {
      acc[setting.key] = setting.value
      return acc
    }, {})

    if (settingsObject.landingContent) {
      settingsObject.landingContent = JSON.stringify(
        sanitizeLandingContentAssets(parseLandingContent(settingsObject.landingContent))
      )
    }

    return NextResponse.json(settingsObject)
  } catch (error) {
    console.error('Error fetching site settings:', error)
    return NextResponse.json(
      { error: 'Error al obtener la configuración' },
      { status: 500 }
    )
  }
}

// POST - Actualizar configuración
export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdminPermissions(request, [
      ADMIN_PERMISSIONS.SETTINGS_MANAGE,
      ADMIN_PERMISSIONS.LANDING_CONTENT_MANAGE,
    ])
    if (!auth.authorized) return auth.response

    const body = await request.json()
    const { key, value } = body

    if (!key || typeof key !== 'string') {
      return NextResponse.json(
        { error: 'Se requiere la clave de configuración' },
        { status: 400 }
      )
    }

    await ensureSiteSettingsTable()

    const normalizedValue = value === null || value === undefined ? '' : String(value)

    await prisma.$executeRaw`
      INSERT INTO "SiteSettings" ("id", "key", "value", "updatedAt")
      VALUES (${randomUUID()}, ${key}, ${normalizedValue}, NOW())
      ON CONFLICT ("key")
      DO UPDATE SET
        "value" = EXCLUDED."value",
        "updatedAt" = NOW()
    `

    return NextResponse.json({ key, value: normalizedValue })
  } catch (error) {
    console.error('Error updating site setting:', error)
    return NextResponse.json(
      { error: 'Error al actualizar la configuración' },
      { status: 500 }
    )
  }
}

// PUT - Actualizar múltiples configuraciones
export async function PUT(request: NextRequest) {
  try {
    const auth = await requireAdminPermissions(request, [
      ADMIN_PERMISSIONS.SETTINGS_MANAGE,
      ADMIN_PERMISSIONS.LANDING_CONTENT_MANAGE,
    ])
    if (!auth.authorized) return auth.response

    const settingsBody = await request.json()

    if (!settingsBody || typeof settingsBody !== 'object' || Array.isArray(settingsBody)) {
      return NextResponse.json(
        { error: 'El formato de configuración es inválido' },
        { status: 400 }
      )
    }

    const settings = Object.entries(settingsBody as Record<string, unknown>).filter(([key]) => !!key)

    await ensureSiteSettingsTable()

    // Usar transaction para actualizar todas las configuraciones
    await prisma.$transaction(
      settings.map(([key, value]) =>
        prisma.$executeRaw`
          INSERT INTO "SiteSettings" ("id", "key", "value", "updatedAt")
          VALUES (${randomUUID()}, ${key}, ${String(value ?? '')}, NOW())
          ON CONFLICT ("key")
          DO UPDATE SET
            "value" = EXCLUDED."value",
            "updatedAt" = NOW()
        `
      )
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating site settings:', error)
    return NextResponse.json(
      { error: 'Error al actualizar las configuraciones' },
      { status: 500 }
    )
  }
}
