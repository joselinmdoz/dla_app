# Modelado de Base de Datos - DLA Viajes y Envíos

## 🎯 Visión General

Este proyecto es una **plataforma completa de gestión** que incluye:
- **Sitio público:** Catálogo de productos/servicios
- **Panel de administración:** Dashboard con gestión completa del negocio

---

## 📊 Diagrama de Entidades

```mermaid
erDiagram
    User ||--o{ Role : has
    Role ||--o{ Permission : includes
    User ||--o{ Shipment : creates
    User ||--o{ AuditLog : generates
    Shipment ||--o{ ShipmentProduct : contains
    Shipment ||--o{ ShipmentStatusHistory : has
    Product ||--o{ ShipmentProduct : in_shipment
    Client ||--o{ Shipment : receives
    Province ||--o{ Shipment : ships_to
    PaymentMethod ||--o{ Shipment : paid_with
    
    User {
        string id PK
        string email UK
        string password
        string name
        string avatar
        boolean active
        datetime createdAt
        datetime updatedAt
        string roleId FK
    }
    
    Role {
        string id PK
        string name UK
        string description
        boolean isDefault
    }
    
    Permission {
        string id PK
        string name UK
        string resource
        string action
    }
    
    Shipment {
        string id PK
        string hbl UK
        string status
        datetime createdAt
        datetime updatedAt
        string userId FK
        string clientId FK
        string provinceId FK
        string paymentMethodId FK
        string offerCode
        decimal customsDuty
        decimal pounds
        decimal salePrice
        string memo
        string shipmentType
    }
    
    Client {
        string id PK
        string name
        string email
        string phone
        string address
        datetime createdAt
    }
    
    Province {
        string id PK
        string name UK
        string code
    }
    
    Product {
        string id PK
        string name
        string description
        decimal price
        string image
        boolean active
        string categoryId FK
    }
    
    Category {
        string id PK
        string name UK
        string slug UK
        string icon
        int sortOrder
    }
    
    PaymentMethod {
        string id PK
        string name UK
        string code
    }
    
    ShipmentProduct {
        string id PK
        string shipmentId FK
        string productId FK
        int quantity
    }
    
    ShipmentStatusHistory {
        string id PK
        string shipmentId FK
        string status
        string note
        datetime createdAt
        string userId FK
    }
    
    AuditLog {
        string id PK
        string userId FK
        string action
        string resource
        string resourceId
        json oldData
        json newData
        datetime createdAt
    }
```

---

## 🗄️ Modelos de Datos (Prisma Schema)

### 1. User (Usuario)

```prisma
model User {
  id            String    @id @default(cuid())
  email         String    @unique
  password      String    // bcrypt hash
  name          String
  avatar        String?
  active        Boolean   @default(true)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  roleId        String
  role          Role      @relation(fields: [roleId], references: [id])
  
  shipments     Shipment[]
  auditLogs     AuditLog[]
  statusHistories ShipmentStatusHistory[]
  
  @@map("users")
}
```

### 2. Role (Rol)

```prisma
model Role {
  id          String    @id @default(cuid())
  name        String    @unique
  description String?
  isDefault   Boolean   @default(false)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  
  users       User[]
  permissions RolePermission[]
  
  @@map("roles")
}
```

### 3. Permission (Permiso)

```prisma
model Permission {
  id          String    @id @default(cuid())
  name        String    @unique  // ej: "shipments.create"
  resource    String    // ej: "shipments", "users", "products"
  action      String    // ej: "create", "read", "update", "delete"
  description String?
  createdAt   DateTime  @default(now())
  
  roles       RolePermission[]
  
  @@map("permissions")
}
```

### 4. RolePermission (Relación Roles-Permisos)

```prisma
model RolePermission {
  id           String     @id @default(cuid())
  roleId       String
  permissionId String
  createdAt    DateTime   @default(now())
  
  role         Role       @relation(fields: [roleId], references: [id], onDelete: Cascade)
  permission   Permission @relation(fields: [permissionId], references: [id], onDelete: Cascade)
  
  @@unique([roleId, permissionId])
  @@map("role_permissions")
}
```

### 5. Client (Cliente)

```prisma
model Client {
  id          String    @id @default(cuid())
  name        String
  email       String?
  phone       String?
  address     String?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  
  shipments   Shipment[]
  
  @@map("clients")
}
```

### 6. Province (Provincia de Cuba)

```prisma
model Province {
  id        String    @id @default(cuid())
  name      String    @unique  // ej: "Habana", "Santiago de Cuba"
  code      String    @unique  // ej: "CH", "SCU"
  createdAt DateTime  @default(now())
  
  shipments Shipment[]
  
  @@map("provinces")
}
```

### 7. PaymentMethod (Método de Pago)

```prisma
model PaymentMethod {
  id        String    @id @default(cuid())
  name      String    @unique  // ej: "Cash", "Zelle", "Tarjeta"
  code      String    @unique  // ej: "CASH", "ZELLE", "CARD"
  createdAt DateTime  @default(now())
  
  shipments Shipment[]
  
  @@map("payment_methods")
}
```

### 8. Category (Categoría de Productos)

```prisma
model Category {
  id        String    @id @default(cuid())
  name      String    @unique
  slug      String    @unique
  icon      String?
  sortOrder Int       @default(0)
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  
  products  Product[]
  
  @@map("categories")
}
```

### 9. Product (Producto/Servicio)

```prisma
model Product {
  id          String    @id @default(cuid())
  name        String
  description String?
  price       Decimal   @db.Decimal(10, 2)
  image       String?
  active      Boolean   @default(true)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  
  categoryId  String
  category    Category  @relation(fields: [categoryId], references: [id])
  
  shipmentProducts ShipmentProduct[]
  
  @@map("products")
}
```

### 10. Shipment (Envío)

```prisma
model Shipment {
  id            String    @id @default(cuid())
  hbl           String    @unique  // House Bill of Lading
  status        String    @default("pending") // pending, in_transit, customs, delivered, cancelled
  offerCode     String?
  customsDuty   Decimal?  @db.Decimal(10, 2)
  pounds        Decimal?  @db.Decimal(10, 2)
  salePrice     Decimal?  @db.Decimal(10, 2)
  memo          String?
  shipmentType  String    // MARITIMO, AEREO
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  // Relaciones
  userId        String
  user          User      @relation(fields: [userId], references: [id])
  
  clientId      String?
  client        Client?   @relation(fields: [clientId], references: [id])
  
  provinceId    String?
  province      Province? @relation(fields: [provinceId], references: [id])
  
  paymentMethodId String?
  paymentMethod   PaymentMethod? @relation(fields: [paymentMethodId], references: [id])
  
  // Relaciones Hijas
  products      ShipmentProduct[]
  statusHistories ShipmentStatusHistory[]
  
  @@map("shipments")
}
```

### 11. ShipmentProduct (Productos en Envío)

```prisma
model ShipmentProduct {
  id         String    @id @default(cuid())
  quantity   Int       @default(1)
  createdAt  DateTime  @default(now())
  
  shipmentId String
  shipment   Shipment  @relation(fields: [shipmentId], references: [id], onDelete: Cascade)
  
  productId  String
  product    Product   @relation(fields: [productId], references: [id])
  
  @@unique([shipmentId, productId])
  @@map("shipment_products")
}
```

### 12. ShipmentStatusHistory (Historial de Estados)

```prisma
model ShipmentStatusHistory {
  id         String    @id @default(cuid())
  status     String
  note       String?
  createdAt  DateTime  @default(now())
  
  shipmentId String
  shipment   Shipment  @relation(fields: [shipmentId], references: [id], onDelete: Cascade)
  
  userId     String?
  user       User?     @relation(fields: [userId], references: [id])
  
  @@map("shipment_status_histories")
}
```

### 13. AuditLog (Logs de Auditoría)

```prisma
model AuditLog {
  id          String    @id @default(cuid())
  action      String    // CREATE, UPDATE, DELETE
  resource    String    // shipment, user, product
  resourceId  String?
  oldData     Json?
  newData     Json?
  createdAt   DateTime  @default(now())
  
  userId      String?
  user        User?     @relation(fields: [userId], references: [id])
  
  @@index([resource, resourceId])
  @@map("audit_logs")
}
```

---

## 🔐 Sistema de Permisos

### Roles Predeterminados

| Rol | Descripción | Permisos |
|-----|-------------|----------|
| **Admin** | Administrador completo | Todos los permisos |
| **Manager** | Gestor de envíos | CRUD envíos, productos, clientes |
| **Operator** | Operador | CREATE/UPDATE envíos, READ productos |
| **Viewer** | Solo lectura | READ solo |

### Permisos por Recurso

| Recurso | Acciones |
|---------|----------|
| users | create, read, update, delete |
| roles | create, read, update, delete |
| shipments | create, read, update, delete |
| products | create, read, update, delete |
| categories | create, read, update, delete |
| clients | create, read, update, delete |
| reports | read, export |

---

## 📝 Campos de Envío

| Campo | Tipo | Descripción |
|-------|------|-------------|
| id | String | ID único |
| hbl | String | House Bill of Lading |
| status | String | Estado del envío |
| createdAt | DateTime | Fecha de creación |
| updatedAt | DateTime | Última actualización |
| userId | String | Usuario que creó el envío |
| clientId | String | Cliente destinatario |
| provinceId | String | Provincia de destino (Cuba) |
| paymentMethodId | String | Método de pago |
| offerCode | String | Código de oferta |
| customsDuty | Decimal | Impuesto de aduana |
| pounds | Decimal | Libras del envío |
| salePrice | Decimal | Precio de venta |
| memo | String | Notas adicionales |
| shipmentType | String | MARITIMO o AEREO |

---

**Ver también:**
- [01-Architecture](01-architecture.md) - Arquitectura del proyecto
- [02-Backend-Plan](02-backend-plan.md) - Plan de implementación
- [04-Prisma-Setup](04-prisma-setup.md) - Configuración Prisma
