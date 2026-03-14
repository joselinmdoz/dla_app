import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, generateToken, setAuthCookie } from '@/lib/auth'
import {
  ADMIN_PERMISSIONS,
  canAccessAdminPanel,
  getEffectivePermissions,
  getFirstAccessibleAdminPath,
} from '@/lib/admin-permissions'
import { requireAdminPermissions } from '@/lib/admin-auth'

export async function POST(request: NextRequest) {
  try {
    const adminsCount = await prisma.user.count({
      where: { role: 'ADMIN' },
    })

    if (adminsCount > 0) {
      const auth = await requireAdminPermissions(
        request,
        ADMIN_PERMISSIONS.USERS_MANAGE
      )
      if (!auth.authorized) return auth.response
    }

    const body = await request.json()
    const { email, password, name } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email y contraseña son requeridos' },
        { status: 400 }
      )
    }

    // Verificar si ya existe
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'El email ya está registrado' },
        { status: 400 }
      )
    }

    const hashedPassword = await hashPassword(password)

    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name: name || 'Admin',
        role: 'ADMIN',
      },
    })

    const permissions = getEffectivePermissions(user.role, [])
    const token = generateToken({
      id: user.id,
      role: user.role,
      permissions,
    })

    await setAuthCookie(token)

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        permissions,
        isActive: true,
        canAccessAdmin: canAccessAdminPanel(user.role, permissions),
        adminEntryPath: getFirstAccessibleAdminPath(user.role, permissions),
      },
    })
  } catch (error) {
    console.error('Admin creation error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
