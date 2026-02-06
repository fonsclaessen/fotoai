#!/bin/sh
set -e

echo "==> Ensuring data directory permissions..."
# Try to fix ownership (works on Linux, skipped on macOS Docker Desktop)
chown -R nextjs:nodejs /app/data 2>/dev/null || true
chown -R nextjs:nodejs /app/public/albums 2>/dev/null || true

# If we're running as root, use su-exec to drop to nextjs
# If already running as nextjs (e.g. macOS), run directly
if [ "$(id -u)" = "0" ]; then
  echo "==> Running as root, will drop to nextjs user"
  EXEC="su-exec nextjs"
else
  echo "==> Running as $(whoami)"
  EXEC=""
fi

echo "==> Running database migrations..."
$EXEC npx prisma migrate deploy

echo "==> Seeding database..."
$EXEC npx prisma db seed || true

echo "==> Starting Next.js..."
exec $EXEC node_modules/.bin/next start -p 3000 -H 0.0.0.0
