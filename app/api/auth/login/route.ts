import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import {
  generateToken,
  getUserAccessRow,
  setAuthCookie,
  verifyPassword,
} from '@/lib/auth'
import {
  canAccessAdminPanel,
  getEffectivePermissions,
  getFirstAccessibleAdminPath,
} from '@/lib/admin-permissions'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email y contraseña son requeridos' },
        { status: 400 }
      )
    }

    const user = await prisma.user.findUnique({
      where: { email },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      )
    }

    const isValid = await verifyPassword(password, user.password)

    if (!isValid) {
      return NextResponse.json(
        { error: 'Credenciales inválidas' },
        { status: 401 }
      )
    }

    const access = await getUserAccessRow(user.id)
    const isActive = access?.isActive ?? true

    if (!isActive) {
      return NextResponse.json(
        { error: 'Usuario inactivo' },
        { status: 403 }
      )
    }

    const permissions = getEffectivePermissions(user.role, access?.permissions)
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
        isActive,
        canAccessAdmin: canAccessAdminPanel(user.role, permissions),
        adminEntryPath: getFirstAccessibleAdminPath(user.role, permissions),
      },
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
