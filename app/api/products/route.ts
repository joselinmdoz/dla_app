import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const showAll = searchParams.get('showAll') === 'true'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const skip = (page - 1) * limit
    
    const where = {
      ...(category ? { category: { slug: category } } : {}),
      ...(showAll ? {} : { available: true })
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: { category: true },
        orderBy: { sortOrder: 'asc' },
        skip,
        take: limit
      }),
      prisma.product.count({ where })
    ])
    
    // Convertir Decimal a string para JSON
    const productsWithStringPrice = products.map(product => ({
      ...product,
      price: product.price.toString()
    }))
    
    return NextResponse.json({
      products: productsWithStringPrice,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
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

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { 
      name, 
      description, 
      price, 
      image, 
      available, 
      sortOrder, 
      categoryId
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
        image,
        available: available !== false,
        sortOrder: sortOrder || 0,
        categoryId,
      },
      include: { category: true },
    })

    return NextResponse.json({
      ...product,
      price: product.price.toString()
    })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json(
      { error: 'Error al crear producto' },
      { status: 500 }
    )
  }
}
