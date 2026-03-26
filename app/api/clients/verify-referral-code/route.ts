import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/clients/verify-referral-code - Verificar si un código de referido es válido
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
        { error: 'Código de referido inválido' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      client: {
        id: client.id,
        name: client.name,
        email: client.email,
      }
    })
  } catch (error) {
    console.error('Error verifying referral code:', error)
    return NextResponse.json(
      { error: 'Error al verificar código de referido' },
      { status: 500 }
    )
  }
}
