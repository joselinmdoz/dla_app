import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import {
  ensureUserAccessColumns,
  getUserAccessRow,
  hashPassword,
} from "@/lib/auth"
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

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdminPermissions(
      request,
      ADMIN_PERMISSIONS.USERS_MANAGE
    )
    if (!auth.authorized) return auth.response

    const { id } = await params
    const body = await request.json()

    const existingUser = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        role: true,
      },
    })

    if (!existingUser) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      )
    }

    const accessRow = await getUserAccessRow(id)
    const currentIsActive = accessRow?.isActive ?? true

    const nextEmail =
      body.email === undefined
        ? undefined
        : String(body.email || "").trim().toLowerCase()
    const nextRole =
      body.role === undefined ? undefined : body.role === "ADMIN" ? "ADMIN" : "USER"
    const nextIsActive =
      body.isActive === undefined ? undefined : Boolean(body.isActive)
    const nextName =
      body.name === undefined
        ? undefined
        : body.name === null || body.name === ""
          ? null
          : String(body.name).trim()
    const nextPassword =
      body.password === undefined ? undefined : String(body.password || "")

    if (nextEmail !== undefined && !nextEmail) {
      return NextResponse.json(
        { error: "El email no puede estar vacío" },
        { status: 400 }
      )
    }

    if (nextEmail && nextEmail !== existingUser.email) {
      const emailInUse = await prisma.user.findUnique({
        where: { email: nextEmail },
        select: { id: true },
      })
      if (emailInUse) {
        return NextResponse.json(
          { error: "Ya existe un usuario con ese email" },
          { status: 400 }
        )
      }
    }

    if (nextPassword !== undefined && nextPassword.length > 0 && nextPassword.length < 6) {
      return NextResponse.json(
        { error: "La contraseña debe tener al menos 6 caracteres" },
        { status: 400 }
      )
    }

    if (auth.user.id === id) {
      if (nextIsActive === false) {
        return NextResponse.json(
          { error: "No puedes desactivar tu propio usuario" },
          { status: 400 }
        )
      }

      if (nextRole === "USER") {
        return NextResponse.json(
          { error: "No puedes quitarte el rol ADMIN a ti mismo" },
          { status: 400 }
        )
      }
    }

    const userData: {
      email?: string
      name?: string | null
      role?: "USER" | "ADMIN"
      password?: string
    } = {}

    if (nextEmail !== undefined) userData.email = nextEmail
    if (nextName !== undefined) userData.name = nextName
    if (nextRole !== undefined) userData.role = nextRole
    if (nextPassword && nextPassword.length > 0) {
      userData.password = await hashPassword(nextPassword)
    }

    if (Object.keys(userData).length > 0) {
      await prisma.user.update({
        where: { id },
        data: userData,
      })
    }

    const finalRole = nextRole ?? existingUser.role
    const finalIsActive = nextIsActive ?? currentIsActive
    const finalPermissions =
      finalRole === "ADMIN"
        ? null
        : body.permissions === undefined
          ? normalizePermissions(accessRow?.permissions)
          : normalizePermissions(body.permissions)

    await ensureUserAccessColumns()
    const permissionsJson =
      finalPermissions === null ? null : JSON.stringify(finalPermissions)

    await prisma.$executeRaw`
      UPDATE "User"
      SET
        "isActive" = ${finalIsActive},
        "permissions" = ${permissionsJson}::jsonb
      WHERE "id" = ${id}
    `

    const updatedUser = await getUserRowById(id)
    if (!updatedUser) {
      return NextResponse.json(
        { error: "Error al obtener el usuario actualizado" },
        { status: 500 }
      )
    }

    return NextResponse.json(formatUser(updatedUser))
  } catch (error) {
    console.error("Error updating user:", error)
    return NextResponse.json(
      { error: "Error al actualizar usuario" },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdminPermissions(
      request,
      ADMIN_PERMISSIONS.USERS_MANAGE
    )
    if (!auth.authorized) return auth.response

    const { id } = await params

    if (auth.user.id === id) {
      return NextResponse.json(
        { error: "No puedes eliminar tu propio usuario" },
        { status: 400 }
      )
    }

    const existingUser = await prisma.user.findUnique({
      where: { id },
      select: { id: true },
    })

    if (!existingUser) {
      return NextResponse.json(
        { error: "Usuario no encontrado" },
        { status: 404 }
      )
    }

    await prisma.user.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting user:", error)
    return NextResponse.json(
      { error: "Error al eliminar usuario" },
      { status: 500 }
    )
  }
}
