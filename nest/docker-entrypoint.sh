#!/bin/sh
set -eu

if [ -n "${DATABASE_URL:-}" ]; then
  echo "Preparing PostgreSQL schema..."
  npx prisma generate
  npx prisma db push --skip-generate

  if [ "${SEED_DATABASE:-true}" = "true" ]; then
    echo "Running database seed..."
    npm run db:seed
  fi
else
  echo "DATABASE_URL is not set; skipping Prisma setup and using JSON data"
fi

exec node dist/main