# Diseño del Panel de Administración

## 🎯 Visión General

Panel de administración completo para gestionar la plataforma DLA Viajes y Envíos con funcionalidades de CRUD para envíos, productos, clientes, usuarios y más.

---

## 📁 Estructura de Rutas

```
app/
├── (admin)/                      # Grupo de rutas admin
│   ├── layout.tsx                # Layout con sidebar
│   ├── page.tsx                  # Dashboard
│   │
│   ├── shipments/
│   │   ├── page.tsx              # Lista de envíos
│   │   ├── [id]/
│   │   │   ├── page.tsx          # Detalle de envío
│   │   │   └── edit/
│   │   │       └── page.tsx      # Editar envío
│   │   └── new/
│   │       └── page.tsx          # Nuevo envío
│   │
│   ├── products/
│   │   ├── page.tsx              # Lista de productos
│   │   ├── [id]/
│   │   │   ├── page.tsx
│   │   │   └── edit/
│   │   └── new/
│   │       └── page.tsx
│   │
│   ├── categories/
│   │   ├── page.tsx
│   │   └── new/
│   │       └── page.tsx
│   │
│   ├── clients/
│   │   ├── page.tsx
│   │   ├── [id]/
│   │   │   ├── page.tsx
│   │   └── new/
│   │       └── page.tsx
│   │
│   ├── users/
│   │   ├── page.tsx
│   │   ├── [id]/
│   │   │   ├── page.tsx
│   │   └── new/
│   │       └── page.tsx
│   │
│   └── settings/
│       └── page.tsx
```

---

## 📊 Componentes del Panel

### 1. Sidebar (sidebar.tsx)

```typescript
// navigation items
const navItems = [
  { label: 'Dashboard', href: '/admin', icon: LayoutDashboard },
  { label: 'Envíos', href: '/admin/shipments', icon: Package },
  { label: 'Productos', href: '/admin/products', icon: ShoppingCart },
  { label: 'Categorías', href: '/admin/categories', icon: Folder },
  { label: 'Clientes', href: '/admin/clients', icon: Users },
  { label: 'Usuarios', href: '/admin/users', icon: UserCog },
  { label: 'Configuración', href: '/admin/settings', icon: Settings },
]
```

### 2. Dashboard - Métricas

```typescript
interface DashboardStats {
  totalShipments: number
  pendingShipments: number
  inTransitShipments: number
  deliveredShipments: number
  totalRevenue: number
  shipmentsByType: { MARITIMO: number; AEREO: number }
  shipmentsByProvince: { province: string; count: number }[]
  recentShipments: Shipment[]
}
```

### 3. DataTable (tabla reusable)

```typescript
interface Column<T> {
  key: string
  label: string
  render?: (item: T) => ReactNode
  sortable?: boolean
}

interface DataTableProps<T> {
  data: T[]
  columns: Column<T>[]
  onEdit?: (item: T) => void
  onDelete?: (item: T) => void
  onView?: (item: T) => void
}
```

---

## 🎨 Layout del Admin

```
┌─────────────────────────────────────────────────────────────────┐
│  Header: Logo, Usuario, Notificaciones, Cerrar sesión           │
├──────────┬──────────────────────────────────────────────────────┤
│          │                                                      │
│  Sidebar │                   Contenido                         │
│          │                                                      │
│  • Dashboard                                                    │
│  • Envíos     ┌────────────────────────────────────────────┐    │
│  • Productos  │  Stats Cards                               │    │
│  • Clientes   │  ┌─────┐ ┌─────┐ ┌─────┐ ┌─────┐          │    │
│  • Usuarios   │  │Total│ │Pend.│ │Trans│ │Ent. │          │    │
│  • Config.    │  └─────┘ └─────┘ └─────┘ └─────┘          │    │
│               │                                              │    │
│               │  ┌────────────────────────────────────────┐ │    │
│               │  │  Tabla de datos                        │ │    │
│               │  │                                        │ │    │
│               │  └────────────────────────────────────────┘ │    │
│               │                                              │
└──────────┴──────────────────────────────────────────────────────┘
```

---

## 📋 Views Detalladas

### Dashboard
- **Stats Cards:** Total envíos, pendientes, en tránsito, entregados, ingresos
- **Gráfico:** Envíos por tipo (marítimo/aéreo)
- **Gráfico:** Envíos por provincia
- **Tabla:** Últimos 5 envíos

### Shipments (Envíos)
- **Filtros:** Por estado, fecha, tipo, provincia
- **Columnas:** HBL, Cliente, Estado, Tipo, Destino, Precio, Fecha
- **Acciones:** Ver, Editar, Eliminar, Cambiar estado

### Products (Productos)
- **Filtros:** Por categoría
- **Columnas:** Nombre, Categoría, Precio, Estado, Imagen
- **Acciones:** Ver, Editar, Eliminar

### Clients (Clientes)
- **Filtros:** Por nombre, email, teléfono
- **Columnas:** Nombre, Email, Teléfono, Total envíos, Fecha
- **Acciones:** Ver, Editar, Eliminar

### Users (Usuarios)
- **Filtros:** Por rol
- **Columnas:** Nombre, Email, Rol, Estado, Última sesión
- **Acciones:** Ver, Editar, Eliminar, Cambiar rol

---

## 🔧 Componentes UI a Crear

1. `components/admin/sidebar.tsx` - Sidebar de navegación
2. `components/admin/header.tsx` - Header del admin
3. `components/admin/stats-card.tsx` - Tarjeta de estadísticas
4. `components/ui/data-table.tsx` - Tabla genérica
5. `components/ui/status-badge.tsx` - Badge de estado
6. `components/ui/delete-dialog.tsx` - Diálogo de confirmación
7. `components/ui/search-input.tsx` - Input de búsqueda

---

## 📝 Formularios

### Nuevo/Editar Envío
```typescript
interface ShipmentForm {
  hbl: string
  clientId: string
  shipmentType: 'MARITIMO' | 'AEREO'
  provinceId: string
  paymentMethodId: string
  offerCode?: string
  customsDuty?: number
  pounds?: number
  salePrice?: number
  memo?: string
  productIds: string[]  // productos asociados
}
```

### Nuevo/Editar Producto
```typescript
interface ProductForm {
  name: string
  description?: string
  price: number
  categoryId: string
  image?: string
  active: boolean
}
```

---

## 🚀 Siguientes Pasos

1. Crear layout del admin con sidebar
2. Crear componentes UI reutilizables
3. Crear dashboard con métricas
4. Crear vistas de CRUD para cada entidad
5. Conectar con las API routes

---

**Ver también:**
- [03-Database-Model](../03-database-model.md) - Modelos de datos
- [04-Prisma-Setup](../04-prisma-setup.md) - Configuración de Prisma
