import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const items = await prisma.paymentCatalog.findMany({
      orderBy: { sortOrder: 'asc' }
    })

    return NextResponse.json({ data: items })
  } catch (error) {
    console.error('Error fetching payment methods:', error)
    return NextResponse.json(
      { error: 'Error al obtener métodos de pago' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, code, description, isActive, sortOrder } = body

    const item = await prisma.paymentCatalog.create({
      data: {
        name,
        code,
        description,
        isActive: isActive ?? true,
        sortOrder: sortOrder || 0
      }
    })

    return NextResponse.json({ data: item }, { status: 201 })
  } catch (error) {
    console.error('Error creating payment method:', error)
    return NextResponse.json(
      { error: 'Error al crear método de pago' },
      { status: 500 }
    )
  }
}
