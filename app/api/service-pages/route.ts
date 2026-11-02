import { NextRequest, NextResponse } from "next/server"
import { randomUUID } from "node:crypto"
import prisma from "@/lib/prisma"
import { requireAdminPermissions } from "@/lib/admin-auth"
import { ADMIN_PERMISSIONS } from "@/lib/admin-permissions"
import { parseServicePages } from "@/lib/service-pages"

export const dynamic = "force-dynamic"

const CREATE_TABLE_SQL = `CREATE TABLE IF NOT EXISTS "SiteSettings" ("id" TEXT PRIMARY KEY, "key" TEXT NOT NULL UNIQUE, "value" TEXT NOT NULL, "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP);`

export async function GET(request: NextRequest) {
  const auth = await requireAdminPermissions(request, ADMIN_PERMISSIONS.SERVICE_PAGES_MANAGE)
  if (!auth.authorized) return auth.response
  await prisma.$executeRawUnsafe(CREATE_TABLE_SQL)
  const rows = await prisma.$queryRaw<Array<{ value: string }>>`
    SELECT "value" FROM "SiteSettings" WHERE "key" = ${"servicePages"} LIMIT 1
  `
  return NextResponse.json(parseServicePages(rows[0]?.value))
}

export async function PUT(request: NextRequest) {
  const auth = await requireAdminPermissions(request, ADMIN_PERMISSIONS.SERVICE_PAGES_MANAGE)
  if (!auth.authorized) return auth.response
  const pages = parseServicePages(JSON.stringify(await request.json()))
  await prisma.$executeRawUnsafe(CREATE_TABLE_SQL)
  const value = JSON.stringify(pages)
  await prisma.$executeRaw`
    INSERT INTO "SiteSettings" ("id", "key", "value", "updatedAt")
    VALUES (${randomUUID()}, ${"servicePages"}, ${value}, NOW())
    ON CONFLICT ("key") DO UPDATE SET "value" = EXCLUDED."value", "updatedAt" = NOW()
  `
  return NextResponse.json(pages)
}
