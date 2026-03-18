# Guía de Arquitectura del Proyecto DLA Viajes y Envíos

## 📋 Información General

- **Nombre del Proyecto:** DLA Viajes y Envíos
- **Tipo de Aplicación:** E-commerce / Catálogo de productos / Plataforma de gestión
- **Framework:** Next.js 16.0.7 (App Router)
- **Lenguaje:** TypeScript 5
- **Estilo:** Tailwind CSS 4.1
- **Base de Datos:** PostgreSQL 16 con Prisma ORM
- **Fecha de Creación:** Enero 2026
- **URL de Producción:** https://dlaenvios.com

---

## 🏗️ Estructura del Proyecto

```
foodie-wagon/
├── app/                          # Next.js App Router
│   ├── (public)/                 # Sitio público
│   │   ├── layout.tsx            # Root layout con metadata global
│   │   ├── page.tsx              # Homepage principal
│   │   ├── globals.css           # Estilos globales y variables CSS
│   │   ├── impressum/            # Página legal
│   │   ├── datenschutz/          # Política de privacidad
│   │   ├── agb/                  # Términos y condiciones
│   │   └── product/
│   │       └── [id]/
│   │           └── page.tsx      # Página de detalle de producto
│   │
│   ├── (admin)/                  # Panel de administración
│   │   ├── layout.tsx            # Layout con sidebar
│   │   ├── page.tsx              # Dashboard
│   │   ├── dashboard/            # Analytics
│   │   ├── shipments/            # Gestión de envíos
│   │   ├── products/             # Gestión de productos
│   │   ├── categories/           # Gestión de categorías
│   │   ├── clients/              # Gestión de clientes
│   │   ├── users/                # Gestión de usuarios
│   │   └── settings/             # Configuración
│   │
│   └── api/                      # API Routes
│       ├── products/
│       ├── shipments/
│       ├── users/
│       ├── auth/
│       └── categories/
│
├── components/                   # Componentes React
│   ├── header.tsx                # Navegación principal
│   ├── hero.tsx                  # Sección hero
│   ├── menu-section.tsx          # Sección del menú
│   ├── menu-category.tsx         # Tarjetas de productos
│   ├── footer.tsx                # Footer
│   ├── sidebar.tsx               # Sidebar del admin
│   ├── admin-layout.tsx          # Layout del panel admin
│   └── ui/                       # Componentes UI
│
├── hooks/                        # Custom React Hooks
│   ├── use-products.ts
│   ├── use-shipments.ts
│   ├── use-auth.ts
│   └── use-toast.ts
│
├── lib/                          # Utilidades
│   ├── prisma.ts                 # Prisma Client
│   ├── auth.ts                   # Configuración auth
│   └── utils.ts                  # Funciones helpers
│
├── docs/                         # Documentación del proyecto
│   ├── 01-architecture.md        # Este archivo
│   ├── 02-backend-plan.md
│   ├── 03-database-model.md
│   ├── 04-api-routes.md
│   └── 05-development-guide.md
│
├── prisma/                       # Prisma ORM
│   ├── schema.prisma             # Modelos de datos
│   ├── seed.ts                   # Datos iniciales
│   └── SETUP.md                  # Guía de configuración
│
├── public/                       # Assets estáticos
│   ├── graphics/                 # Logos, iconos SVG
│   ├── products/                 # Imágenes de productos
│   └── ...
│
└── docs/                         # Documentación adicional
```

---

## 🎨 Sistema de Diseño

### Paleta de Colores

| Variable CSS | Valor | Uso |
|--------------|-------|-----|
| `--background` | `oklch(0.12 0.005 250)` | Fondo principal (oscuro) |
| `--foreground` | `oklch(0.95 0.01 90)` | Texto principal (blanco) |
| `--primary` | `oklch(0.82 0.165 85)` | Amarillo/Dorado - Headers, CTAs |
| `--primary-foreground` | `oklch(0.12 0.005 250)` | Texto sobre primary |
| `--card` | `oklch(0.15 0.005 250)` | Fondo de tarjetas |
| `--accent` | `oklch(0.65 0.2 30)` | Naranja - Destacados |
| `--border` | `oklch(0.28 0.01 250)` | Bordes |

### Tipografía

| Font | Uso |
|------|-----|
| **Oswald** | Headings, navegación, botones |
| **Playfair Display** | Serif para acentos |
| **Geist Mono** | Monospace |

### Breakpoints Responsive

```css
sm: 640px   /* Mobile landscape */
md: 768px   /* Tablet */
lg: 1024px  /* Desktop */
xl: 1280px  /* Large desktop */
```

---

## 📦 Stack Tecnológico

### Core
- **Next.js 16.0.7** - Framework React
- **React 19.2.0** / **React DOM 19.2.0**
- **TypeScript 5** - Tipado estático
- **Tailwind CSS 4.1** - Estilos

### Base de Datos
- **PostgreSQL 16** - Base de datos relacional
- **Prisma ORM** - ORM con migraciones
- **PostgreSQL en Docker** - Contenedor para desarrollo

### UI Components
- **Radix UI** - Componentes accesibles
- **Lucide React** / **Iconoir React** - Iconos
- **Shadcn/ui style** - Componentes personalizados

### Autenticación y Estado
- **NextAuth.js** - Autenticación
- **React Context** - Estado global
- **React Hook Form** - Formularios

### Utilidades
- **clsx** / **tailwind-merge** - Clases CSS
- **zod** - Validación de esquemas
- **date-fns** - Fechas

---

## 🔧 Configuración

### next.config.mjs
```javascript
{
  typescript: { ignoreBuildErrors: true },
  images: { unoptimized: true }
}
```

### Variables de Entorno (.env)
```env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/dla_db?schema=public"

# Auth
NEXTAUTH_SECRET="tu-secret-aqui"
NEXTAUTH_URL="http://localhost:3000"

# OAuth (opcional)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""
```

---

## 📄 Estructura de Rutas

### Sitio Público `(public)/`
| Ruta | Archivo | Descripción |
|------|---------|-------------|
| `/` | `app/page.tsx` | Homepage |
| `/product/[id]` | `app/product/[id]/page.tsx` | Detalle producto |
| `/impressum` | `app/impressum/page.tsx` | Aviso legal |
| `/datenschutz` | `app/datenschutz/page.tsx` | Privacidad |
| `/agb` | `app/agb/page.tsx` | Términos |

### Panel Admin `(admin)/`
| Ruta | Descripción |
|------|-------------|
| `/admin` | Dashboard principal |
| `/admin/dashboard` | Analytics |
| `/admin/shipments` | Gestión de envíos |
| `/admin/products` | Gestión de productos |
| `/admin/categories` | Gestión de categorías |
| `/admin/clients` | Gestión de clientes |
| `/admin/users` | Gestión de usuarios |
| `/admin/settings` | Configuración |

---

## 🗄️ Base de Datos

### Modelos Principales

#### Users & Auth
- **User** - Usuarios del sistema
- **Role** - Roles (Admin, Manager, Operator, Viewer)
- **Permission** - Permisos granulares
- **RolePermission** - Relación roles-permisos

#### Catálogo
- **Category** - Categorías de productos
- **Product** - Productos/Servicios

#### Gestión de Envíos
- **Shipment** - Envíos con todos los campos
- **ShipmentProduct** - Productos por envío
- **ShipmentStatusHistory** - Historial de estados
- **Client** - Clientes
- **Province** - Provincias de Cuba
- **PaymentMethod** - Métodos de pago

#### Sistema
- **AuditLog** - Logs de auditoría

### Ver también
- [Modelado de Base de Datos](03-database-model.md)
- [Configuración de Prisma](04-prisma-setup.md)

---

## 🎬 Comandos de Desarrollo

```bash
# Desarrollo
pnpm dev                    # Servidor desarrollo
pnpm prisma:studio          # GUI Prisma
pnpm prisma:migrate         # Migraciones

# Build
pnpm build                  # Build producción
pnpm start                  # Servidor producción

# Base de datos
pnpm prisma:seed            # Poblar datos iniciales
pnpm db:setup               # Setup completo DB
```

---

## 🚀 Despliegue

- **Plataforma:** Vercel
- **URL:** https://dlaenvios.com
- **Base de Datos:** PostgreSQL en Docker/RDS
- **SSL:** Habilitado

---

## 📚 Documentación Relacionada

1. [01-Architecture](01-architecture.md) - Este documento
2. [02-Backend-Plan](02-backend-plan.md) - Plan de implementación backend
3. [03-Database-Model](03-database-model.md) - Modelado de datos
4. [04-Prisma-Setup](04-prisma-setup.md) - Guía de configuración Prisma
5. [05-API-Routes](05-api-routes.md) - Documentación de APIs
6. [06-Development-Guide](06-development-guide.md) - Guía de desarrollo

---

**Última actualización:** Enero 2026
