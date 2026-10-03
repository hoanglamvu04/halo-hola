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


## Nâng cấp vận hành 03/10/2026

- Form gửi tác phẩm 7 bước có auto-save draft.
- Bổ sung tên tác phẩm, thời gian thực hiện, giải thưởng trước đó, quyền tác giả, quyền hình ảnh và guardian consent.
- File original lưu Cloudflare R2 theo key `2026/submissions/HH26-xxxxx/original/v1/`.
- Lưu SHA-256, dung lượng, MIME, revision và metadata file trong PostgreSQL.
- Trang `/tra-cuu` tra cứu bằng mã tác phẩm + email.
- Admin có filter/search, quyền sử dụng, Original Vault và signed download.
- `/jury` có Blind Mode, keyboard navigation, Shortlist và ghi chú BGK.
- HOLA Tour có form đăng ký và mã `HT26-xxxx`.
- Homepage có live campaign stats và timeline 2026.
- Email xác nhận sau submission hoạt động nếu cấu hình SMTP.

### Sau khi pull bản nâng cấp

```powershell
git pull
npm run install:all
npm run db:migrate
npm run dev
```

`db:migrate` cần chạy lại vì schema đã bổ sung metadata submission, R2 media vault và bảng đăng ký HOLA Tour.


## Tự động đồng bộ máy Windows với GitHub

Repo có chế độ dành cho máy development chính:

```powershell
npm run dev:auto
```

Lệnh này tự:
- kiểm tra `origin/main` mỗi 20 giây;
- `git pull --ff-only` khi có commit mới;
- tự cài package nếu `package.json/package-lock.json` thay đổi;
- tự chạy `npm run db:migrate`;
- tự restart frontend + backend;
- không tự pull nếu máy đang có file local chưa commit, để tránh mất code.

Muốn không phải chạy lệnh sau mỗi lần mở máy, cài Windows Scheduled Task **một lần duy nhất**:

```powershell
npm run auto:install
```

Sau đó mỗi lần đăng nhập Windows, HALO HOLA Auto Sync tự chạy nền. Gỡ bằng:

```powershell
npm run auto:remove
```

Log nằm ở:
- `auto-sync.log`
- `dev-server.log`

Có thể double-click `Start-HALO-HOLA.cmd` nếu muốn chạy thủ công mà không mở terminal gõ lệnh.
