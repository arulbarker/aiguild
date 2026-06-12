# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

# AI Guild

## Tentang project ini
Platform pembelajaran vibe coding berbayar. User beli akses via Lynk.id atau Mayar.id, masuk dengan magic link, lalu belajar lewat flowchart modul interaktif (video YouTube + slide Gamma.app). Semua berjalan di VPS Hostinger via Coolify.

## Tech stack
- **Frontend + Backend:** Next.js 14 App Router (JavaScript)
- **Database:** PostgreSQL + Prisma 7 + `@prisma/adapter-pg`
- **Auth:** Magic link custom (jose JWT, Resend email)
- **Styling:** Tailwind CSS 3
- **Deploy:** VPS Hostinger (Coolify + Docker) + GitHub Actions auto-deploy
- **Monitoring:** PostHog (analytics) + Sentry (error tracking)
- **Testing:** Vitest

---

## Cara baca library ini
Semua detail ada di file-file berikut:

### Aturan wajib
→ `.claude/rules.md`

### Status & progress harian
→ `.claude/SESSION.md`

### SOP & cara kerja
→ `.claude/skills/git-workflow.md`
→ `.claude/skills/deploy.md`
→ `.claude/skills/new-feature.md`
→ `.claude/skills/doc-sync.md` — ketik **"sync docs"** untuk audit dokumen

### Produk & ide
→ `.claude/docs-library/product-spec.md` — sumber kebenaran produk (apa, fitur, alur)
→ `.claude/docs-library/ideas-backlog.md` — tampungan ide baru & keputusan batal

Aturan: ide baru → catat di backlog dulu → tanya user "sekarang/nanti/simpan".
Keputusan dibatalkan → hapus dari product-spec, catat di backlog status BATAL.

### Dokumentasi teknis
→ `.claude/docs-library/README.md` — aturan folder docs-library

---

## Aturan otomatis setiap sesi
- Baca file library yang **relevan dengan task saat ini saja** — jangan semua
- `"tutup sesi"` → jalankan checklist akhir sesi di SESSION.md
- `"sync docs"` → audit semua dokumen via skills/doc-sync.md
- Ide baru dari user → ideas-backlog.md dulu, tanya "sekarang/nanti/simpan"
- File .md baru dari sumber apapun → sorting dulu ("siapa yang butuh?")

---

## Aturan cepat (wajib diingat)
1. **Prisma 7:** selalu `new Pool() → new PrismaPg(pool)` — `new PrismaClient()` langsung = error
2. **SSH tunnel wajib aktif** sebelum dev server bisa koneksi ke DB (`npm run dev` sudah otomatis)
3. **Dev mode bypass:** di `NODE_ENV=development`, API send-link return `devUrl` langsung, tidak kirim email
4. **Module DAG:** `Module.parentIds` adalah `String[]` — satu modul bisa punya banyak parent
5. **master branch suci:** selalu buat branch baru, STOP setelah push, merge hanya dengan perintah eksplisit

---

## Commands
```bash
npm run dev        # SSH tunnel ke VPS postgres + Next.js dev server
npm run seed       # Seed modul dan admin user (butuh tunnel aktif)
npm run build      # Production build
npm run test       # Vitest test suite

npx prisma migrate dev --name nama   # Buat migrasi baru
npx prisma migrate deploy            # Apply migrasi ke prod
npx prisma generate                  # Regenerate Prisma client
```

## Catatan khusus
- Dev server berjalan di `localhost:3001` jika port 3000 sudah terpakai — update `NEXT_PUBLIC_APP_URL` di `.env.local` sesuai
- SSH tunnel target: IP container postgres (diambil dinamis via `docker inspect`) — bukan hostname `aiguild-postgres` yang hanya resolve di dalam Docker
- Tambah modul baru: edit `lib/modules-seed.js` lalu `npm run seed`
- Admin user: set `ADMIN_EMAIL` di `.env.local` sebelum seed
