import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminPermissions } from '@/lib/admin-auth'
import { ADMIN_PERMISSIONS } from '@/lib/admin-permissions'

// GET /api/referrals - Estadísticas y lista de referidos para admin
export async function GET(request: NextRequest) {
  try {
    const auth = await requireAdminPermissions(request, [
      ADMIN_PERMISSIONS.CLIENTS_MANAGE,
      ADMIN_PERMISSIONS.DATA_MANAGE,
    ])
    if (!auth.authorized) return auth.response

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search')
    const skip = (page - 1) * limit

    // Construir filtro de búsqueda
    const where: any = {}
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { referralCode: { contains: search, mode: 'insensitive' } },
      ]
    }

    // Obtener clientes con información de referidos
    const [clients, total, stats] = await Promise.all([
      prisma.client.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          referralCode: true,
          createdAt: true,
          referredBy: {
            select: {
              id: true,
              name: true,
              referralCode: true,
            }
          },
          _count: {
            select: {
              referredClients: true
            }
          }
        }
      }),
      prisma.client.count({ where }),
      // Estadísticas generales
      prisma.client.aggregate({
        _count: {
          id: true,
        },
      }),
    ])

    // Contar clientes referidos
    const referredCount = await prisma.client.count({
      where: {
        referredById: { not: null }
      }
    })

    // Contar total de referidos - usando cliente como referidor
    const clientsWithReferrals = await prisma.client.findMany({
      where: {
        referredById: { not: null }
      },
      select: {
        _count: {
          select: { referredClients: true }
        }
      }
    })

    const totalReferrals = clientsWithReferrals.reduce(
      (acc, client) => acc + client._count.referredClients, 
      0
    )

    return NextResponse.json({
      data: clients,
      stats: {
        totalClients: stats._count.id || 0,
        totalReferredClients: referredCount,
        totalReferrals: totalReferrals,
        clientsWithReferrals: clients.filter(c => c._count.referredClients > 0).length,
      },
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error('Error fetching referrals:', error)
    return NextResponse.json(
      { error: 'Error al obtener datos de referidos' },
      { status: 500 }
    )
  }
}
