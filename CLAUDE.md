# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

```bash
npm run dev        # SSH tunnel ke VPS postgres + Next.js dev server
npm run seed       # Seed modul dan admin user ke DB (butuh tunnel aktif)
npm run build      # Production build
npm run test       # Vitest test suite
```

**Migrasi database:**
```bash
npx prisma migrate dev --name nama-migration   # Buat migrasi baru
npx prisma migrate deploy                       # Apply migrasi ke prod
npx prisma generate                             # Regenerate Prisma client
```

Dev server berjalan di `localhost:3001` jika port 3000 sudah terpakai. `npm run dev` otomatis buka SSH tunnel ke VPS sebelum start Next.js.

## SSH Tunnel (Penting untuk Local Dev)

Database ada di VPS (Docker container `aiguild-postgres`). Untuk akses lokal, `npm run dev` membuka SSH tunnel:
- **Local:** `localhost:5433`
- **Target:** IP container postgres di VPS (diambil dinamis via `docker inspect`)
- **Key:** `~/.ssh/aiguild_vps`

Jika tunnel mati tiba-tiba, jalankan ulang `npm run dev`. Container `aiguild-postgres` tidak publish port ke host VPS — tunnel harus mengarah ke IP container langsung, **bukan** hostname `aiguild-postgres`.

## Arsitektur

**Stack:** Next.js 14 App Router (JavaScript) + PostgreSQL + Prisma 7 + Tailwind CSS

**Autentikasi — magic link custom:**
1. User kirim email → `POST /api/auth/send-link`
2. API generate token (raw), simpan hash di tabel `magic_tokens`, kirim via Resend
3. User klik link → `GET /auth/verify?token=...` → verifikasi hash, buat JWT session (cookie `aiguild_session`, 30 hari)
4. **Dev mode bypass:** `NODE_ENV=development` → API return `devUrl` langsung di JSON, browser auto-redirect tanpa email

**Proteksi route (middleware.js):**
- `/dashboard/*` dan `/modul/*` → butuh session valid
- `/admin/*` → butuh `session.isAdmin === true`
- `/login` → redirect ke `/dashboard` jika sudah login

**Alur pembelian (webhook):**
- Lynk.id: `POST /api/webhook/lynkid` — verifikasi HMAC-SHA256, upsert user, catat purchase
- Mayar.id: `POST /api/webhook/mayar` — pola sama
- Kedua webhook idempoten berdasarkan `orderId`

**Flowchart modul:**
- `Module.parentIds` adalah `String[]` (PostgreSQL array) — relasi DAG, bukan tree
- `ModuleFlowchart.js` render SVG murni dengan BFS layout: root nodes di atas, children di bawah
- Node dengan `parentIds = []` adalah root; satu modul bisa punya multiple parents

**Prisma 7 — KRITIS:**
```js
// BENAR — butuh pg.Pool eksplisit
import pg from 'pg'
import { PrismaPg } from '@prisma/adapter-pg'
const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
new PrismaClient({ adapter })

// SALAH — ini error di Prisma 7
new PrismaClient({ datasourceUrl: process.env.DATABASE_URL })
```

`lib/db.js` menggunakan Lazy Proxy pattern agar `PrismaClient` tidak diinisialisasi saat module load (mencegah error di build time).

`prisma.config.ts` — Prisma 7 memindahkan `url` datasource ke sini (bukan di `schema.prisma`).

## Struktur Kunci

```
app/
  api/auth/        # send-link, verify (GET), logout
  api/webhook/     # lynkid, mayar (penerima pembayaran)
  api/modules/     # GET list modul + completedIds user
  api/progress/    # POST tandai modul selesai
  api/admin/       # CRUD users, modules, purchases
  dashboard/       # Halaman utama: flowchart + viewer
  modul/[slug]/    # Deep-link ke modul tertentu
  admin/           # Panel admin
lib/
  db.js            # Prisma client (Lazy Proxy + pg.Pool adapter)
  auth.js          # createSession / getSession / clearSession (JWT via jose)
  tokens.js        # generateToken + hashToken (HMAC-SHA256)
  email.js         # sendMagicLink via Resend
  modules-seed.js  # Data modul untuk seed
components/
  ModuleFlowchart.js  # SVG DAG renderer dengan BFS layout
  ModuleViewer.js     # Full-screen viewer: YouTube iframe + Gamma embed
  Sidebar.js          # Panel daftar modul (collapsible)
scripts/
  dev-start.js     # SSH tunnel + Next.js dev (dipakai npm run dev)
  seed.js          # Seed modul + admin user
```

## Deploy

Push ke branch `master` → GitHub Actions auto-deploy ke VPS via SSH (`appleboy/ssh-action`), menjalankan `/data/deploy-aiguild.sh` di VPS.

`next.config.mjs` menggunakan `output: 'standalone'` — Docker build menyalin folder `.next/standalone`, bukan `node_modules` penuh.

## Environment Variables

File `.env.local` untuk dev. Variabel wajib:
- `DATABASE_URL` — PostgreSQL connection string (arahkan ke tunnel: `localhost:5433`)
- `JWT_SECRET` — secret untuk signing session cookie
- `TOKEN_SECRET` — secret untuk HMAC magic token
- `NEXT_PUBLIC_APP_URL` — base URL (sesuaikan port jika dev server pindah port)
- `ADMIN_EMAIL` — email yang otomatis jadi admin saat `npm run seed`
- `RESEND_API_KEY` — untuk kirim magic link di production
- `LYNKID_WEBHOOK_SECRET` / `MAYAR_WEBHOOK_SECRET` — verifikasi signature webhook

## Monitoring

- **PostHog** — client-side analytics, di-wrap di `components/PostHogProvider.js`
- **Sentry** — error tracking, dikonfigurasi via `next.config.mjs` (`withSentryConfig`)
