# Plan de Implementación: Backend con PostgreSQL + Prisma + Next.js

## 🎯 Objetivo

Migrar los productos hardcodeados en [`components/menu-section.tsx`](components/menu-section.tsx:14) a una base de datos PostgreSQL 16 usando Prisma ORM con Next.js API Routes.

---

## 📋 Resumen del Plan

```mermaid
graph TD
    A[Instalar Dependencias] --> B[Configurar Prisma]
    B --> C[Definir Schema]
    C --> D[Crear Migración]
    D --> E[Crear API Routes]
    E --> F[Crear Prisma Client]
    F --> G[Actualizar Frontend]
    G --> H[Testing]
```

---

## 🧩 Arquitectura del Backend

```
┌─────────────────────────────────────────────────────────────┐
│                    Next.js Frontend                         │
│                     (Port 3000)                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│    app/                                                     │
│    ├── api/                   ┌─────────────────────────┐  │
│    │   ├── products/          │      Prisma ORM         │  │
│    │   │   ├── route.ts       │                         │  │
│    │   │   └── [id]/          │  ┌───────────────────┐  │  │
│    │   │       route.ts       │  │   PostgreSQL 16   │  │  │
│    │   └── categories/        │  │   (Docker)        │  │  │
│    │       └── route.ts       │  └───────────────────┘  │  │
│    └── product/[id]/          │         │               │  │
│        └── page.tsx           │         │               │  │
│                              │         ▼               │  │
│                             ┌─────────────────────┐    │  │
│                             │    lib/prisma.ts    │    │  │
│                             │  (Prisma Client)    │    │  │
│                             └─────────────────────┘    │  │
│                                                         │  │
└─────────────────────────────────────────────────────────┴──┘
```

---

## 📦 Dependencias a Instalar

```bash
pnpm add prisma --save-dev
pnpm add @prisma/client
```

---

## 🚀 Pasos de Implementación

### Paso 1: Inicializar Prisma

```bash
# Inicializar Prisma con PostgreSQL
pnpm prisma init --datasource-provider postgresql
```

**Archivo creado:** `prisma/schema.prisma`

### Paso 2: Definir el Schema de Prisma

```prisma
// prisma/schema.prisma

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

// Categoría de productos (Cajas Super Express, Electrónicos, Motos)
model Category {
  id          String    @id @default(cuid())
  name        String    // ej: "Cajas Super Express"
  slug        String    @unique // ej: "cajas-super-express"
  description String?
  icon        String?   // Nombre del ícono a usar
  sortOrder   Int       @default(0)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  
  products    Product[]
}

// Producto individual
model Product {
  id          String    @id @default(cuid())
  name        String
  slug        String    @unique
  description String?
  price       Decimal   @db.Decimal(10, 2) // Precio con 2 decimales
  image       String?
  spiceLevel  Int       @default(0) // 0-3 para nivel de picor
  available   Boolean   @default(true)
  sortOrder   Int       @default(0)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  
  categoryId  String
  category    Category  @relation(fields: [categoryId], references: [id], onDelete: Cascade)
  
  @@index([categoryId])
}
```

### Paso 3: Configurar Variables de Entorno

```env
# .env
DATABASE_URL="postgresql://postgres:password@localhost:5432/dla_db?schema=public"
```

### Paso 4: Crear Prisma Client Singleton

```typescript
// lib/prisma.ts
import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma = globalForPrisma.prisma ?? new PrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
```

### Paso 5: Crear API Routes

#### GET Todos los Productos (con filtros)
```typescript
// app/api/products/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const category = searchParams.get('category')
  
  const products = await prisma.product.findMany({
    where: category ? {
      category: { slug: category }
    } : undefined,
    include: { category: true },
    orderBy: { sortOrder: 'asc' }
  })
  
  return NextResponse.json(products)
}
```

#### GET Producto por ID
```typescript
// app/api/products/[id]/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  
  const product = await prisma.product.findUnique({
    where: { id },
    include: { category: true }
  })
  
  if (!product) {
    return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 })
  }
  
  return NextResponse.json(product)
}
```

#### GET Categorías
```typescript
// app/api/categories/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const categories = await prisma.category.findMany({
    include: {
      _count: { select: { products: true } }
    },
    orderBy: { sortOrder: 'asc' }
  })
  
  return NextResponse.json(categories)
}
```

### Paso 6: Actualizar Frontend

#### Crear Hook Personalizado para Productos
```typescript
// hooks/use-products.ts
import { useState, useEffect } from 'react'

interface Product {
  id: string
  name: string
  description: string | null
  price: string
  image: string | null
  spiceLevel: number
  category: { name: string; slug: string }
}

export function useProducts(categorySlug?: string) {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    async function fetchProducts() {
      try {
        const url = categorySlug 
          ? `/api/products?category=${categorySlug}`
          : '/api/products'
        const res = await fetch(url)
        const data = await res.json()
        setProducts(data)
      } catch (error) {
        console.error('Error fetching products:', error)
      } finally {
        setLoading(false)
      }
    }
    
    fetchProducts()
  }, [categorySlug])
  
  return { products, loading }
}
```

#### Actualizar MenuSection
- Reemplazar `menuItems` hardcodeado con datos de la API
- Usar el hook `useProducts`
- Manejar estados de carga y error

### Paso 7: Ejecutar Migración

```bash
# Crear migración inicial
pnpm prisma migrate dev --name init

# Generar Prisma Client
pnpm prisma generate
```

### Paso 8: Seed de Datos Iniciales

```typescript
// prisma/seed.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  // Crear categorías
  const categorias = await prisma.category.createMany({
    data: [
      { name: 'Cajas Super Express', slug: 'beef', icon: 'BoxIcon', sortOrder: 1 },
      { name: 'Electrónicos', slug: 'chicken', icon: 'ElectronicsChip', sortOrder: 2 },
      { name: 'Motos', slug: 'motos', icon: 'Cycling', sortOrder: 3 },
    ]
  })
  
  // Crear productos de ejemplo
  await prisma.product.createMany({
    data: [
      {
        name: 'Caja Super Express 1',
        slug: 'caja-se1',
        price: 125.24,
        image: '/products/CajasSE/cajaSE1.svg',
        spiceLevel: 0,
        categoryId: (await prisma.category.findUnique({ where: { slug: 'beef' } }))!.id
      },
      // ... más productos
    ]
  })
}

main()
  .catch((e) => console.error(e))
  .finally(async () => await prisma.$disconnect())
```

---

## 🔧 Comandos Útiles

```bash
# Desarrollo
pnpm prisma studio          # Abrir GUI de Prisma
pnpm prisma migrate dev     # Crear nueva migración
pnpm prisma generate        # Regenerar cliente

# Producción
pnpm prisma migrate deploy  # Aplicar migraciones
pnpm prisma db push         # Sincronizar schema (dev)
```

---

## 📁 Archivos a Modificar/Crear

| Archivo | Acción |
|---------|--------|
| `prisma/schema.prisma` | Crear |
| `.env` | Crear/Actualizar |
| `lib/prisma.ts` | Crear |
| `app/api/products/route.ts` | Crear |
| `app/api/products/[id]/route.ts` | Crear |
| `app/api/categories/route.ts` | Crear |
| `hooks/use-products.ts` | Crear |
| `components/menu-section.tsx` | Modificar |
| `prisma/seed.ts` | Opcional |

---

## ✅ Ventajas de Esta Implementación

1. **Type-safety completo** - Tipos inferidos de la base de datos
2. **Fácil migración** - Cambios en schema con un comando
3. **Performance** - Prisma optimiza queries automáticamente
4. **Mantenible** - Código organizado y documentado
5. **Escalable** - Easy de agregar nuevas entidades

---

**Nota:** La conexión a PostgreSQL en Docker debe estar configurada con la URL correcta en `.env` pointing a `localhost:5432` o el nombre del contenedor Docker.
