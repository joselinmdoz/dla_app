import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { requireAdminPermissions } from '@/lib/admin-auth'
import { ADMIN_PERMISSIONS } from '@/lib/admin-permissions'
import { resolveProductImage } from '@/lib/product-image'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const showAllRequested = searchParams.get('showAll') === 'true'
    const pageParam = searchParams.get('page')
    const limitParam = searchParams.get('limit')
    const parsedPage = Number.parseInt(pageParam || '1', 10)
    const parsedLimit = limitParam ? Number.parseInt(limitParam, 10) : NaN
    const usePagination = Number.isFinite(parsedLimit) && parsedLimit > 0
    const page = Number.isFinite(parsedPage) && parsedPage > 0 ? parsedPage : 1
    const limit = usePagination ? parsedLimit : undefined
    const skip = usePagination && limit ? (page - 1) * limit : undefined

    let showAll = false
    if (showAllRequested) {
      const auth = await requireAdminPermissions(request, [
        ADMIN_PERMISSIONS.PRODUCTS_MANAGE,
        ADMIN_PERMISSIONS.DATA_MANAGE,
      ])
      showAll = auth.authorized
    }
    
    const where = {
      ...(category ? { category: { slug: category } } : {}),
      ...(showAll ? {} : { available: true })
    }

    const products = await prisma.product.findMany({
      where,
      include: { category: true },
      orderBy: { sortOrder: 'asc' },
      ...(usePagination ? { skip, take: limit } : {}),
    })
    const total = usePagination ? await prisma.product.count({ where }) : products.length
    
    // Convertir Decimal a string para JSON
    const productsWithStringPrice = products.map(product => ({
      ...product,
      price: product.price.toString(),
      costPrice: product.costPrice ? product.costPrice.toString() : null,
      image: resolveProductImage(product.image),
      imagePreviewUrl: `/api/products/${product.id}/image?v=${encodeURIComponent(product.updatedAt.toISOString())}`,
    }))
    
    return NextResponse.json({
      products: productsWithStringPrice,
      pagination: {
        page,
        limit: limit ?? productsWithStringPrice.length,
        total,
        totalPages: usePagination && limit ? Math.ceil(total / limit) : 1
      }
    })
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: 'Error al obtener productos' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await requireAdminPermissions(request, [
      ADMIN_PERMISSIONS.PRODUCTS_MANAGE,
      ADMIN_PERMISSIONS.DATA_MANAGE,
    ])
    if (!auth.authorized) return auth.response

    const body = await request.json()
    const { 
      name, 
      description, 
      price, 
      costPrice,
      image, 
      spiceLevel,
      available, 
      sortOrder, 
      categoryId,
      content
    } = body

    if (!name || !price || !categoryId) {
      return NextResponse.json(
        { error: 'Nombre, precio y categoría son requeridos' },
        { status: 400 }
      )
    }

    // Generar slug único
    let slug = name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
    const existingWithSlug = await prisma.product.findUnique({ where: { slug } })
    if (existingWithSlug) {
      slug = `${slug}-${Date.now()}`
    }

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        price: parseFloat(price),
        costPrice: costPrice !== null && costPrice !== undefined && costPrice !== ''
          ? parseFloat(costPrice.toString())
          : null,
        image,
        spiceLevel:
          spiceLevel !== null && spiceLevel !== undefined && spiceLevel !== ''
            ? Number(spiceLevel)
            : 0,
        available: available !== false,
        sortOrder: sortOrder || 0,
        content: content ?? null,
        categoryId,
      },
      include: { category: true },
    })

    return NextResponse.json({
      ...product,
      price: product.price.toString(),
      costPrice: product.costPrice ? product.costPrice.toString() : null,
      image: resolveProductImage(product.image),
      imagePreviewUrl: `/api/products/${product.id}/image?v=${encodeURIComponent(product.updatedAt.toISOString())}`,
    })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json(
      { error: 'Error al crear producto' },
      { status: 500 }
    )
  }
}
