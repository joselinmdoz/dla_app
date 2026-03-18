# 📚 Índice de Documentación del Proyecto

> Documentación completa del proyecto DLA Viajes y Envíos

---

## 📖 Guías Principales

| # | Documento | Descripción |
|---|-----------|-------------|
| 01 | [Architecture](01-architecture.md) | Arquitectura general del proyecto, stack tecnológico, estructura de carpetas |
| 02 | [Backend Plan](02-backend-plan.md) | Plan de implementación del backend con PostgreSQL y Prisma |
| 03 | [Database Model](03-database-model.md) | Modelado completo de la base de datos |
| 04 | [Prisma Setup](04-prisma-setup.md) | Guía de configuración de Prisma y PostgreSQL |
| 05 | [API Routes](05-api-routes.md) | Documentación de los endpoints de la API |
| 06 | [Development Guide](06-development-guide.md) | Guía para desarrolladores |

---

## 🗂️ Estructura de la Documentación

```
docs/
├── SUMMARY.md                    # Este índice
├── 01-architecture.md            # Arquitectura del proyecto
├── 02-backend-plan.md            # Plan del backend
├── 03-database-model.md          # Modelado de datos
├── 04-prisma-setup.md            # Configuración Prisma
├── 05-api-routes.md              # Documentación API
├── 06-development-guide.md       # Guía de desarrollo
│
├── adming/
│   └── 01-admin-panel.md         # Panel de administración
│
└── frontend/
    ├── 01-components.md          # Componentes del frontend
    ├── 02-theming.md             # Sistema de diseño
    └── 03-responsive-design.md   # Diseño responsive
```

---

## 🚀 Inicio Rápido

### 1. Clonar e instalar dependencias
```bash
git clone <repo-url>
cd foodie-wagon
pnpm install
```

### 2. Configurar base de datos
```bash
# Configurar .env con DATABASE_URL
cp .env.example .env

# Ejecutar migraciones
pnpm prisma migrate dev

# Poblar datos iniciales
pnpm prisma:seed
```

### 3. Iniciar servidor de desarrollo
```bash
pnpm dev
```

### 4. Acceder a la documentación
- Local: http://localhost:3000/docs
- API: http://localhost:3000/api/docs

---

## 📋 Modelos de Datos

```
┌─────────────────────────────────────────────────────────────┐
│                    USUARIOS Y AUTENTICACIÓN                  │
│  User ──► Role ──► Permission                               │
│     │                                                    │
│     └──► Shipment ──► Client                               │
│                  ├──► Province                             │
│                  ├──► PaymentMethod                        │
│                  └──► ShipmentProduct ──► Product          │
│                              └──► Category                 │
└─────────────────────────────────────────────────────────────┘
```

**Ver:** [Database Model](03-database-model.md)

---

## 🔑 Roles y Permisos

| Rol | Descripción | Acceso |
|-----|-------------|--------|
| **Admin** | Administrador completo | Todos los módulos |
| **Manager** | Gestor | Envíos, productos, clientes, reportes |
| **Operator** | Operador | Crear/editar envíos, ver productos |
| **Viewer** | Solo lectura | Ver datos sin modificar |

**Ver:** [Database Model - Sistema de Permisos](03-database-model.md#-sistema-de-permisos)

---

## 📊 Dashboard

El panel de administración incluye:

- **Métricas principales:** Total envíos, pendientes, en tránsito, entregados
- **Ingresos:** Ganancias por período
- **Envíos por tipo:** Marítimo vs Aéreo
- **Envíos por destino:** Distribución por provincia
- **Actividad reciente:** Logs de auditoría

---

## 🌐 Rutas del API

### Endpoints Públicos
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/api/products` | Listar productos |
| GET | `/api/products/[id]` | Producto individual |
| GET | `/api/categories` | Listar categorías |

### Endpoints Protegidos (requieren auth)
| Método | Ruta | Descripción |
|--------|------|-------------|
| GET/POST | `/api/shipments` | CRUD envíos |
| GET/POST | `/api/users` | CRUD usuarios |
| GET/POST | `/api/clients` | CRUD clientes |
| GET | `/api/dashboard/stats` | Estadísticas |

**Ver:** [API Routes](05-api-routes.md)

---

## 🛠️ Tecnologías

| Categoría | Tecnología |
|-----------|------------|
| Frontend | Next.js 16, React 19, TypeScript, Tailwind CSS |
| Backend | Next.js API Routes, Prisma ORM |
| Base de Datos | PostgreSQL 16 |
| UI | Radix UI, Lucide Icons, Shadcn/ui |
| Auth | NextAuth.js |
| Deployment | Vercel, Docker |

---

## 📝 Notas de Versión

### v1.0.0 (Enero 2026)
- ✅ Sitio público con catálogo de productos
- ✅ Panel de administración
- ✅ Sistema de usuarios y roles
- ✅ Gestión de envíos
- ✅ Base de datos PostgreSQL con Prisma

---

## 🤝 Contribución

1. Fork el repositorio
2. Crea una rama feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'feat: agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

---

**Última actualización:** Enero 2026

Para preguntas o soporte, contacta al equipo de desarrollo.
