import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { cookies } from 'next/headers'
import { prisma } from '@/lib/prisma'
import { AdminPermission, getEffectivePermissions } from '@/lib/admin-permissions'

const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key-change-in-production'
const globalForUserAccess = globalThis as unknown as {
  userAccessColumnsReady?: boolean
}

export type SessionPayload = {
  userId: string
  role: string
  permissions: AdminPermission[]
}

type AuthUserInput = {
  id: string
  role: string
  permissions?: unknown
}

export type CurrentUser = {
  id: string
  email: string
  name: string | null
  role: string
  isActive: boolean
  permissions: AdminPermission[]
}

type UserAccessRow = {
  isActive: boolean
  permissions: unknown
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function buildSessionPayload(user: AuthUserInput): SessionPayload {
  return {
    userId: user.id,
    role: user.role,
    permissions: getEffectivePermissions(user.role, user.permissions),
  }
}

export function generateToken(user: AuthUserInput): string {
  return jwt.sign(buildSessionPayload(user), JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): SessionPayload | null {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as Partial<SessionPayload>
    if (!payload.userId || !payload.role) return null
    return {
      userId: payload.userId,
      role: payload.role,
      permissions: getEffectivePermissions(payload.role, payload.permissions),
    }
  } catch {
    return null
  }
}

export async function getSession() {
  const cookieStore = await cookies()
  const token = cookieStore.get('auth-token')?.value
  if (!token) return null
  return verifyToken(token)
}

export async function ensureUserAccessColumns() {
  if (globalForUserAccess.userAccessColumnsReady) return

  await prisma.$executeRawUnsafe(
    `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "permissions" JSONB`
  )
  await prisma.$executeRawUnsafe(
    `ALTER TABLE "User" ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN NOT NULL DEFAULT true`
  )

  globalForUserAccess.userAccessColumnsReady = true
}

export async function getUserAccessRow(
  userId: string
): Promise<UserAccessRow | null> {
  await ensureUserAccessColumns()
  const rows = await prisma.$queryRaw<UserAccessRow[]>`
    SELECT
      "isActive",
      "permissions"
    FROM "User"
    WHERE "id" = ${userId}
    LIMIT 1
  `
  return rows[0] ?? null
}

export async function getCurrentUser(): Promise<CurrentUser | null> {
  const session = await getSession()
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

export async function setAuthCookie(token: string) {
  const cookieStore = await cookies()
  cookieStore.set('auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  })
}

export async function clearAuthCookie() {
  const cookieStore = await cookies()
  cookieStore.delete('auth-token')
}
