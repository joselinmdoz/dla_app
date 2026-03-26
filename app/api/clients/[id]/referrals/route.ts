import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/clients/[id]/referrals - Obtener referidos de un cliente
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const client = await prisma.client.findUnique({
      where: { id },
      include: {
        referredClients: {
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            createdAt: true,
          }
        },
        referredBy: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        }
      }
    })

    if (!client) {
      return NextResponse.json(
        { error: 'Cliente no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      client: {
        id: client.id,
        name: client.name,
        email: client.email,
        referralCode: client.referralCode,
      },
      referrer: client.referredBy,
      referrals: client.referredClients,
      stats: {
        totalReferrals: client.referredClients.length,
      }
    })
  } catch (error) {
    console.error('Error fetching referrals:', error)
    return NextResponse.json(
      { error: 'Error al obtener referidos' },
      { status: 500 }
    )
  }
}
