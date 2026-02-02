# Guía de Arquitectura del Proyecto DLA Viajes y Envíos

## 📋 Información General

- **Nombre del Proyecto:** DLA Viajes y Envíos
- **Tipo de Aplicación:** E-commerce / Catálogo de productos
- **Framework:** Next.js 16.0.7 (App Router)
- **Lenguaje:** TypeScript 5
- **Estilo:** Tailwind CSS 4.1
- **Fecha de Creación:** Enero 2026
- **URL de Producción:** https://dlaenvios.com

---

## 🏗️ Estructura del Proyecto

```
foodie-wagon/
├── app/                          # Next.js App Router
│   ├── layout.tsx                # Root layout con metadata global
│   ├── page.tsx                  # Homepage principal
│   ├── globals.css               # Estilos globales y variables CSS
│   ├── impressum/                # Página legal (alemán)
│   │   └── page.tsx
│   ├── datenschutz/              # Política de privacidad (GDPR)
│   │   └── page.tsx
│   ├── agb/                      # Términos y condiciones
│   │   └── page.tsx
│   └── product/
│       └── [id]/
│           └── page.tsx          # Página de detalle de producto
│
├── components/                   # Componentes React
│   ├── header.tsx                # Navegación principal (sticky)
│   ├── hero.tsx                  # Sección hero con CTA
│   ├── menu-section.tsx          # Sección del menú/productos
│   ├── menu-category.tsx         # Tarjetas de productos
│   ├── location-section.tsx      # Información de ubicación
│   ├── contact-section.tsx       # Sección de contacto
│   ├── footer.tsx                # Footer con enlaces legales
│   ├── sticky-cta.tsx            # Barra CTA fija
│   ├── burger-3d.tsx             # Componente 3D (React Three Fiber)
│   ├── theme-provider.tsx        # Provider de temas
│   └── ui/                       # Componentes UI (shadcn/ui style)
│       ├── button.tsx
│       ├── card.tsx
│       ├── dialog.tsx
│       ├── sheet.tsx
│       ├── toast.tsx
│       ├── tabs.tsx
│       └── ... (más componentes)
│
├── hooks/                        # Custom React Hooks
│   ├── use-mobile.ts
│   └── use-toast.ts
│
├── lib/                          # Utilidades
│   └── utils.ts                  # Función cn() para classnames
│
├── public/                       # Assets estáticos
│   ├── graphics/                 # Logos, iconos SVG
│   ├── products/                 # Imágenes de productos
│   │   ├── CajasSE/              # Cajas Super Express
│   │   └── Electronics/          # Electrónicos
│   ├── burgers/                  # (Legacy) Imágenes de burgers
│   ├── Appetizers/               # (Legacy) Aperitivos
│   ├── Fried-Chicken/            # (Legacy) Pollo frito
│   ├── robots.txt                # Directivas SEO
│   ├── sitemap.xml               # Mapa del sitio
│   └── site.webmanifest          # PWA manifest
│
├── styles/                       # Estilos adicionales
│   └── globals.css               # Copia de app/globals.css
│
├── package.json                  # Dependencias y scripts
├── next.config.mjs               # Configuración de Next.js
├── tsconfig.json                 # Configuración TypeScript
├── tailwind.config.ts            # Configuración Tailwind
├── postcss.config.mjs            # Configuración PostCSS
└── docker-compose.yml            # Docker configuration

```

---

## 🎨 Sistema de Diseño

### Paleta de Colores

| Variable CSS | Valor | Uso |
|--------------|-------|-----|
| `--background` | `oklch(0.12 0.005 250)` | Fondo principal (oscuro) |
| `--foreground` | `oklch(0.95 0.01 90)` | Texto principal (blanco) |
| `--primary` | `oklch(0.82 0.165 85)` | **Amarillo/Dorado** - Headers, CTAs, branding |
| `--primary-foreground` | `oklch(0.12 0.005 250)` | Texto sobre primary |
| `--card` | `oklch(0.15 0.005 250)` | Fondo de tarjetas |
| `--accent` | `oklch(0.65 0.2 30)` | Naranja - Destacados |
| `--border` | `oklch(0.28 0.01 250)` | Bordes |
| `--muted` | `oklch(0.22 0.01 250)` | Elementos secundarios |

### Tipografía

| Font | Uso | weights |
|------|-----|---------|
| **Oswald** | Headings, navegación, botones | Bold, Black |
| **Playfair Display** | Serif para acentos | Regular |
| **Geist Mono** | Monospace | Regular |

### Breakpoints Responsive

```css
sm: 640px   /* Mobile landscape */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large desktop */
```

---

## 📦 Dependencias Principales

### Core
- `next` - Framework React 16.0.7
- `react` / `react-dom` 19.2.0
- `typescript` 5

### UI Components
- `@radix-ui/react-*` - Componentes accesibles (Dialog, Tabs, Toast, etc.)
- `lucide-react` - Iconos
- `iconoir-react` - Iconos alternativos
- `class-variance-authority` - Variantes de componentes
- `clsx` / `tailwind-merge` - Utilidades CSS
- `tailwindcss-animate` - Animaciones

### Funcionalidad
- `next-themes` - Theme provider (dark mode)
- `@vercel/analytics` - Analytics
- `@react-three/fiber` / `@react-three/drei` - Gráficos 3D
- `sonner` - Toasts modernos
- `react-hook-form` / `zod` - Formularios

---

## 🔧 Configuración

### next.config.mjs
```javascript
{
  typescript: { ignoreBuildErrors: true },
  images: { unoptimized: true }
}
```

### Variables de Entorno
**Archivo:** `.env`
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/dla_db?schema=public"
```

---

## 📄 Páginas del Sitio

### 1. Homepage (`app/page.tsx`)
- **Components principales:** Header, Hero, MenuSection, LocationSection, ContactSection, Footer, StickyCTA
- **SEO:** JSON-LD structured data (Restaurant, FoodEstablishment, LocalBusiness, WebSite)
- **Categorías mostradas:**
  - Cajas Super Express
  - Electrónicos
  - Motos

### 2. Página de Producto (`app/product/[id]/page.tsx`)
- **Función:** Muestra detalles de un producto específico
- **Routing:** Dinámico basado en ID
- **Accesible desde:** Clic en tarjeta de producto en MenuSection

### 3. Impressum (`app/impressum/page.tsx`)
- **Requisito legal alemán** - Información de empresa (§5 TMG)

### 4. Datenschutz (`app/datenschutz/page.tsx`)
- **Cumplimiento GDPR** - Política de privacidad

### 5. AGB (`app/agb/page.tsx`)
- **Términos y condiciones** de uso

---

## 🧩 Componentes Principales

### Header (`components/header.tsx`)
- **Tipo:** Client Component (`"use client"`)
- **Funcionalidad:** Navegación responsive con menú móvil
- **Elementos:**
  - Logo con eslogan
  - Botón "Rastrear envío" (enlace externo)
  - Navegación desktop (Envíos, Cajas Super Express, Electrónicos)
  - Indicador de ubicación (Orlando)
  - Menú hamburguesa móvil

### MenuSection (`components/menu-section.tsx`)
- **Tipo:** Client Component
- **State:** `activeCategory` - categoría seleccionada
- **Categorías:**
  - `beef` → Cajas Super Express
  - `chicken` → Electrónicos
  - `motos` → Motos
- **Data:** `menuItems` object con arrays por categoría

### MenuCategory (`components/menu-category.tsx`)
- **Props:** `items: MenuItem[]`
- **Render:** Grid de tarjetas de productos
- **Características:**
  - Imagen flotante con efecto hover
  - Badge de precio
  - Indicador de nivel de picor (spiceLevel)
  - Enlace a página de detalle `/product/{id}`

### MenuItem Interface
```typescript
interface MenuItem {
  id: string
  name: string
  price: string
  description: string
  spiceLevel?: number  // 0-3
  image?: string
}
```

---

## 🎬 Animaciones CSS

### keyframes definidos en `app/globals.css`

```css
@keyframes float {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-20px); }
}

@keyframes truck-bounce {
  0%, 100% { transform: translateY(0px); }
  50% { transform: translateY(-8px); }
}
```

**Clases de utilidad:** `.animate-float`, `.animate-truck-bounce`

---

## 🔄 Flujo de Datos

```
┌─────────────────────────────────────────────────────────────┐
│                    app/page.tsx                             │
│                    (Server Component)                       │
├─────────────────────────────────────────────────────────────┤
│                              │                               │
│                              ▼                               │
│                    ┌─────────────────┐                      │
│                    │   Header        │                      │
│                    │   Hero          │                      │
│                    │   MenuSection   │◄─── menuItems       │
│                    │   (Client)      │      (hardcoded)    │
│                    │                 │                      │
│                    └────────┬────────┘                      │
│                             │                               │
│                             ▼                               │
│              ┌──────────────────────────────┐              │
│              │    MenuCategory              │              │
│              │    (Link a /product/[id])    │              │
│              └──────────────┬───────────────┘              │
│                             │                               │
│                             ▼                               │
│              ┌──────────────────────────────┐              │
│              │   app/product/[id]/page.tsx  │              │
│              │   (Dinamic Route)            │              │
│              └──────────────────────────────┘              │
└─────────────────────────────────────────────────────────────┘
```

---

## 📝 Cómo Agregar Nuevos Productos

### Nuevo Método (con Base de Datos)

#### Paso 1: Agregar imagen en `public/products/`
```
public/products/CajasSE/nuevo-producto.svg
```

#### Paso 2: Insertar producto en la base de datos
Puedes usar **Prisma Studio** para insertar datos visualmente:
```bash
pnpm prisma:studio
```
O ejecutar un script de migración:
```bash
pnpm prisma migrate dev --name add_nuevo_producto
```

#### Paso 3: El producto aparece automáticamente
La API `/api/products` devuelve todos los productos de la base de datos.

---

## 🗄️ Backend (PostgreSQL + Prisma)

### Stack Tecnológico
- **Base de Datos:** PostgreSQL 16
- **ORM:** Prisma ORM
- **API:** Next.js API Routes (Route Handlers)

### Archivos del Backend
| Archivo | Descripción |
|---------|-------------|
| `.env` | Variables de entorno (DATABASE_URL) |
| `prisma/schema.prisma` | Definición del modelo de datos |
| `prisma/seed.ts` | Datos iniciales |
| `lib/prisma.ts` | Prisma Client singleton |
| `app/api/products/route.ts` | GET /api/products |
| `app/api/products/[id]/route.ts` | GET /api/products/[id] |
| `app/api/categories/route.ts` | GET /api/categories |
| `hooks/use-products.ts` | Hooks para consumir la API |

### Modelos de Datos

#### Category
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | String | ID único (cuid) |
| name | String | Nombre de la categoría |
| slug | String | Slug único |
| icon | String? | Icono associated |
| sortOrder | Int | Orden de visualización |

#### Product
| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | String | ID único (cuid) |
| name | String | Nombre del producto |
| slug | String | Slug único |
| description | String? | Descripción |
| price | Decimal | Precio (2 decimales) |
| image | String? | Ruta de imagen |
| spiceLevel | Int | Nivel de picor (0-3) |
| available | Boolean | Disponibilidad |
| categoryId | String | FK a Category |

### API Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/products` | Obtener todos los productos |
| GET | `/api/products?category=beef` | Filtrar por categoría |
| GET | `/api/products/[id]` | Obtener producto por ID |
| GET | `/api/categories` | Obtener todas las categorías |

### Configuración de la Base de Datos

```bash
# 1. Instalar dependencias
pnpm add prisma --save-dev
pnpm add @prisma/client

# 2. Configurar .env con tu PostgreSQL
# DATABASE_URL="postgresql://user:pass@localhost:5432/dla_db"

# 3. Generar cliente Prisma
pnpm prisma generate

# 4. Crear migraciones
pnpm prisma migrate dev --name init

# 5. Poblar datos iniciales
pnpm prisma:seed

# 6. Abrir Prisma Studio (GUI)
pnpm prisma:studio
```

Ver también: [prisma/SETUP.md](prisma/SETUP.md)

---

## 🔧 Scripts Disponibles

```bash
pnpm dev          # Servidor de desarrollo
pnpm build        # Build para producción
pnpm start        # Servidor de producción
pnpm lint         # Ejecutar ESLint
```

---

## 🚀 Despliegue

- **Plataforma:** Vercel
- **URL:** https://dlaenvios.com
- **CDN:** Automático
- **SSL:** Habilitado

---

## 📊 SEO y Metadata

### Metadata Global (`app/layout.tsx`)
- Title template: `%s | DLA Viajes y envíos`
- Keywords: 20+ keywords en alemán
- Open Graph: Configurado con imagen y descripción
- JSON-LD: Restaurant, FoodEstablishment, LocalBusiness, WebSite

### Robots
- Indexación permitida
- Permite crawlers de IA (GPT, Claude, Perplexity)

---

## 🔒 Cumplimiento Legal

- ✅ **Impressum** - Información de empresa
- ✅ **Datenschutz** - GDPR compliant
- ✅ **AGB** - Términos de servicio
- ✅ **Cookies** - Sin tracking sin consentimiento

---

## 📌 Notas para Desarrollo

1. **Client vs Server Components**
   - Usar `"use client"` solo cuando sea necesario (state, efectos, eventos)
   - Mantener páginas como Server Components cuando sea posible

2. **Imágenes**
   - Ubicación: `public/products/`
   - Formato preferido: SVG (escalables)
   - WebP para fotos (optimizado)

3. **Estilos**
   - Usar variables CSS para consistencia
   - Preferir clases de Tailwind sobre CSS personalizado
   - Colores primarios en `--primary`

4. **Accesibilidad**
   - Labels en botones de navegación
   - Alt text en imágenes
   - Contraste de colores WCAG AA

---

## 🔄 Mantenimiento de esta Guía

Esta guía debe actualizarse cuando:
- Se agreguen nuevas páginas
- Se añadan nuevas categorías de productos
- Se modifique la estructura del proyecto
- Se cambien dependencias principales
- Se añadan nuevos componentes reutilizables

**Última actualización:** Enero 2026
