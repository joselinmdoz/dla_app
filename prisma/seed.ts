import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Limpiar datos existentes
  await prisma.shipmentProduct.deleteMany()
  await prisma.shipment.deleteMany()
  await prisma.product.deleteMany()
  await prisma.category.deleteMany()
  await prisma.shippingType.deleteMany()
  await prisma.cargoCatalog.deleteMany()
  await prisma.province.deleteMany()
  await prisma.paymentCatalog.deleteMany()
  await prisma.client.deleteMany()

  // Crear ShippingTypes
  console.log('🚢 Creating shipping types...')
  await prisma.shippingType.createMany({
    data: [
      { name: 'Marítimo', code: 'MARITIMO', sortOrder: 1 },
      { name: 'Aéreo', code: 'AEREO', sortOrder: 2 },
      { name: 'Terrestre', code: 'TERRESTRE', sortOrder: 3 },
    ]
  })

  // Crear CargoCatalog
  console.log('📦 Creating cargo types...')
  await prisma.cargoCatalog.createMany({
    data: [
      { name: 'Miscelánea', code: 'MISCELANEA', sortOrder: 1 },
      { name: 'Duradero', code: 'DURADERO', sortOrder: 2 },
    ]
  })

  // Crear Provinces (Cuba)
  console.log('🗺️ Creating provinces...')
  await prisma.province.createMany({
    data: [
      { name: 'Pinar del Río', code: 'PR', sortOrder: 1 },
      { name: 'Artemisa', code: 'AR', sortOrder: 2 },
      { name: 'La Habana', code: 'LH', sortOrder: 3 },
      { name: 'Mayabeque', code: 'MJ', sortOrder: 4 },
      { name: 'Matanzas', code: 'MT', sortOrder: 5 },
      { name: 'Cienfuegos', code: 'CF', sortOrder: 6 },
      { name: 'Villa Clara', code: 'VC', sortOrder: 7 },
      { name: 'San Antonio de los Baños', code: 'SB', sortOrder: 8 },
      { name: 'Camagüey', code: 'CM', sortOrder: 9 },
      { name: 'Las Tunas', code: 'LT', sortOrder: 10 },
      { name: 'Holguín', code: 'HG', sortOrder: 11 },
      { name: 'Granma', code: 'GR', sortOrder: 12 },
      { name: 'Santiago de Cuba', code: 'SC', sortOrder: 13 },
      { name: 'Guantánamo', code: 'GT', sortOrder: 14 },
    ]
  })

  // Crear PaymentCatalog
  console.log('💳 Creating payment methods...')
  await prisma.paymentCatalog.createMany({
    data: [
      { name: 'Cash', code: 'CASH', sortOrder: 1 },
      { name: 'Zelle', code: 'ZELLE', sortOrder: 2 },
      { name: 'Tarjetas', code: 'TARJETAS', sortOrder: 3 },
      { name: 'Transferencia', code: 'TRANSFERENCIA', sortOrder: 4 },
    ]
  })

  // Crear categorías
  console.log('🏷️ Creating categories...')
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
