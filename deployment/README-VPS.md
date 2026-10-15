# HALO HOLA — VPS deployment

Official production domain: **halohola.vn**

Legacy domain **halohola.xspace.vn** should redirect permanently to the official domain.

Architecture:

- Nginx serves `frontend/dist`
- Nginx proxies `/api` and `/uploads` to Node.js on `127.0.0.1:5000`
- PM2 keeps the backend online
- PostgreSQL runs natively on the VPS
- Frontend uses `VITE_API_URL=/api`

## 1. DNS

Create **A records** for the official domain:

- `@` → your VPS public IPv4
- `www` → your VPS public IPv4 (optional, if you want `www.halohola.vn`)

Keep the old `halohola.xspace.vn` record pointing to the same VPS while the redirect is active.

Wait until:

```bash
getent hosts halohola.vn
```

returns the VPS IP.

## 2. First-time packages (Ubuntu/Debian)

```bash
sudo apt update
sudo apt install -y git nginx postgresql postgresql-contrib certbot python3-certbot-nginx
```

Install Node.js 20+ and PM2:

```bash
node -v
npm -v
sudo npm install -g pm2
```

## 3. Clone

```bash
sudo mkdir -p /var/www
sudo chown -R "$USER":"$USER" /var/www
cd /var/www
git clone https://github.com/hoanglamvu04/halo-hola.git
cd halo-hola
```

For an existing checkout:

```bash
cd /var/www/halo-hola
git fetch origin main
git checkout main
git pull --ff-only origin main
```

## 4. PostgreSQL

```bash
sudo -u postgres psql
```

Nếu VPS đã có PostgreSQL cho các dự án khác, **giữ nguyên user/password hiện tại** để không làm ảnh hưởng ứng dụng đang chạy. Chỉ tạo database mới nếu chưa có:

```sql
SELECT 'CREATE DATABASE halo_hola'
WHERE NOT EXISTS (SELECT FROM pg_database WHERE datname = 'halo_hola')\gexec
\q
```

Sau đó dùng đúng user/password PostgreSQL hiện có trong `DATABASE_URL`.

## 5. Production env

```bash
cp backend/.env.production.example backend/.env
cp frontend/.env.production.example frontend/.env.production
nano backend/.env
nano frontend/.env.production
```

Official-domain values:

```env
# backend/.env
NODE_ENV=production
PORT=5000
PUBLIC_BASE_URL=https://halohola.vn
HALO_HOLA_SITE_URL=https://halohola.vn
CORS_ORIGIN=https://halohola.vn,https://www.halohola.vn
```

```env
# frontend/.env.production
VITE_API_URL=/api
VITE_SITE_URL=https://halohola.vn
```

Fill PostgreSQL, JWT, R2 and optional SMTP secrets in `backend/.env`.

## 6. First deploy

```bash
cd /var/www/halo-hola
npm install --prefix backend --omit=dev
npm install --prefix frontend
npm run db:migrate --prefix backend
npm run db:content:tours-2026 --prefix backend
npm run build --prefix frontend
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```

Run the final command printed by `pm2 startup` once, then run `pm2 save` again.

## 7. Nginx

The repository Nginx config serves `halohola.vn`/`www.halohola.vn` and redirects `halohola.xspace.vn` to the official domain.

```bash
sudo cp deployment/nginx-halohola.xspace.vn.conf /etc/nginx/sites-available/halohola.vn
sudo ln -sfn /etc/nginx/sites-available/halohola.vn /etc/nginx/sites-enabled/halohola.vn
sudo nginx -t
sudo systemctl reload nginx
```

Test HTTP:

```bash
curl -I http://halohola.vn
curl http://halohola.vn/api/health
curl -I http://halohola.xspace.vn
```

The legacy-domain request should return a permanent redirect to `https://halohola.vn/...`.

## 8. HTTPS

Issue/refresh SSL for the official names:

```bash
sudo certbot --nginx -d halohola.vn -d www.halohola.vn
```

If the old domain must redirect over HTTPS too, keep a valid certificate for it as well.

Then:

```bash
curl https://halohola.vn/api/health
```

Expected JSON includes:

```json
{"ok":true,"service":"halo-hola-api","env":"production"}
```

## 9. Later deploys

The repo includes a repeatable script:

```bash
cd /var/www/halo-hola
bash scripts/deploy-vps.sh
```

It pulls `main`, installs dependencies, migrates the database, synchronizes the authoritative HOLA Tour 2026 dataset, builds the frontend, reloads PM2 and saves the PM2 process list.

## 10. Domain policy

`https://halohola.vn` is the canonical public URL used by SEO metadata, sitemap and application links. `halohola.xspace.vn` is legacy-only and should remain a 301 redirect while old links are still in circulation.
