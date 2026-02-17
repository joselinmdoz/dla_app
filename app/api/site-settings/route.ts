import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

// GET - Obtener todas las configuraciones
export async function GET() {
  try {
    const settings = await prisma.siteSettings.findMany()
    
    // Convertir a objeto clave-valor
    const settingsObject = settings.reduce((acc, setting) => {
      acc[setting.key] = setting.value
      return acc
    }, {} as Record<string, string>)
    
    return NextResponse.json(settingsObject)
  } catch (error) {
    console.error('Error fetching site settings:', error)
    return NextResponse.json(
      { error: 'Error al obtener la configuración' },
      { status: 500 }
    )
  }
}

// POST - Actualizar configuración
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { key, value } = body

    if (!key) {
      return NextResponse.json(
        { error: 'Se requiere la clave de configuración' },
        { status: 400 }
      )
    }

    const setting = await prisma.siteSettings.upsert({
      where: { key },
      update: { value },
      create: { key, value }
    })

    return NextResponse.json(setting)
  } catch (error) {
    console.error('Error updating site setting:', error)
    return NextResponse.json(
      { error: 'Error al actualizar la configuración' },
      { status: 500 }
    )
  }
}

// PUT - Actualizar múltiples configuraciones
export async function PUT(request: NextRequest) {
  try {
    const settings: Record<string, string> = await request.json()

    // Usar transaction para actualizar todas las configuraciones
    await prisma.$transaction(
      Object.entries(settings).map(([key, value]) =>
        prisma.siteSettings.upsert({
          where: { key },
          update: { value },
          create: { key, value }
        })
      )
    )

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating site settings:', error)
    return NextResponse.json(
      { error: 'Error al actualizar las configuraciones' },
      { status: 500 }
    )
  }
}
