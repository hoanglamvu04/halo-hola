# HALO HOLA 2026

Nền tảng **HALO HOLA — 52 góc nhìn · 1 Hòa Lạc**.

Kiến trúc dự án được tổ chức theo cùng cách với **Bản đồ Hòa Lạc**: frontend và backend tách riêng, root chỉ dùng để điều phối lệnh chạy.

## Architecture

```
.
├── frontend/              React 18 + Vite + React Router
│   └── src/
│       ├── components/
│       ├── data/
│       ├── pages/
│       └── services/
├── backend/               Node.js + Express REST API
│   └── src/
│       ├── config/
│       ├── database/
│       ├── middleware/
│       ├── routes/
│       ├── services/
│       ├── utils/
│       └── validators/
└── package.json           chạy frontend + backend cùng lúc
```

**Local development không dùng Docker.**

## Công nghệ

### Frontend
- React 18 JSX
- Vite
- React Router
- Axios
- React Leaflet + OpenStreetMap
- Lucide React

### Backend
- Node.js + Express
- PostgreSQL chạy native
- JWT auth
- bcrypt
- Zod validation
- Helmet + CORS + rate limit
- Multer upload

## Chuẩn bị PostgreSQL

Tạo database:

```sql
CREATE DATABASE halo_hola;
```

HALO HOLA hiện không cần PostGIS để chạy chức năng lõi.

## Chạy local trên Windows

### 1. Cài dependencies

Ở thư mục gốc:

```powershell
npm install
npm run install:all
```

### 2. Tạo env

```powershell
Copy-Item backend/.env.example backend/.env
Copy-Item frontend/.env.example frontend/.env
```

Mở `backend/.env` và sửa:

```
DATABASE_URL=postgresql://postgres:MAT_KHAU_POSTGRES@localhost:5432/halo_hola
JWT_SECRET=CHUOI_BI_MAT_DAI_NGAU_NHIEN
```

### 3. Tạo bảng + dữ liệu mẫu

```powershell
npm run db:migrate
npm run db:seed
```

Nếu muốn tạo tài khoản admin, điền ba biến sau trong `backend/.env`:

```
ADMIN_SEED_NAME=HALO HOLA Admin
ADMIN_SEED_EMAIL=admin@halohola.vn
ADMIN_SEED_PASSWORD=MAT_KHAU_CUA_BAN
```

Sau đó:

```powershell
npm run db:seed:admin
```

### 4. Chạy cả frontend + backend

```powershell
npm run dev
```

Mặc định:
- Frontend: http://localhost:5173
- Backend: http://localhost:5000/api
- Health: http://localhost:5000/api/health

Nếu cổng bị chiếm, cả Vite và backend đều có cơ chế thử cổng tiếp theo.

## Các màn hình hiện có

- `/` Trang chủ
- `/gui-goc-nhin` Gửi tác phẩm 7 bước
- `/hola-map` HOLA Map
- `/top52` TOP52
- `/tac-pham/:slug` Chi tiết tác phẩm
- `/hola-tour` HOLA Tour
- `/hola-day` HOLA DAY
- `/stories` Stories
- `/we-hola` WE HOLA
- `/dong-hanh` Đối tác
- `/hello` QR landing
- `/admin` Admin

## API lõi

- `GET /api/health`
- `POST /api/auth/login`
- `POST /api/submissions`
- `GET /api/places`
- `GET /api/tours`
- `GET /api/stories`
- `GET /api/admin/submissions`
- `PATCH /api/admin/submissions/:id/status`

## Ghi chú triển khai

Production chạy Node/PM2 + PostgreSQL native giống hướng triển khai Bản đồ Hòa Lạc. Không cần Docker.
