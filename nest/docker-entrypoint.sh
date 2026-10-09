#!/bin/sh
set -eu

echo "Preparing PostgreSQL schema..."
npx prisma db push --skip-generate

if [ "${SEED_DATABASE:-true}" = "true" ]; then
  echo "Running database seed..."
  npm run db:seed
fi

exec node dist/main