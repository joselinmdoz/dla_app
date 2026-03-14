import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminPermissions } from '@/lib/admin-auth'
import { ADMIN_PERMISSIONS } from '@/lib/admin-permissions'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdminPermissions(request, [
      ADMIN_PERMISSIONS.CLIENTS_MANAGE,
      ADMIN_PERMISSIONS.DATA_MANAGE,
      ADMIN_PERMISSIONS.SHIPMENTS_MANAGE,
    ])
    if (!auth.authorized) return auth.response

    const { id } = await params
    const client = await prisma.client.findUnique({ where: { id } })

    if (!client) {
      return NextResponse.json(
        { error: 'Cliente no encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json(client)
  } catch (error) {
    console.error('Error fetching client:', error)
    return NextResponse.json(
      { error: 'Error al obtener cliente' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdminPermissions(request, [
      ADMIN_PERMISSIONS.CLIENTS_MANAGE,
      ADMIN_PERMISSIONS.DATA_MANAGE,
      ADMIN_PERMISSIONS.SHIPMENTS_MANAGE,
    ])
    if (!auth.authorized) return auth.response

    const { id } = await params
    const body = await request.json()
    const { name, email, phone, address, province, city, notes } = body

    const existingClient = await prisma.client.findUnique({ where: { id } })
    if (!existingClient) {
      return NextResponse.json(
        { error: 'Cliente no encontrado' },
        { status: 404 }
      )
    }

    if (email && email !== existingClient.email) {
      const emailInUse = await prisma.client.findUnique({ where: { email } })
      if (emailInUse) {
        return NextResponse.json(
          { error: 'Ya existe un cliente con este email' },
          { status: 400 }
        )
      }
    }

    const client = await prisma.client.update({
      where: { id },
      data: {
        name,
        email,
        phone,
        address,
        province,
        city,
        notes,
      },
    })

    return NextResponse.json(client)
  } catch (error) {
    console.error('Error updating client:', error)
    return NextResponse.json(
      { error: 'Error al actualizar cliente' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireAdminPermissions(request, [
      ADMIN_PERMISSIONS.CLIENTS_MANAGE,
      ADMIN_PERMISSIONS.DATA_MANAGE,
      ADMIN_PERMISSIONS.SHIPMENTS_MANAGE,
    ])
    if (!auth.authorized) return auth.response

    const { id } = await params

    const existingClient = await prisma.client.findUnique({ where: { id } })
    if (!existingClient) {
      return NextResponse.json(
        { error: 'Cliente no encontrado' },
        { status: 404 }
      )
    }

    await prisma.client.delete({ where: { id } })

    return NextResponse.json({ message: 'Cliente eliminado correctamente' })
  } catch (error) {
    console.error('Error deleting client:', error)
    return NextResponse.json(
      { error: 'Error al eliminar cliente' },
      { status: 500 }
    )
  }
}
