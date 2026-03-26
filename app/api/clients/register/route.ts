import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { randomBytes } from 'crypto'
import { hashPassword, generateToken, setAuthCookie } from '@/lib/auth'
import { getEffectivePermissions, canAccessAdminPanel, getFirstAccessibleAdminPath } from '@/lib/admin-permissions'

// Generar código de referido único
function generateReferralCode(): string {
  return randomBytes(4).toString('hex').toUpperCase()
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, phone, password, address, province, city, notes, referralCode } = body

    // Validar campos requeridos
    if (!name || !email || !phone || !password) {
      return NextResponse.json(
        { error: 'Nombre, email, teléfono y contraseña son requeridos' },
        { status: 400 }
      )
    }

    // 1. Verificar si el email ya existe
    const existingClientByEmail = await prisma.client.findUnique({ 
      where: { email } 
    })
    if (existingClientByEmail) {
      return NextResponse.json(
        { error: 'Ya existe un cliente con este email' },
        { status: 400 }
      )
    }

    // 2. Verificar duplicados por nombre + email (búsqueda flexible)
    const existingClientsByName = await prisma.client.findMany({
      where: {
        name: { contains: name, mode: 'insensitive' }
      }
    })
    
    // Verificar si hay algún cliente con email similar
    const similarClient = existingClientsByName.find(
      c => c.email.toLowerCase() === email.toLowerCase()
    )
    if (similarClient) {
      return NextResponse.json(
        { 
          error: 'Ya existe un cliente con este nombre y email. ¿Es posible que ya tengas una cuenta?',
          existingClientId: similarClient.id 
        },
        { status: 400 }
      )
    }

    // 3. Validar código de referido si se proporcionó
    let referredById = null
    if (referralCode) {
      const referrer = await prisma.client.findUnique({
        where: { referralCode }
      })
      if (referrer) {
        referredById = referrer.id
      }
      // Si el código no es válido, simplemente ignoramos (no bloqueamos el registro)
    }

    // 4. Crear el cliente con su código de referido único
    const newReferralCode = generateReferralCode()
    
    const client = await prisma.client.create({
      data: {
        name,
        email,
        phone,
        address,
        province,
        city,
        notes,
        referralCode: newReferralCode,
        referredById,
      },
    })

    // 5. Crear usuario para autenticación (rol USER para clientes)
    const hashedPassword = await hashPassword(password)
    
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        role: 'USER',
      },
    })

    // 6. Generar token y establecer cookie
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
        role: 'USER',
        permissions,
        isActive: true,
        canAccessAdmin: false,
        clientId: client.id,
      },
      client: {
        id: client.id,
        name: client.name,
        email: client.email,
        phone: client.phone,
        referralCode: client.referralCode,
      },
      message: referredById 
        ? 'Cliente creado correctamente. ¡Gracias por usar un código de referido!' 
        : 'Cliente creado correctamente'
    })
  } catch (error) {
    console.error('Error creating client:', error)
    return NextResponse.json(
      { error: 'Error al crear cliente' },
      { status: 500 }
    )
  }
}

// GET para verificar si un código de referido es válido
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')

    if (!code) {
      return NextResponse.json(
        { error: 'Código de referido requerido' },
        { status: 400 }
      )
    }

    const client = await prisma.client.findUnique({
      where: { referralCode: code },
      select: {
        id: true,
        name: true,
        email: true,
      }
    })

    if (!client) {
      return NextResponse.json(
        { valid: false, error: 'Código de referido no válido' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      valid: true,
      referrerName: client.name
    })
  } catch (error) {
    console.error('Error validating referral code:', error)
    return NextResponse.json(
      { error: 'Error al validar código de referido' },
      { status: 500 }
    )
  }
}
