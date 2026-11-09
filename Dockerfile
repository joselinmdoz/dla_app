# ---------- deps ----------
FROM docker.m.daocloud.io/node:26.12.1-alpine AS deps
WORKDIR /app

# Instalar dependencias necesarias para Prisma
RUN apk add --no-cache openssl openssl-dev

COPY package*.json ./
COPY prisma ./prisma/

RUN npm ci --registry=https://registry.npmjs.org/

# ---------- build ----------
FROM docker.m.daocloud.io/node:26.12.1-alpine AS build
WORKDIR /app

# Instalar dependencias para build
RUN apk add --no-cache openssl openssl-dev

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# ---------- runner ----------
FROM docker.m.daocloud.io/node:26.12.1-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Instalar librerías necesarias para Prisma runtime
RUN apk add --no-cache openssl libstdc++

# Copiamos lo mínimo para correr Next
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/.next ./.next
# En producción docker-compose monta ./public desde el host. No copiarlo evita
# duplicar imágenes cargadas por el administrador dentro de la imagen final.
RUN mkdir -p ./public
COPY --from=build /app/prisma ./prisma/
COPY --from=build /app/scripts ./scripts

EXPOSE 3000

CMD ["sh","./scripts/start-prod.sh"]
