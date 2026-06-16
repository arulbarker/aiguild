# Rules — AI Guild

## Standar inti (tidak bisa dikalahkan aturan lain)

### Git
- Branch utama `master` itu SUCI — dilarang commit/push langsung
- Selalu buat branch baru: `feat/` `fix/` `docs/` `chore/`
- Conventional commits. Commit tiap perubahan berarti
- STOP setelah push — merge HANYA dengan perintah eksplisit user

### Keamanan (prioritas tertinggi)
- Rahasia (token/API key/kredensial) DILARANG di kode & file .md — pakai .env + placeholder
- Semua pintu masuk data (form, API, webhook, upload) wajib divalidasi
- Error message tidak boleh bocorkan detail internal
- Least privilege: tiap komponen akses seminimal yang dibutuhkan
- Identifikasi stack project ini → terapkan best practice keamanannya
  (contoh: Supabase = RLS wajib; VPS = firewall + SSH key + DB tidak publik;
  mobile = API key jangan hardcode; webhook = verifikasi signature)
- Temuan security review tidak boleh di-skip tanpa keputusan eksplisit user

### Testing & monitoring
- Testing: Vitest (sudah dikonfigurasi di project ini)
- Smoke test sebelum setiap push
- PostHog + Sentry wajib SEBELUM launch ke user nyata —
  tapi bukan blocker saat development/prototype

### Aturan prioritas saat konflik
1. Perintah eksplisit user saat ini (terkuat)
2. rules.md ini
3. CLAUDE.md project
4. CLAUDE.md global (kalau ada)
Kecuali: standar inti di atas tidak bisa dikalahkan apapun

### Anti-stuck
Jangan jadikan aturan apapun sebagai blocker yang bikin berhenti kerja.
Kalau aturan tidak bisa dipenuhi karena keterbatasan platform →
laporkan + tawarkan alternatif, terus kerja.

---

## Aturan spesifik project AI Guild

### Git & branch
- Branch default: `master`
- Format branch: `feat/nama-fitur`, `fix/nama-bug`, `docs/nama-doc`, `chore/nama-task`
- Contoh: `feat/admin-edit-modul`, `fix/webhook-signature`, `chore/update-seed`

### Coding
- JavaScript (bukan TypeScript) — jangan tambahkan TypeScript tanpa izin
- App Router Next.js 14 — jangan campur dengan Pages Router
- Prisma 7: selalu pakai `pg.Pool` + `PrismaPg` adapter — JANGAN `new PrismaClient()` langsung
- `lib/db.js` menggunakan Lazy Proxy — jangan ubah pola ini
- Tambah modul baru via `lib/modules-seed.js` + jalankan `npm run seed`
- Jangan install library baru tanpa konfirmasi dulu
- **Schema pakai `prisma db push` (BUKAN `migrate`)** — dev & prod (`deploy.yml`). Project tak punya history migrasi; kolom nullable = aman tanpa reset. Beralih ke `migrate` butuh baseline dulu
- **Tambah kolom DB → WAJIB restart dev server** setelahnya. Prisma client "memotret" struktur saat start; kolom baru tidak terbaca sampai proses di-restart (gejala: error `Unknown argument` / field hilang di response API). Urutan: edit schema → `db push` + `generate` → restart `npm run dev` (minta user) → `npm run seed`

### Dev server (`npm run dev`) — USER yang menyalakan
- **User SELALU menjalankan `npm run dev` sendiri** — Claude DILARANG menyalakannya otomatis.
  Saat butuh server hidup (build/test/cek browser), minta user yang start, jangan jalankan sendiri.
- **Cukup SATU instance `npm run dev`** — jangan pernah ada lebih dari satu dev server jalan
  bersamaan. Beberapa instance berbagi folder `.next` yang sama → build manifest tabrakan →
  chunk JS/CSS 404 → halaman polos tanpa styling / 500 intermiten.
- Gejala "halaman tidak tampil / tanpa CSS": cek dulu `netstat` apakah ada >1 dev server jalan
  (port 3000/3001/3005...). Kalau ada → matikan semua, hapus `.next`, lalu **minta user**
  start ulang satu saja. Bukan bug kode.

### Database — tabel yang tidak boleh diubah sembarangan
- `users.email` — primary identifier, dipakai di magic token dan purchase
- `modules.slug` — dipakai sebagai URL parameter di `/modul/[slug]` + identitas upsert seed; JANGAN ubah saat reorder modul (progress user putus)
- `modules.parent_ids` — relasi DAG, perubahan akan merusak flowchart

### Modul, konten & flowchart
- **Nomor kartu = `orderIndex + 1`; posisi visual ditentukan `parentIds` (DAG), bukan orderIndex.** Sisip/urutkan kartu → lihat skill `insert-modul.md` (geser orderIndex + sambung parentIds)
- 4 tipe konten modul: `youtubeUrl`, `gammaUrl` (Drive `/preview`), `promptText`, `htmlContent`
- `htmlContent` di-render via `dangerouslySetInnerHTML` — AMAN karena hanya dari seed/admin (tepercaya). Kalau suatu hari bisa diisi non-admin → WAJIB sanitasi dulu
- Google Drive embed: `.../file/d/<ID>/preview` (bukan `/view`)

### Notifikasi Telegram
- Notif modul (`lib/telegram.js`) HANYA terpicu dari aksi panel admin (`/api/admin/modules` POST/PATCH). Perubahan via seed/deploy TIDAK notif (cegah spam tiap deploy)
- Token & chat id dari env (`TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`) — dev di `.env.local`, prod di GitHub Secrets. Aman gagal kalau env kosong (notif di-skip, app tidak error)

### Environment variables wajib sebelum run
```
DATABASE_URL          postgresql://aiguild:...@localhost:5432/aiguild
JWT_SECRET            min 32 karakter
TOKEN_SECRET          min 32 karakter
NEXT_PUBLIC_APP_URL   http://localhost:3001 (dev) / https://domain.com (prod)
ADMIN_EMAIL           email admin (untuk seed)
```

### Rahasia & file .md
- Token, API key, password, kredensial apapun DILARANG ditulis di file .md
- Pakai placeholder: `<JWT_SECRET>`, `<RESEND_API_KEY>`, dll
- Catat "nilai asli ada di .env / password manager"

### Keamanan spesifik project ini
- VPS: firewall hanya port 80/443/22, DB tidak terekspos publik
- Webhook Lynk.id dan Mayar.id: WAJIB verifikasi HMAC-SHA256 signature sebelum proses
- Semua API route `/api/*`: cek session sebelum operasi sensitif
- Route `/admin/*`: middleware wajib cek `session.isAdmin === true`

### Kapan harus tanya dulu
- Mau ubah schema Prisma (tambah/hapus kolom/tabel)
- Mau ubah logika auth atau middleware
- Mau install package baru
- Mau ubah konfigurasi deploy atau Dockerfile
- Mau ubah struktur folder utama
