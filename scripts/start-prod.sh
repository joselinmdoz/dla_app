#!/bin/sh
set -eu

echo "==> Applying Prisma migrations"
migration_log="$(mktemp)"

if npx prisma migrate deploy >"$migration_log" 2>&1; then
  cat "$migration_log"
else
  status=$?
  cat "$migration_log"

  if grep -q "Error: P3005" "$migration_log"; then
    echo "==> Existing non-empty database detected without Prisma baseline; continuing startup"
  else
    rm -f "$migration_log"
    exit "$status"
  fi
fi

rm -f "$migration_log"

echo "==> Ensuring default admin user"
node ./scripts/ensure-admin.mjs

echo "==> Starting Next.js"
exec npm run start -- -p 3000
