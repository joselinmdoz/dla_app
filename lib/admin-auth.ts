import { NextRequest, NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"
import { getUserAccessRow, verifyToken } from "@/lib/auth"
import {
  AdminPermission,
  canAccessAdminPanel,
  getEffectivePermissions,
  hasAnyPermission,
} from "@/lib/admin-permissions"

export type RequestUser = {
  id: string
  email: string
  name: string | null
  role: string
  isActive: boolean
  permissions: AdminPermission[]
}

type PermissionCheckOk = {
  authorized: true
  user: RequestUser
}

type PermissionCheckFail = {
  authorized: false
  response: NextResponse
}

export type PermissionCheckResult = PermissionCheckOk | PermissionCheckFail

function unauthorizedResponse() {
  return NextResponse.json({ error: "No autorizado" }, { status: 401 })
}

function forbiddenResponse() {
  return NextResponse.json({ error: "Sin permisos" }, { status: 403 })
}

export async function getRequestUser(
  request: NextRequest
): Promise<RequestUser | null> {
  const token = request.cookies.get("auth-token")?.value
  if (!token) return null

  const session = verifyToken(token)
  if (!session) return null

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
    },
  })

  if (!user) return null

  const access = await getUserAccessRow(user.id)
  if (!access || !access.isActive) return null

  return {
    ...user,
    isActive: access.isActive,
    permissions: getEffectivePermissions(user.role, access.permissions),
  }
}

export async function requireAdminAccess(
  request: NextRequest
): Promise<PermissionCheckResult> {
  const user = await getRequestUser(request)
  if (!user) {
    return {
      authorized: false,
      response: unauthorizedResponse(),
    }
  }

  if (!canAccessAdminPanel(user.role, user.permissions)) {
    return {
      authorized: false,
      response: forbiddenResponse(),
    }
  }

  return {
    authorized: true,
    user,
  }
}

export async function requireAdminPermissions(
  request: NextRequest,
  permissions: AdminPermission | AdminPermission[]
): Promise<PermissionCheckResult> {
  const baseAccess = await requireAdminAccess(request)
  if (!baseAccess.authorized) return baseAccess

  const requiredPermissions = Array.isArray(permissions)
    ? permissions
    : [permissions]

  if (
    !hasAnyPermission(
      baseAccess.user.role,
      baseAccess.user.permissions,
      requiredPermissions
    )
  ) {
    return {
      authorized: false,
      response: forbiddenResponse(),
    }
  }

  return baseAccess
}
