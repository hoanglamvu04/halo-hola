#!/usr/bin/env bash
set -euo pipefail

ROOT="${HALO_HOLA_ROOT:-/var/www/halo-hola}"
BRANCH="${HALO_HOLA_BRANCH:-main}"
CONTENT_SEED_MARKER="$ROOT/.official-content-seed-v1"
DEMO_SEED_MARKER="$ROOT/.full-demo-seed-v1"
MEDIA_DEMO_SEED_MARKER="$ROOT/.media-demo-seed-v1"

echo "==> HALO HOLA deploy"
echo "    root:   $ROOT"
echo "    branch: $BRANCH"

cd "$ROOT"

echo "==> Sync Git"
git fetch origin "$BRANCH" --prune
# Older deployments created untracked npm lockfiles because they were ignored.
# Remove only those legacy untracked paths before the first pull that tracks them.
git clean -f -- package-lock.json backend/package-lock.json frontend/package-lock.json >/dev/null 2>&1 || true
git checkout "$BRANCH"
git pull --ff-only origin "$BRANCH"

echo "==> Install backend dependencies from lockfile"
npm ci --prefix backend --omit=dev

echo "==> Install frontend dependencies from lockfile"
npm ci --prefix frontend

echo "==> Apply database migrations"
npm run db:migrate --prefix backend

if [[ ! -f "$CONTENT_SEED_MARKER" ]]; then
  echo "==> Seed official HALO HOLA 2026 content (one time)"
  npm run db:seed --prefix backend
  touch "$CONTENT_SEED_MARKER"
else
  echo "==> Official content seed already applied; keeping CMS edits intact"
fi

if [[ ! -f "$DEMO_SEED_MARKER" ]]; then
  echo "==> Seed full admin demo dataset (one time)"
  npm run db:seed:demo --prefix backend
  touch "$DEMO_SEED_MARKER"
else
  echo "==> Full admin demo dataset already applied"
fi

if [[ ! -f "$MEDIA_DEMO_SEED_MARKER" ]]; then
  echo "==> Seed demo Media Library (one time)"
  npm run db:seed:media-demo --prefix backend
  touch "$MEDIA_DEMO_SEED_MARKER"
else
  echo "==> Demo Media Library already applied"
fi

echo "==> Build frontend"
npm run build --prefix frontend
test -s frontend/dist/index.html

echo "==> Restart API with PM2"
if pm2 describe halo-hola-api >/dev/null 2>&1; then
  pm2 reload ecosystem.config.cjs --update-env
else
  pm2 start ecosystem.config.cjs
fi

API_PORT="$(sed -n 's/^[[:space:]]*PORT=//p' backend/.env 2>/dev/null | tail -n1 | tr -d '\r' | xargs || true)"
API_PORT="${API_PORT:-5000}"

echo "==> Smoke check API readiness on 127.0.0.1:${API_PORT}"
READY=0
for attempt in $(seq 1 15); do
  if curl -fsS --max-time 3 "http://127.0.0.1:${API_PORT}/api/ready" >/dev/null; then
    READY=1
    break
  fi
  sleep 1
done

if [[ "$READY" != "1" ]]; then
  echo "ERROR: API readiness check failed after deploy"
  pm2 status halo-hola-api || true
  exit 1
fi

pm2 save

echo "==> Done"
echo "Frontend: $ROOT/frontend/dist"
echo "API:      http://127.0.0.1:${API_PORT}/api/ready"
