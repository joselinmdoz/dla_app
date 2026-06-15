# Configuración Docker

## Desarrollo Local

```bash
# Iniciar solo la base de datos
docker compose up -d postgres

# Iniciar la app en modo desarrollo (con hot reload)
docker compose up dev -d

# Ver logs
docker compose logs -f dev

# Acceder a http://localhost:3000
```

## Producción

```bash
# Construir y ejecutar en producción
docker compose up -d prod

# Ver logs
docker compose logs -f prod

# Acceder al puerto publicado por Docker
docker compose port prod 3000
```

## Comandos útiles

```bash
# Detener todos los servicios
docker compose down

# Detener incluyendo volúmenes (borra la DB)
docker compose down -v

# Reconstruir imágenes
docker compose build
docker compose build --no-cache

# Ver servicios ejecutándose
docker compose ps

# Acceder al contenedor de la app
docker exec -it next_app_dev sh
```

## Notas

- El puerto **3000** se usa para desarrollo
- En `prod`, las variables se cargan desde `.env.docker`
- En el primer arranque de `prod` se ejecuta `prisma migrate deploy`
- Si no existe ningún admin, se crea uno usando `DEFAULT_ADMIN_*` de `.env.docker`
- El puerto **5440** se expone para PostgreSQL (conexión desde host)
- Los cambios en código se reflejan automáticamente en desarrollo gracias al volume mount


hacer salva en produccion 
ocker exec postgres_dla_db pg_dump -U postgres -d dla_db > /opt/backups/dla/dla_db_$(date +%F_%H-%M-%S).sql
