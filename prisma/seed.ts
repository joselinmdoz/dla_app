import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Limpiar datos existentes
  await prisma.product.deleteMany()
  await prisma.category.deleteMany()

  // Crear categorías
  console.log('📦 Creating categories...')
  const categoryBeef = await prisma.category.create({
    data: {
      name: 'Cajas Super Express',
      slug: 'beef',
      icon: 'BoxIcon',
      sortOrder: 1,
    }
  })

  const categoryChicken = await prisma.category.create({
    data: {
      name: 'Electrónicos',
      slug: 'chicken',
      icon: 'ElectronicsChip',
      sortOrder: 2,
    }
  })

  const categoryMotos = await prisma.category.create({
    data: {
      name: 'Motos',
      slug: 'motos',
      icon: 'Cycling',
      sortOrder: 3,
    }
  })

  // Crear productos de Cajas Super Express
  console.log('🍔 Creating products...')
  await prisma.product.createMany({
    data: [
      {
        name: 'Caja Super Express 1',
        slug: 'caja-se1',
        price: 125.24,
        image: '/products/CajasSE/cajaSE1.svg',
        spiceLevel: 0,
        categoryId: categoryBeef.id,
        sortOrder: 1,
      },
      {
        name: 'Caja Super Express 2',
        slug: 'caja-se2',
        price: 162.84,
        image: '/products/CajasSE/cajaSE2.svg',
        spiceLevel: 0,
        categoryId: categoryBeef.id,
        sortOrder: 2,
      },
      {
        name: 'Caja Super Express 3',
        slug: 'caja-se3',
        price: 157.36,
        image: '/products/CajasSE/cajaSE3.svg',
        spiceLevel: 0,
        categoryId: categoryBeef.id,
        sortOrder: 3,
      },
    ]
  })

  // Crear productos de Electrónicos
  await prisma.product.createMany({
    data: [
      {
        name: 'EcoFlow Delta 2',
        slug: 'ecoflow-delta-2',
        price: 599.00,
        description: 'Estación de Energía Portátil (1800W - 2700W Pico)',
        image: '/products/Electronics/ecoflowd2.svg',
        spiceLevel: 0,
        categoryId: categoryChicken.id,
        sortOrder: 1,
      },
      {
        name: 'EcoFlow Delta 3',
        slug: 'ecoflow-delta-3',
        price: 619.00,
        image: '/products/Electronics/ecoflowd3.png',
        spiceLevel: 0,
        categoryId: categoryChicken.id,
        sortOrder: 2,
      },
      {
        name: 'Olla Reyna',
        slug: 'olla-reyna',
        price: 70.00,
        image: '/products/Electronics/ollareyna.svg',
        spiceLevel: 0,
        categoryId: categoryChicken.id,
        sortOrder: 3,
      },
      {
        name: 'Olla Arrocera',
        slug: 'olla-arrocera',
        price: 42.00,
        image: '/products/Electronics/ollaarrocera.svg',
        spiceLevel: 0,
        categoryId: categoryChicken.id,
        sortOrder: 4,
      },
      {
        name: 'Ventilador de Pie',
        slug: 'ventilador-pie',
        price: 55.00,
        image: '/products/Electronics/ventilador.svg',
        spiceLevel: 0,
        categoryId: categoryChicken.id,
        sortOrder: 5,
      },
      {
        name: 'Nevera',
        slug: 'nevera',
        price: 310.00,
        image: '/products/Electronics/nevera.svg',
        spiceLevel: 0,
        categoryId: categoryChicken.id,
        sortOrder: 6,
      },
      {
        name: 'Aire Acondicionado Split',
        slug: 'aire-split',
        price: 330.00,
        image: '/products/Electronics/split.svg',
        spiceLevel: 0,
        categoryId: categoryChicken.id,
        sortOrder: 7,
      },
      {
        name: 'Refrigerador 200L-SAX-D195F',
        slug: 'refrigerador-200l',
        price: 380.00,
        image: '/products/Electronics/refrigerador.svg',
        spiceLevel: 0,
        categoryId: categoryChicken.id,
        sortOrder: 8,
      },
    ]
  })

  console.log('✅ Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
