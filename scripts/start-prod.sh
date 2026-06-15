#!/bin/sh
set -eu

echo "==> Applying Prisma migrations"
npx prisma migrate deploy

echo "==> Ensuring default admin user"
node ./scripts/ensure-admin.mjs

echo "==> Starting Next.js"
exec npm run start -- -p 3000
