# PORTFOLIO APP — Setup & Deployment Guide
# Stack: Vercel (Backend + Frontend) + Aiven MySQL + Cloudinary

---

## PART 1 — SETUP DATABASE AIVEN

### Step 1 — Buat Aiven MySQL Service
1. Daftar / login di https://aiven.io
2. Create New Service → MySQL → Free tier
3. Tunggu hingga status **Running**
4. Buka service → tab **Connection Info** → catat:
   - Host: `mysql-xxxx.aivencloud.com`
   - Port: `(angka 5 digit)`
   - User: `avnadmin`
   - Password: `(dari dashboard)`
   - Database: `defaultdb`

### Step 2 — Import Schema

Di Aiven Console → Query Editor, paste isi `database/schema.sql` lalu jalankan.

> ⚠️ Schema sudah menggunakan `USE defaultdb` — cocok untuk Aiven.

Setelah schema selesai, import `database/seed_admin.sql` untuk membuat akun admin.

**Default login:**
```
Username: admin
Password: Admin@1234
```
⚠️ **Ganti password segera setelah login pertama!**

---

## PART 2 — SETUP CLOUDINARY

### Step 1 — Buat Akun Cloudinary
1. Daftar di https://cloudinary.com (free tier tersedia)
2. Setelah login, buka **Dashboard**
3. Catat 3 nilai ini:
   - **Cloud Name**
   - **API Key**
   - **API Secret**

---

## PART 3 — DEPLOY BACKEND KE VERCEL

### Step 1 — Install Vercel CLI (sekali saja)
```bash
npm install -g vercel
```

### Step 2 — Login ke Vercel
```bash
vercel login
```

### Step 3 — Deploy dari folder backend
```bash
cd backend
vercel --prod
```
Ikuti prompt, pilih nama project (misal: `portfolio-api`).

### Step 4 — Set Environment Variables di Vercel Dashboard

Buka https://vercel.com → Project `portfolio-api` → Settings → Environment Variables

Tambahkan semua variabel berikut (lihat `backend/.env.example` untuk referensi):

| Variable | Nilai |
|----------|-------|
| `NODE_ENV` | `production` |
| `DB_HOST` | `mysql-xxxx.aivencloud.com` |
| `DB_PORT` | `12345` |
| `DB_USER` | `avnadmin` |
| `DB_PASSWORD` | `password_dari_aiven` |
| `DB_NAME` | `defaultdb` |
| `DB_SSL` | `true` |
| `JWT_SECRET` | *(generate: lihat di bawah)* |
| `JWT_EXPIRES_IN` | `7d` |
| `CLOUDINARY_CLOUD_NAME` | `your_cloud_name` |
| `CLOUDINARY_API_KEY` | `your_api_key` |
| `CLOUDINARY_API_SECRET` | `your_api_secret` |
| `CORS_ORIGINS` | `https://your-portfolio.vercel.app,https://your-admin.vercel.app` |
| `BCRYPT_ROUNDS` | `12` |
| `SMTP_HOST` | `smtp.gmail.com` *(opsional)* |
| `SMTP_PORT` | `587` *(opsional)* |
| `SMTP_USER` | `email@gmail.com` *(opsional)* |
| `SMTP_PASS` | `gmail_app_password` *(opsional)* |
| `NOTIFY_EMAIL` | `email@gmail.com` *(opsional)* |

**Generate JWT_SECRET:**
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Step 5 — Redeploy setelah env vars diset
```bash
cd backend
vercel --prod
```

### Step 6 — Test Backend
```
GET https://portfolio-api.vercel.app/api/health
```
Harus mengembalikan:
```json
{ "success": true, "status": "OK" }
```

---

## PART 4 — DEPLOY FRONTEND PORTFOLIO KE VERCEL

### Step 1 — Update PROD_API di config.js

Edit `frontend/portfolio/js/config.js`:
```js
const PROD_API = 'https://YOUR-BACKEND-URL.vercel.app';
// Contoh: 'https://portfolio-api.vercel.app'
```

### Step 2 — Deploy
```bash
cd frontend/portfolio
vercel --prod
```
Catat URL yang diberikan Vercel (misal: `https://my-portfolio.vercel.app`)

---

## PART 5 — DEPLOY FRONTEND ADMIN KE VERCEL

### Step 1 — Update PROD_API di config.js

Edit `frontend/admin/js/config.js`:
```js
const PROD_API = 'https://YOUR-BACKEND-URL.vercel.app';
// Sama dengan yang di portfolio
```

### Step 2 — Deploy
```bash
cd frontend/admin
vercel --prod
```
Catat URL admin (misal: `https://my-admin.vercel.app`)

---

## PART 6 — UPDATE CORS_ORIGINS DI BACKEND

Setelah mendapat URL portfolio dan admin, kembali ke Vercel Dashboard backend:

1. Settings → Environment Variables → `CORS_ORIGINS`
2. Update nilainya:
```
https://my-portfolio.vercel.app,https://my-admin.vercel.app
```
3. Redeploy backend:
```bash
cd backend
vercel --prod
```

---

## PART 7 — LOCAL DEVELOPMENT

### Setup
```bash
cd backend
cp .env.example .env
# Edit .env dengan nilai lokal (DB_HOST=localhost, DB_SSL=false, dll)
npm install
npm run dev
```

### Frontend lokal
Buka `frontend/portfolio/index.html` dan `frontend/admin/index.html` dengan VS Code Live Server.

Config.js akan otomatis mendeteksi `localhost` dan menggunakan `http://localhost:5000`.

---

## QUICK REFERENCE

### API Endpoints
| Method | Endpoint | Auth | Deskripsi |
|--------|----------|------|-----------|
| POST | /api/auth/login | No | Login admin |
| GET | /api/auth/me | JWT | Info user aktif |
| PUT | /api/auth/change-password | JWT | Ganti password |
| GET | /api/profile | No | Data profil publik |
| PUT | /api/profile | JWT | Update profil |
| POST | /api/profile/photo | JWT | Upload foto (field: `photo`) |
| POST | /api/profile/cv | JWT | Upload CV (field: `cv`) |
| GET | /api/experiences | No | Daftar pengalaman |
| POST | /api/experiences | JWT | Tambah pengalaman |
| PUT | /api/experiences/:id | JWT | Update pengalaman |
| DELETE | /api/experiences/:id | JWT | Hapus pengalaman |
| GET | /api/projects | No | Daftar project |
| POST | /api/projects | JWT | Tambah project (field: `image`) |
| PUT | /api/projects/:id | JWT | Update project (field: `image`) |
| DELETE | /api/projects/:id | JWT | Hapus project |
| GET | /api/education | No | Daftar pendidikan |
| POST | /api/education | JWT | Tambah pendidikan |
| PUT | /api/education/:id | JWT | Update pendidikan |
| DELETE | /api/education/:id | JWT | Hapus pendidikan |
| GET | /api/certificates | No | Daftar sertifikat |
| POST | /api/certificates | JWT | Tambah sertifikat (field: `image`) |
| PUT | /api/certificates/:id | JWT | Update sertifikat (field: `image`) |
| DELETE | /api/certificates/:id | JWT | Hapus sertifikat |
| GET | /api/skills | No | Daftar skill |
| POST | /api/skills | JWT | Tambah skill |
| PUT | /api/skills/:id | JWT | Update skill |
| DELETE | /api/skills/:id | JWT | Hapus skill |
| POST | /api/contacts | No | Kirim pesan (contact form) |
| GET | /api/contacts | JWT | Daftar pesan (admin) |
| GET | /api/contacts/:id | JWT | Baca pesan |
| PATCH | /api/contacts/:id/read | JWT | Tandai baca |
| DELETE | /api/contacts/:id | JWT | Hapus pesan |
| GET | /api/health | No | Health check |

### Troubleshooting
```
# CORS error di browser
→ Pastikan CORS_ORIGINS di env backend = URL frontend yang benar
→ Redeploy backend setelah update env

# 401 Unauthorized
→ JWT_SECRET belum di-set di Vercel env
→ Token expired — logout & login ulang

# Upload foto/CV gagal
→ Pastikan CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET di-set
→ Cek Vercel function logs: vercel logs

# DB connection failed
→ Cek DB_HOST, DB_PORT, DB_USER, DB_PASSWORD, DB_NAME
→ Pastikan DB_SSL=true untuk Aiven
→ Cek IP whitelist di Aiven (allow 0.0.0.0/0 untuk Vercel)

# Gambar tidak muncul di admin
→ Cloudinary menyimpan URL penuh — tidak perlu tambah prefix apapun
→ Pastikan upload berhasil dengan cek Cloudinary Media Library

# Aiven connection timeout
→ Aiven free tier bisa hibernate — coba koneksi lagi
→ Set keepAliveInitialDelay di db.js (sudah 30s)
```
