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

### Database — tabel yang tidak boleh diubah sembarangan
- `users.email` — primary identifier, dipakai di magic token dan purchase
- `modules.slug` — dipakai sebagai URL parameter di `/modul/[slug]`
- `modules.parent_ids` — relasi DAG, perubahan akan merusak flowchart

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
