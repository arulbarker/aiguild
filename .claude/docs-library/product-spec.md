# Product Spec — AI Guild

Dokumen hidup. Update hanya saat ada keputusan baru yang disetujui.
Sumber kebenaran produk ini.

---

## Produk ini apa

Platform pembelajaran vibe coding berbayar. Target: non-IT yang ingin bangun produk digital dengan bantuan AI. Model akses: **langganan tahunan Rp1.497.000 / tahun (365 hari) via Mayar.id** (Fase 1). User bayar → masa aktif diperpanjang → belajar via email magic link. Akses dicabut otomatis saat masa aktif habis.

---

## Fitur inti (sudah diputuskan)

### Autentikasi
- Magic link via email — tidak ada password
- User dibuat otomatis saat pembelian berhasil (via webhook)
- Session JWT 1 tahun, cookie httpOnly — persist sampai logout manual

### Konten — flowchart modul
- Modul tersusun sebagai DAG (Directed Acyclic Graph) — bukan tree linear
- Satu modul bisa punya banyak parent (multiple prerequisite)
- **4 tipe konten per modul** (bebas kombinasi): `youtubeUrl` (video), `gammaUrl` (Google Drive PDF embed — Gamma.app TIDAK dipakai, X-Frame-Options blokir), `promptText` (prompt copy-paste + tombol Salin), `htmlContent` (materi HTML inline, di-render via `dangerouslySetInnerHTML` — sumber tepercaya seed/admin)
- Viewer punya tab per tipe konten yang ada (Video / Materi / Prompt / Penjelasan)
- **Dua sinyal progress terpisah:** `lastViewedAt` (modul DIBUKA) vs `completed` (DITANDAI SELESAI via tombol). Centang hijau = `completed`; jumlah centang = jumlah konten
- **Badge per-user BARU/UPDATE (jendela 14 hari):** BARU = ditambah <14 hari & user belum buka; UPDATE = `contentUpdatedAt` <14 hari & belum dibuka sejak diubah. Hilang begitu user buka modul
- Progress user dilacak per modul
- Konten dikelola via `lib/modules-seed.js` + `npm run seed` (kartu prompt/HTML, `parentIds`/urutan) ATAU panel admin (video/materi/judul/urutan) — bukan CMS penuh

### Notifikasi (Telegram)
- Saat admin **tambah** modul (panel) → kirim "📚 Modul baru" ke grup Telegram; **ubah konten** modul → set `contentUpdatedAt` + kirim "✏️ Modul diperbarui" (link clickable)
- Hanya dari aksi panel admin (`/api/admin/modules` POST/PATCH) — perubahan via seed/deploy TIDAK notif (cegah spam tiap deploy)
- `lib/telegram.js` (`sendTelegram`/`notifyModule`), token & chat id dari env (`TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`), aman gagal kalau env kosong

### Pembayaran & akses — langganan (Fase 1)
- **Mayar.id** = platform langganan utama. Webhook `payment.paid` → perpanjang `membershipExpiredAt` +365 hari (Rp1.497.000/tahun)
- **Stacking:** perpanjang saat masih aktif → +1 tahun numpuk dari tanggal habis lama (user tak rugi sisa hari)
- **Gerbang akses:** `/api/modules`, `/api/progress` (403), `/modul/[slug]` & `/dashboard` (redirect `/perpanjang`) saat masa aktif habis. Admin selalu bypass
- **Reminder H-3:** cron harian `/api/cron/check-membership` kirim email perpanjang (Resend), idempotent via `reminderSentAt`
- **Webhook Mayar:** event `payment.received`; field `data.customerEmail`, `data.id`, `data.amount`, `data.productId`/`data.productName` (dari docs Mayar)
- **Auth webhook:** Mayar pakai **token statis** di header `Authorization: Bearer <token>` (BUKAN HMAC) — diverifikasi vs `MAYAR_WEBHOOK_TOKEN` (token diset saat daftar webhook di Mayar). Dikonfirmasi dari 3 codebase nyata
- **Gerbang produk:** cocokkan `data.productId` (env `MAYAR_PRODUCT_ID`) / `productName` (`MAYAR_PRODUCT_NAME`) — fail-closed. Nominal jadi lantai opsional (`MAYAR_MIN_AMOUNT`, default mati) supaya diskon voucher lolos
- **Gateway:** 1 webhook Mayar → Cloudflare Worker fan-out ke beberapa app (ai-guild & ruangsaku)
- Halaman `/perpanjang` (tombol bayar) & `/sukses` (pasca-bayar)
- Lynk.id webhook masih ada di kode (legacy/produk lain), bukan model akses AI Guild lagi
- Tidak ada trial, tidak ada level berbeda — aktif = akses semua modul
- Refund dikelola manual oleh admin

### Admin panel (brand amber/Sora, semua route dijaga `requireAdmin`)
- `/admin` — ringkasan: member aktif/expired, total user, modul, pembelian, voucher
- `/admin/users` — cari email; set/perpanjang (+1 thn)/cabut masa aktif manual; toggle admin
- `/admin/modules` — CRUD di UI (tambah/edit/hapus). Field UI: judul, slug, video, materi (Drive), urutan, deskripsi. `promptText`/`htmlContent`/`parentIds` belum ada di UI → masih via seed
- `/admin/purchases` — riwayat pembelian + search email
- `/admin/vouchers` — buat voucher diskon (form) → terdaftar di Mayar via API kupon (`createMayarCoupon`); tabel `Voucher` lokal = cermin daftar; buyer ketik kode di checkout Mayar

### Voucher diskon — Mayar (Opsi B)
- Diskon SELALU dipotong di checkout Mayar (app tak proses harga/pembayaran)
- Voucher dibuat dari admin panel → server kita panggil Mayar `POST /coupon/create` (`MAYAR_API_KEY` server-only)
- Webhook bertumpu `productId` (bukan nominal) → pembeli berdiskon tetap dapat akses 1 tahun
- Nonaktifkan voucher belum didukung API Mayar → manual di dashboard Mayar
- Env: `MAYAR_API_KEY`, `MAYAR_API_BASE` (sandbox `api.mayar.club/hl/v1`, prod `api.mayar.id/hl/v1`)

---

## Alur user utama

```
Langganan di Mayar.id (Rp1.497rb / tahun)
        ↓
Gateway (CF Worker) fan-out → webhook /api/webhook/mayar
        ↓
Filter produk ai-guild → user upsert → membershipExpiredAt +365 hari
        ↓
User buka /login → input email → klik magic link (email)
        ↓  (dev: auto-redirect tanpa email)
Session dibuat → redirect ke /dashboard (akses aktif)
        ↓
Flowchart modul → klik modul → viewer full-screen
        ↓
Masa aktif habis → gerbang redirect ke /perpanjang → bayar lagi (stacking)
Reminder email H-3 sebelum habis
```

---

## Keputusan penting

| Keputusan | Alasan |
|---|---|
| Tidak pakai CMS untuk modul | Sederhana, tidak butuh UI tambahan, cukup edit kode |
| Satu kelas, bukan multi-kelas | MVP dulu, multi-kelas bisa ditambah nanti |
| Self-hosted di VPS (bukan Vercel) | Kontrol penuh, lebih murah untuk multi-service |
| Magic link tanpa password | Lebih simpel untuk non-IT, tidak ada password forgotten |
| JavaScript (bukan TypeScript) | Lebih cepat untuk solo developer |
| Prisma 7 dengan adapter-pg | Prisma 7 sudah tidak punya binary engine, butuh driver adapter |
| Langganan tahunan Rp1.497rb (bukan lifetime) — Fase 1 | Pendapatan berulang, lewat Mayar; ganti model "beli sekali". Paket bulanan tidak dipakai |
| Schema via `prisma db push` (bukan migrasi) | Project tak punya history migrasi; kolom membership nullable = aman tanpa reset. Prod disinkron manual + backup (bukan auto-deploy) |

---

## Out of scope (yang tidak dikerjakan)

- CMS untuk edit konten modul
- Sistem refund otomatis
- Multi-kelas
- Notifikasi WhatsApp (bisa ditambah nanti via Fonnte)
- Forum / komunitas di dalam platform
