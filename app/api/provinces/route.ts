import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const items = await prisma.province.findMany({
      orderBy: { sortOrder: 'asc' }
    })

    return NextResponse.json({ data: items })
  } catch (error) {
    console.error('Error fetching provinces:', error)
    return NextResponse.json(
      { error: 'Error al obtener provincias' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, code, sortOrder } = body

    const item = await prisma.province.create({
      data: {
        name,
        code,
        sortOrder: sortOrder || 0
      }
    })

    return NextResponse.json({ data: item }, { status: 201 })
  } catch (error) {
    console.error('Error creating province:', error)
    return NextResponse.json(
      { error: 'Error al crear provincia' },
      { status: 500 }
    )
  }
}
