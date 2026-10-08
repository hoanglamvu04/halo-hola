#!/usr/bin/env bash
set -euo pipefail

ROOT="${HALO_HOLA_ROOT:-/var/www/halo-hola}"
BRANCH="${HALO_HOLA_BRANCH:-main}"
CONTENT_SEED_MARKER="$ROOT/.official-content-seed-v1"
DEMO_SEED_MARKER="$ROOT/.full-demo-seed-v1"
MEDIA_DEMO_SEED_MARKER="$ROOT/.media-demo-seed-v1"
SHOWCASE_SEED_MARKER="$ROOT/.meeting-showcase-seed-v1"
TOUR03_LANG_NGHE_MARKER="$ROOT/.tour03-lang-nghe-v1"
AWARDS_2026_VALUES_MARKER="$ROOT/.awards-2026-values-v1"
AWARDS_2026_STRUCTURE_V2_MARKER="$ROOT/.awards-2026-structure-v2"

echo "==> HALO HOLA deploy"
echo "    root:   $ROOT"
echo "    branch: $BRANCH"

cd "$ROOT"

echo "==> Sync Git"
git fetch origin "$BRANCH" --prune
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

if [[ ! -f "$SHOWCASE_SEED_MARKER" ]]; then
  echo "==> Seed 52-item meeting showcase dataset (one time)"
  npm run db:seed:showcase --prefix backend
  touch "$SHOWCASE_SEED_MARKER"
else
  echo "==> Meeting showcase seed already applied"
fi

# Idempotent showcase enrichments. Keep these outside the one-time marker so an older
# meeting seed can be upgraded safely without recreating participant-style records.
npm run db:seed:showcase:scores --prefix backend
npm run db:seed:showcase:dates --prefix backend
npm run db:seed:showcase:public --prefix backend

# One-time official content correction: Tour #03 changed from Nắng Hòa Lạc to Làng nghề Hòa Lạc.
# The marker prevents future deploys from overwriting edits made later in Admin CMS.
if [[ ! -f "$TOUR03_LANG_NGHE_MARKER" ]]; then
  echo "==> Update HOLA Tour #03 to Làng nghề Hòa Lạc"
  npm run db:content:tour03-langnghe --prefix backend
  touch "$TOUR03_LANG_NGHE_MARKER"
else
  echo "==> Tour #03 craft-village content already applied; keeping CMS edits intact"
fi

# One-time prize-value correction kept for servers that have not applied the previous release yet.
if [[ ! -f "$AWARDS_2026_VALUES_MARKER" ]]; then
  echo "==> Update HALO HOLA 2026 prize values"
  npm run db:content:awards-2026-values --prefix backend
  touch "$AWARDS_2026_VALUES_MARKER"
else
  echo "==> Previous HALO HOLA 2026 prize values already applied"
fi

# Revised official structure: 1 first prize, 7 theme prizes, 5 color prizes and 2 online prizes.
# This runs only once so later Admin edits remain untouched.
if [[ ! -f "$AWARDS_2026_STRUCTURE_V2_MARKER" ]]; then
  echo "==> Apply revised HALO HOLA 2026 prize structure (26m cash)"
  node backend/src/database/updateAwards2026StructureV2.js
  touch "$AWARDS_2026_STRUCTURE_V2_MARKER"
else
  echo "==> Revised HALO HOLA 2026 prize structure already applied; keeping Admin edits intact"
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
