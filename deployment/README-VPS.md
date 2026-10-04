# HALO HOLA — VPS deployment

Temporary production domain: **halohola.xspace.vn**

Architecture:

- Nginx serves `frontend/dist`
- Nginx proxies `/api` and `/uploads` to Node.js on `127.0.0.1:5000`
- PM2 keeps the backend online
- PostgreSQL runs natively on the VPS
- Frontend uses `VITE_API_URL=/api`, so changing domain later is simple

## 1. DNS

Create an **A record**:

- Name: `halohola`
- Target: your VPS public IPv4
- Proxy: DNS-only while first issuing SSL (if using Cloudflare, orange-cloud can be enabled later)

Wait until:

```bash
getent hosts halohola.xspace.vn
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

Important temporary-domain values:

```env
# backend/.env
NODE_ENV=production
PORT=5000
PUBLIC_BASE_URL=https://halohola.xspace.vn
CORS_ORIGIN=https://halohola.xspace.vn
```

```env
# frontend/.env.production
VITE_API_URL=/api
VITE_SITE_URL=https://halohola.xspace.vn
```

Fill PostgreSQL, JWT, R2 and optional SMTP secrets in `backend/.env`.

## 6. First deploy

```bash
cd /var/www/halo-hola
npm install --prefix backend --omit=dev
npm install --prefix frontend
npm run db:migrate --prefix backend
npm run build --prefix frontend
pm2 start ecosystem.config.cjs
pm2 save
pm2 startup
```

Run the final command printed by `pm2 startup` once, then run `pm2 save` again.

## 7. Nginx

```bash
sudo cp deployment/nginx-halohola.xspace.vn.conf /etc/nginx/sites-available/halohola.xspace.vn
sudo ln -sfn /etc/nginx/sites-available/halohola.xspace.vn /etc/nginx/sites-enabled/halohola.xspace.vn
sudo nginx -t
sudo systemctl reload nginx
```

Test HTTP:

```bash
curl -I http://halohola.xspace.vn
curl http://halohola.xspace.vn/api/health
```

## 8. HTTPS

```bash
sudo certbot --nginx -d halohola.xspace.vn
```

Then:

```bash
curl https://halohola.xspace.vn/api/health
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

It pulls `main`, installs dependencies, migrates the database, builds the frontend, reloads PM2 and saves the PM2 process list.

## 10. Switching to the official domain later

Because the frontend API is relative (`/api`), the API host does not need to be rewritten.

1. Point the official domain to the same VPS.
2. Add the official domain to Nginx `server_name`.
3. Temporarily allow both origins:
   ```env
   CORS_ORIGIN=https://halohola.xspace.vn,https://YOUR_OFFICIAL_DOMAIN
   ```
4. Change:
   ```env
   PUBLIC_BASE_URL=https://YOUR_OFFICIAL_DOMAIN
   VITE_SITE_URL=https://YOUR_OFFICIAL_DOMAIN
   ```
5. Rebuild/reload:
   ```bash
   bash scripts/deploy-vps.sh
   ```
6. Issue SSL for the official domain.
7. After validation, optionally redirect the temporary domain to the official domain.
