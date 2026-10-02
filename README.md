# HALO HOLA

Website HALO HOLA 2026 — **52 góc nhìn · 1 Hòa Lạc**.

## Stack
- React 18 **JSX** + Vite
- React Router
- React Leaflet + OpenStreetMap
- Lucide icons
- CSS responsive riêng theo visual HALO HOLA
- Node.js + Express API
- Prisma + PostgreSQL
- Multer upload
- Docker / Docker Compose

## Route chính
- `/` Trang chủ
- `/gui-goc-nhin` Gửi tác phẩm 7 bước + upload thật qua API
- `/hola-map` HOLA Map
- `/top52` TOP52
- `/tac-pham/:slug` Chi tiết tác phẩm
- `/hola-tour` HOLA Tour
- `/hola-day` HOLA DAY 2026
- `/stories` Stories
- `/we-hola` WE HOLA
- `/dong-hanh` Đối tác
- `/hello` QR landing
- `/admin` Admin UI

## Chạy local

### 1. Cài package
```bash
npm install
```

### 2. Tạo env
```bash
cp .env.example .env
```

### 3. PostgreSQL + Prisma
Tạo database theo `DATABASE_URL`, sau đó:
```bash
npm run prisma:generate
npm run prisma:migrate -- --name init
npm run prisma:seed
```

### 4. Chạy API
```bash
npm run dev:api
```

### 5. Chạy web
Mở terminal khác:
```bash
npm run dev:web
```

Web: http://localhost:5173  
API: http://localhost:4000/api

## Docker
```bash
docker compose up -d --build
docker compose exec app npm run prisma:seed
```

Sau đó mở: http://localhost:4000

## API chính
- `GET /api/health`
- `POST /api/submissions` — nộp tác phẩm multipart
- `GET /api/places`
- `GET /api/tours`
- `GET /api/stories`
- `GET /api/admin/submissions` — cần header `x-admin-key`
- `PATCH /api/admin/submissions/:id/status` — cập nhật trạng thái duyệt

## Trạng thái
UI hiện đã dựng đầy đủ bộ màn hình lõi theo concept đã chốt. Ảnh demo đang dùng nguồn ảnh online để khóa layout nhanh; khi có image bank chính thức HALO HOLA chỉ cần thay URL/asset, không phải dựng lại giao diện.
