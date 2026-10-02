# HALO HOLA

Website HALO HOLA 2026 — **52 góc nhìn · 1 Hòa Lạc**.

## Stack
- React 18 **JSX** + Vite
- React Router
- React Leaflet + OpenStreetMap
- Lucide icons
- CSS responsive theo visual HALO HOLA
- Node.js + Express API
- Prisma + **SQLite**
- Multer upload

**Không dùng Docker. Không cần cài PostgreSQL để chạy local.**

## Chạy local trên Windows

### 1. Cài package
```powershell
npm install
```

### 2. Tạo file môi trường
PowerShell:
```powershell
Copy-Item .env.example .env
```

Nếu đã có `.env` rồi thì bỏ qua bước này.

### 3. Khởi tạo database local
```powershell
npm run setup
```

Lệnh này tự:
- tạo Prisma Client
- tạo database SQLite ở `prisma/dev.db`
- seed dữ liệu HOLA Tour và HOLA Map

### 4. Chạy toàn bộ web + API
```powershell
npm run dev
```

Sau đó mở:
- Web: http://localhost:5173
- API health: http://localhost:4000/api/health
- Admin: http://localhost:5173/admin

Admin dev key mặc định trong `.env.example`:
```
halo-hola-admin-dev
```

## Chạy riêng từng phần
Frontend:
```powershell
npm run dev:web
```

Backend:
```powershell
npm run dev:api
```

## Route chính
- `/` Trang chủ
- `/gui-goc-nhin` Gửi tác phẩm 7 bước
- `/hola-map` HOLA Map
- `/top52` TOP52
- `/tac-pham/:slug` Chi tiết tác phẩm
- `/hola-tour` HOLA Tour
- `/hola-day` HOLA DAY 2026
- `/stories` Stories
- `/we-hola` WE HOLA
- `/dong-hanh` Đối tác
- `/hello` QR landing
- `/admin` Admin

## API chính
- `GET /api/health`
- `POST /api/submissions`
- `GET /api/places`
- `GET /api/tours`
- `GET /api/stories`
- `GET /api/admin/submissions` — cần header `x-admin-key`
- `PATCH /api/admin/submissions/:id/status`

## Production
Khi đưa lên VPS, chạy Node/PM2 như các dự án khác. Có thể giữ SQLite cho quy mô nhỏ hoặc chuyển datasource sang PostgreSQL nếu cần tải lớn hơn.

## Lưu ý
Ảnh giao diện hiện dùng nguồn ảnh online để khóa layout. Khi có image bank HALO HOLA chính thức chỉ cần thay asset/URL, không phải dựng lại layout.
