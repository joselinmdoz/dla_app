# Configuración del Backend con Prisma + PostgreSQL

## 📋 Pasos para Configurar

### 1. Instalar Dependencias

```bash
# Instalar Prisma CLI y Client
pnpm add prisma --save-dev
pnpm add @prisma/client

# O usando npm
npm install prisma --save-dev
npm install @prisma/client
```

### 2. Configurar la Conexión a PostgreSQL

Edita el archivo `.env` con las credenciales de tu PostgreSQL en Docker:

```env
# Formato: postgresql://USUARIO:CONTRASEÑA@HOST:PUERTO/DB_NOMBRE?schema=public

# Ejemplo para Docker local
DATABASE_URL="postgresql://postgres:mi_password@localhost:5432/dla_db?schema=public"

# Si usas Docker Compose con nombre de servicio
DATABASE_URL="postgresql://postgres:mi_password@postgres:5432/dla_db?schema=public"
```

**Para tu configuración con WSL Ubuntu 24.04:**
```env
# Si PostgreSQL está en Docker Desktop y accedes desde WSL
DATABASE_URL="postgresql://postgres:password@localhost:5432/dla_db?schema=public"

# O si prefieres usar la IP de Docker bridge
DATABASE_URL="postgresql://postgres:password@172.17.0.1:5432/dla_db?schema=public"
```

### 3. Verificar que PostgreSQL está Ejecutando

```bash
# Verificar contenedores Docker activos
docker ps

# Si tu contenedor se llama 'postgres'
docker exec -it postgres psql -U postgres -d dla_db

# O verificar desde Ubuntu WSL
sudo systemctl status postgresql
```

### 4. Crear la Base de Datos

```bash
# Conectarse a PostgreSQL y crear la base de datos
psql -U postgres -c "CREATE DATABASE dla_db;"
```

### 5. Generar el Cliente Prisma

```bash
pnpm prisma generate
# o
npx prisma generate
```

### 6. Ejecutar Migraciones

```bash
# Crear las tablas en la base de datos
pnpm prisma migrate dev --name init

# Esto creará:
# - Tabla Category
# - Tabla Product
# - Tabla _prisma_migrations
```

### 7. Poblar con Datos Iniciales (Seed)

```bash
pnpm prisma:seed
# o
npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/seed.ts
```

### 8. Verificar los Datos

```bash
# Abrir Prisma Studio (GUI)
pnpm prisma:studio

# Esto abrirá http://localhost:5555 donde podrás ver y editar los datos
```

---

## 🔧 Comandos Útiles

| Comando | Descripción |
|---------|-------------|
| `pnpm prisma generate` | Genera el cliente TypeScript |
| `pnpm prisma migrate dev` | Crea/aplica migraciones (desarrollo) |
| `pnpm prisma migrate deploy` | Aplica migraciones (producción) |
| `pnpm prisma studio` | Abre GUI para ver/editar datos |
| `pnpm prisma db push` | Sincroniza schema (solo dev) |
| `pnpm prisma:seed` | Ejecuta el seed de datos |
| `pnpm prisma db reset` | Borra y recrea la DB (peligroso) |

---

## 🌐 Probar las API Routes

Una vez configurado, puedes probar los endpoints:

```bash
# Obtener todos los productos
curl http://localhost:3000/api/products

# Filtrar por categoría
curl http://localhost:3000/api/products?category=beef

# Obtener un producto específico
curl http://localhost:3000/api/products/[id]

# Obtener categorías
curl http://localhost:3000/api/categories
```

---

## 📁 Archivos Creados

- `.env` - Variables de entorno (no subir a git)
- `prisma/schema.prisma` - Definición del modelo de datos
- `prisma/seed.ts` - Datos iniciales
- `lib/prisma.ts` - Cliente Prisma singleton
- `app/api/products/route.ts` - API: GET todos los productos
- `app/api/products/[id]/route.ts` - API: GET producto por ID
- `app/api/categories/route.ts` - API: GET categorías
- `hooks/use-products.ts` - Hooks para consumir la API

---

## ⚠️ Solución de Problemas

### Error: Can't reach database server

```bash
# Verificar que PostgreSQL está ejecutándose
docker ps | grep postgres

# Verificar la URL de conexión en .env
# Asegúrate de que el host y puerto sean correctos
```

### Error: Module not found: @prisma/client

```bash
# Regenerar el cliente
pnpm prisma generate

# Reinstalar dependencias
rm -rf node_modules package-lock.json
pnpm install
```

### Error: Migration table already exists

```bash
# Si estás reiniciando el proyecto
pnpm prisma migrate reset --force
```

---

## 🚀 Siguientes Pasos

1. [ ] Configurar Docker para PostgreSQL
2. [ ] Instalar dependencias de Prisma
3. [ ] Configurar `.env` con credenciales
4. [ ] Ejecutar migración inicial
5. [ ] Poblar base de datos
6. [ ] Conectar frontend con API
