import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const items = await prisma.cargoCatalog.findMany({
      orderBy: { sortOrder: 'asc' }
    })

    return NextResponse.json({ data: items })
  } catch (error) {
    console.error('Error fetching cargo types:', error)
    return NextResponse.json(
      { error: 'Error al obtener tipos de mercancía' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, code, description, sortOrder } = body

    const item = await prisma.cargoCatalog.create({
      data: {
        name,
        code,
        description,
        sortOrder: sortOrder || 0
      }
    })

    return NextResponse.json({ data: item }, { status: 201 })
  } catch (error) {
    console.error('Error creating cargo type:', error)
    return NextResponse.json(
      { error: 'Error al crear tipo de mercancía' },
      { status: 500 }
    )
  }
}
