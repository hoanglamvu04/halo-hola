#!/usr/bin/env bash
set -euo pipefail

ROOT="${HALO_HOLA_ROOT:-/var/www/halo-hola}"
BRANCH="${HALO_HOLA_BRANCH:-main}"

echo "==> HALO HOLA deploy"
echo "    root:   $ROOT"
echo "    branch: $BRANCH"

cd "$ROOT"

echo "==> Sync Git"
git fetch origin "$BRANCH" --prune
git checkout "$BRANCH"
git pull --ff-only origin "$BRANCH"

echo "==> Install backend dependencies"
npm install --prefix backend --omit=dev

echo "==> Install frontend dependencies"
npm install --prefix frontend

echo "==> Apply database migrations"
npm run db:migrate --prefix backend

echo "==> Build frontend"
npm run build --prefix frontend

echo "==> Restart API with PM2"
if pm2 describe halo-hola-api >/dev/null 2>&1; then
  pm2 reload ecosystem.config.cjs --update-env
else
  pm2 start ecosystem.config.cjs
fi

pm2 save

echo "==> Done"
echo "Frontend: $ROOT/frontend/dist"
echo "API:      127.0.0.1:5000"
