import { Prisma } from "@prisma/client"
import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { ensureUserAccessColumns, hashPassword } from "@/lib/auth"
import { requireAdminPermissions } from "@/lib/admin-auth"
import { ADMIN_PERMISSIONS, normalizePermissions } from "@/lib/admin-permissions"

type UserRow = {
  id: string
  email: string
  name: string | null
  role: string
  isActive: boolean
  permissions: unknown
  createdAt: Date
  updatedAt: Date
}

function formatUser(user: UserRow) {
  return {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    isActive: user.isActive,
    permissions: normalizePermissions(user.permissions),
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  }
}

async function getUserRowById(id: string): Promise<UserRow | null> {
  await ensureUserAccessColumns()
  const rows = await prisma.$queryRaw<UserRow[]>`
    SELECT
      "id",
      "email",
      "name",
      "role",
      "isActive",
      "permissions",
      "createdAt",
      "updatedAt"
    FROM "User"
    WHERE "id" = ${id}
    LIMIT 1
  `
  return rows[0] ?? null
}

export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdminPermissions(
      request,
      ADMIN_PERMISSIONS.USERS_MANAGE
    )
    if (!auth.authorized) return auth.response

    await ensureUserAccessColumns()

    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")?.trim() || ""
    const searchTerm = `%${search}%`

    const whereClause = search
      ? Prisma.sql`WHERE ("name" ILIKE ${searchTerm} OR "email" ILIKE ${searchTerm})`
      : Prisma.empty

    const users = await prisma.$queryRaw<UserRow[]>(
      Prisma.sql`
        SELECT
          "id",
          "email",
          "name",
          "role",
          "isActive",
          "permissions",
          "createdAt",
          "updatedAt"
        FROM "User"
        ${whereClause}
        ORDER BY "createdAt" DESC
      `
    )

    return NextResponse.json({ data: users.map(formatUser) })
  } catch (error) {
    console.error("Error fetching users:", error)
    return NextResponse.json(
      { error: "Error al obtener usuarios" },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdminPermissions(
      request,
      ADMIN_PERMISSIONS.USERS_MANAGE
    )
    if (!auth.authorized) return auth.response

    const body = await request.json()
    const email = String(body.email || "").trim().toLowerCase()
    const password = String(body.password || "")
    const name =
      body.name === null || body.name === undefined || body.name === ""
        ? null
        : String(body.name).trim()
    const role = body.role === "ADMIN" ? "ADMIN" : "USER"
    const isActive = body.isActive !== false
    const permissions =
      role === "ADMIN" ? null : normalizePermissions(body.permissions)

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email y contraseña son requeridos" },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: "La contraseña debe tener al menos 6 caracteres" },
        { status: 400 }
      )
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
      select: { id: true },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: "Ya existe un usuario con ese email" },
        { status: 400 }
      )
    }

    const user = await prisma.user.create({
      data: {
        email,
        password: await hashPassword(password),
        name,
        role,
      },
      select: { id: true },
    })

    await ensureUserAccessColumns()
    const permissionsJson = permissions === null ? null : JSON.stringify(permissions)
    await prisma.$executeRaw`
      UPDATE "User"
      SET
        "isActive" = ${isActive},
        "permissions" = ${permissionsJson}::jsonb
      WHERE "id" = ${user.id}
    `

    const createdUser = await getUserRowById(user.id)
    if (!createdUser) {
      return NextResponse.json(
        { error: "Error al obtener el usuario creado" },
        { status: 500 }
      )
    }

    return NextResponse.json(formatUser(createdUser), { status: 201 })
  } catch (error) {
    console.error("Error creating user:", error)
    return NextResponse.json(
      { error: "Error al crear usuario" },
      { status: 500 }
    )
  }
}
