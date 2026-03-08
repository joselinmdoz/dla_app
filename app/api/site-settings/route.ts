import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'
import { randomUUID } from 'node:crypto'
import { verifyToken } from '@/lib/auth'

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

function isAdminRequest(request: NextRequest): boolean {
  const token = request.cookies.get('auth-token')?.value
  if (!token) return false
  const session = verifyToken(token)
  return session?.role === 'ADMIN'
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
    if (!isAdminRequest(request)) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

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
    if (!isAdminRequest(request)) {
      return NextResponse.json(
        { error: 'No autorizado' },
        { status: 401 }
      )
    }

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
