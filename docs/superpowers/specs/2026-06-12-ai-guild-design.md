# AI Guild — Platform Pembelajaran Vibe Coding
**Tanggal**: 2026-06-12
**Status**: Approved

---

## Ringkasan

Platform pembelajaran vibe coding berbayar. User beli kelas via Lynk.id atau Mayar.id, lalu akses konten via email magic link. Semua infrastruktur berjalan di VPS Hostinger (Ubuntu) yang dimanage Coolify.

---

## Arsitektur

### Stack
- **Frontend + Backend**: Next.js App Router (JavaScript)
- **Database**: PostgreSQL (Docker container di VPS)
- **Auth**: NextAuth.js dengan email magic link (tanpa password)
- **Email**: Resend API (kirim magic link saja, data tidak disimpan di sana)
- **Deployment**: Coolify di VPS Hostinger `187.77.122.42` (Ubuntu)
- **SSL + Routing**: Traefik (otomatis via Coolify)
- **Analytics**: PostHog
- **Error tracking**: Sentry

### Infrastruktur VPS
```
VPS Hostinger (Ubuntu)
└── Coolify
    ├── [Container 1] Next.js App  — frontend + API routes + webhook handler
    ├── [Container 2] PostgreSQL   — semua data
    └── Traefik                    — SSL otomatis + routing domain
```

Tidak ada layanan external yang menyimpan data user. Resend, PostHog, dan Sentry hanya menerima event/log, bukan data sensitif.

---

## Fitur & Halaman

### Halaman User
| Route | Deskripsi |
|---|---|
| `/` | Landing page — deskripsi kelas, CTA beli |
| `/login` | Form input email untuk request magic link |
| `/auth/verify` | Handler verifikasi token dari link email |
| `/dashboard` | Flowchart semua modul (bercabang, interaktif) |
| `/modul/[slug]` | Viewer modul — full-screen, tab Video + Materi |

### Halaman Admin
| Route | Deskripsi |
|---|---|
| `/admin` | Dashboard: jumlah user, pembelian terbaru, stats |
| `/admin/users` | Daftar semua user, filter by status, revoke akses |
| `/admin/modules` | Lihat daftar modul, edit title/youtube_url/gamma_url |
| `/admin/purchases` | Riwayat pembelian dari Lynk.id dan Mayar.id |

### Webhook Endpoints
| Route | Sumber |
|---|---|
| `POST /api/webhook/lynkid` | Lynk.id — terima event order selesai |
| `POST /api/webhook/mayar` | Mayar.id — terima event payment sukses |

Kedua webhook memverifikasi signature/token sebelum memproses. Setelah verifikasi: simpan email ke database, buat record purchase, kirim magic link ke email pembeli.

---

## Auth Flow

```
User beli di Lynk.id / Mayar.id
        ↓
Webhook diterima API → verifikasi signature
        ↓
Email disimpan ke tabel users (jika belum ada)
Purchase disimpan ke tabel purchases
        ↓
Magic link dikirim via Resend ke email pembeli
        ↓
User klik link → session dibuat (30 hari)
        ↓
Redirect ke /dashboard
```

User yang sudah punya akun bisa login ulang via `/login` → input email → klik magic link baru.

---

## UI — Module Viewer

### Halaman Dashboard (`/dashboard`)
- Flowchart vertikal, modul bisa bercabang (struktur DAG)
- Garis penghubung antar modul dengan panah
- Klik modul → navigasi ke `/modul/[slug]`
- Sidebar collapsed by default — strip tipis di kiri dengan ikon ☰ dan dot penanda modul aktif

### Halaman Modul (`/modul/[slug]`)
- Konten full-screen
- Header: nama modul + dua tab — **Video** dan **Materi**
- Tab Video: YouTube embed full-width
- Tab Materi: Gamma.app embed full-width
- Navigasi bawah: ← modul sebelumnya | nomor / total | modul berikutnya →
- Sidebar collapsed (sama seperti dashboard), bisa dibuka untuk lihat semua modul

---

## Database Schema

### Tabel `users`
```sql
id          UUID PRIMARY KEY
email       TEXT UNIQUE NOT NULL
name        TEXT
is_admin    BOOLEAN DEFAULT false
created_at  TIMESTAMP DEFAULT now()
```

### Tabel `modules`
```sql
id          UUID PRIMARY KEY
title       TEXT NOT NULL
slug        TEXT UNIQUE NOT NULL
description TEXT
youtube_url TEXT
gamma_url   TEXT
parent_ids  UUID[]          -- array, kosong = root module
order_index INTEGER DEFAULT 0
created_at  TIMESTAMP DEFAULT now()
```

### Tabel `purchases`
```sql
id            UUID PRIMARY KEY
user_id       UUID REFERENCES users(id)
source        TEXT NOT NULL   -- 'lynkid' atau 'mayar'
order_id      TEXT            -- ID order dari platform
purchased_at  TIMESTAMP DEFAULT now()
```

### Tabel `user_progress`
```sql
user_id        UUID REFERENCES users(id)
module_id      UUID REFERENCES modules(id)
last_viewed_at TIMESTAMP DEFAULT now()
PRIMARY KEY (user_id, module_id)
```

---

## Manajemen Konten Modul

Konten modul (title, youtube_url, gamma_url, parent_ids) dikelola langsung via edit kode atau SQL query langsung ke PostgreSQL. Tidak ada CMS UI untuk ini — admin panel hanya untuk mengelola user dan melihat data pembelian.

---

## Keamanan

- Webhook Lynk.id dan Mayar.id: wajib verifikasi signature/token header sebelum proses
- Semua API route yang sensitif: cek session auth sebelum eksekusi
- Admin routes (`/admin/*`): middleware cek `is_admin = true`
- PostgreSQL tidak terekspos ke publik — hanya bisa diakses dari container Next.js
- Semua rahasia (DB password, Resend API key, webhook secret) di environment variables Coolify, tidak di kode

---

## Monitoring

- **PostHog**: dipasang di frontend untuk tracking page views, klik modul, durasi tonton
- **Sentry**: dipasang di frontend dan API routes untuk tracking error runtime
- Keduanya dikonfigurasi sebelum launch ke user nyata

---

## Setup VPS — Urutan Instalasi

1. SSH ke VPS: `ssh root@187.77.122.42`
2. Install Coolify (one-line script resmi)
3. Buka Coolify dashboard via browser
4. Tambah PostgreSQL service di Coolify
5. Tambah Next.js project (dari GitHub repo atau Docker)
6. Set environment variables di Coolify
7. Set domain + aktifkan SSL via Traefik
8. Daftarkan webhook URL ke Lynk.id dan Mayar.id

---

## Yang Tidak Termasuk (Out of Scope)

- CMS untuk edit konten modul — kelola via kode langsung
- Sistem refund otomatis
- Multi-kelas — hanya satu kelas dengan modul bercabang
- Notifikasi WhatsApp (bisa ditambah nanti via Fonnte)
