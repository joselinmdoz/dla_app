# ---------- deps ----------
FROM docker.m.daocloud.io/node:20-alpine AS deps
WORKDIR /app

# Instalar dependencias necesarias para Prisma
RUN apk add --no-cache openssl openssl-dev

COPY package*.json ./
COPY prisma ./prisma/

RUN npm install

# ---------- build ----------
FROM docker.m.daocloud.io/node:20-alpine AS build
WORKDIR /app

# Instalar dependencias para build
RUN apk add --no-cache openssl openssl-dev

COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN npm run build

# ---------- runner ----------
FROM docker.m.daocloud.io/node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production

# Instalar librerías necesarias para Prisma runtime
RUN apk add --no-cache openssl libstdc++

# Copiamos lo mínimo para correr Next
COPY --from=build /app/package.json ./package.json
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/.next ./.next
COPY --from=build /app/public ./public
COPY --from=build /app/prisma ./prisma/
COPY --from=build /app/.env ./.env

EXPOSE 3000

CMD ["npm","run","start","--","-p","3000"]
