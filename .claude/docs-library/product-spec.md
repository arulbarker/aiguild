# Product Spec — AI Guild

Dokumen hidup. Update hanya saat ada keputusan baru yang disetujui.
Sumber kebenaran produk ini.

---

## Produk ini apa

Platform **toko ecourse** untuk **memanfaatkan AI sampai menghasilkan**. Target: non-IT yang ingin menghasilkan uang dengan bantuan AI. Model akses: **beli per kursus, akses selamanya** via Mayar.id. Banyak kursus dijual terpisah, tiap kursus punya harga sendiri. User beli sebuah kursus → punya akses ke kursus itu tanpa batas waktu → belajar via email magic link. Etalase katalog publik (tanpa login); login hanya untuk masuk ke kursus yang dimiliki.

**Positioning (outcome-first, disetujui 2026-07-05):** janji utama brand = *"Manfaatkan AI sampai menghasilkan jutaan — walau kamu bukan programmer."* (eyebrow: "Platform Kelas AI · Untuk Pemula Non-IT"). Homepage menjual **hasil** (uang dari AI) ditopang **bukti nyata** (galeri screenshot pendapatan bulanan), tiap kelas menjual **skill spesifik**. Nama "AI Guild" = payung AI; **vibe coding = kelas flagship**, bukan keseluruhan brand. Framing lama "Platform Vibe Coding" digantikan.

**Kursus pertama (flagship):** "Vibe Coding Google Apps Script: Dari Nol Bikin Aplikasi Sampai Menghasilkan" (Rp500.000, 20 modul).

> Pivot dari model lama (langganan tahunan single-product) didokumentasikan di [`multi-ecourse-design.md`](./multi-ecourse-design.md) + [`multi-ecourse-plan.md`](./multi-ecourse-plan.md).

---

## Fitur inti (sudah diputuskan)

### Autentikasi
- Magic link via email — tidak ada password
- User dibuat otomatis saat pembelian berhasil (via webhook)
- Session JWT 1 tahun, cookie httpOnly — persist sampai logout manual

### Konten — flowchart modul
- Modul tersusun sebagai DAG (Directed Acyclic Graph) — bukan tree linear
- Satu modul bisa punya banyak parent (multiple prerequisite); `parentIds` adalah `String[]`
- **Struktur kurikulum:** trunk lurus (modul persiapan berurutan) lalu pecah jadi beberapa jalur praktek (GAS, Web App, Desktop, Android) yang punya rantai sub-modul sendiri. `lib/module-tree.js` (`buildSegments`) bedakan 2 pola otomatis: **diamond** (pecah lalu menyatu lagi) vs **tracks** (pecah jadi jalur sendiri, tidak menyatu)
- **Dua mode tampilan flowchart** (toggle di dashboard, default Ringkas): **Ringkas** (`ModuleFlowchartCompact.js` — kotak kecil, seluruh kurikulum muat) vs **Kartu** (`ModuleFlowchart.js` — kartu besar). Desktop: jalur praktek melebar (fan-out); mobile: scroll samping
- Kepala jalur (mis. "Praktek GAS") boleh tanpa konten langsung — kontennya di sub-modul; penomoran bertingkat otomatis dari posisi di jalur
- **4 tipe konten per modul** (bebas kombinasi): `youtubeUrl` (video), `gammaUrl` (Google Drive PDF embed — Gamma.app TIDAK dipakai, X-Frame-Options blokir), `promptText` (prompt copy-paste + tombol Salin), `htmlContent` (materi HTML inline, di-render via `dangerouslySetInnerHTML`)
- **Sumber kebenaran konten (split sengaja):** `promptText` = milik **admin panel** (DB) — di-seed sekali saat create lalu jadi editable, tidak pernah ketimpa reseed. `htmlContent` = milik **kode/IDE** (seed file) — ikut update tiap `npm run seed`, tidak diedit di admin (raw HTML rawan rusak/XSS). Alasan: prompt sering berubah & aman (plain text di `<pre>`); materi HTML jarang berubah & terstruktur
- Viewer punya tab per tipe konten yang ada (Video / Materi / Prompt / Penjelasan)
- **Dua sinyal progress terpisah:** `lastViewedAt` (modul DIBUKA) vs `completed` (DITANDAI SELESAI via tombol). Centang hijau = `completed`; jumlah centang = jumlah konten
- **Badge per-user BARU/UPDATE (jendela 14 hari):** BARU = ditambah <14 hari & user belum buka; UPDATE = `contentUpdatedAt` <14 hari & belum dibuka sejak diubah. Hilang begitu user buka modul
- Progress user dilacak per modul
- Konten dikelola via `lib/modules-seed.js` + `npm run seed` (struktur kartu, `htmlContent`, `parentIds`/urutan; konten berat HTML/prompt awal ada di `lib/card-content/*.html|*.txt` dibaca seed.js) ATAU panel admin (video/materi/judul/urutan/`promptText`) — bukan CMS penuh

### Notifikasi (Telegram)
- Saat admin **tambah** modul (panel) → kirim "📚 Modul baru" ke grup Telegram; **ubah konten** modul → set `contentUpdatedAt` + kirim "✏️ Modul diperbarui" (link clickable)
- Hanya dari aksi panel admin (`/api/admin/modules` POST/PATCH) — perubahan via seed/deploy TIDAK notif (cegah spam tiap deploy)
- `lib/telegram.js` (`sendTelegram`/`notifyModule`), token & chat id dari env (`TELEGRAM_BOT_TOKEN`, `TELEGRAM_CHAT_ID`), aman gagal kalau env kosong
- Grup target = supergroup **forum** "Ai Guild MEMBERSHIP" (chat ID di env). Notif diarahkan ke **topik "Info"** lewat `TELEGRAM_INFO_THREAD_ID` (kosong → topik General)

### Pembayaran & akses — beli per kursus, selamanya
- **Mayar.id** = platform pembayaran. Tiap kursus = 1 produk Mayar (`Course.mayarProductId`). Webhook `payment.received` → buat kepemilikan (baris `Purchase` `userId`+`courseId`, tanpa kedaluwarsa)
- **Kepemilikan = tabel `Purchase`.** Punya kursus = ada baris `Purchase(userId, courseId)`. Cek akses via `lib/ownership.js` (`getOwnedCourseIds` + `hasCourseAccess`). Admin selalu bypass
- **Gerbang akses:** `/api/modules?course=` & `/api/progress` (403 `not_owned`), `/modul/[slug]` & `/belajar/[courseSlug]` (redirect `/kursus/[slug]`) bila tak punya kursus
- **Webhook Mayar:** event `payment.received`; field `data.customerEmail`, `data.id`, `data.productId`. Idempotent via `orderId`/hash body per course
- **Auth webhook:** Mayar pakai **token statis** di header `Authorization: Bearer <token>` (BUKAN HMAC) — diverifikasi vs `MAYAR_WEBHOOK_TOKEN`
- **Gerbang produk:** `data.productId` di-lookup ke `Course.mayarProductId` di DB (`matchCourseByProduct`) — **fail-closed**, produk tak terpetakan diabaikan. Tambah kursus = isi product ID di admin, nol perubahan kode
- **Gateway:** 1 webhook Mayar → Cloudflare Worker fan-out ke beberapa app (ai-guild & ruangsaku)
- Halaman `/kursus/[slug]` (jualan per kursus) & `/sukses` (pasca-bayar). Tidak ada `/perpanjang`, tidak ada cron reminder (akses selamanya)
- **Lynk.id = kanal penjualan KEDUA** (kelas GAS dijual di Mayar & Lynk.id). Webhook `/api/webhook/lynkid`: auth **`x-shared-secret`** (`LYNKID_SHARED_SECRET`), event `lynkid_purchase`, gerbang produk via `Course.lynkidProductTitle` (cocok judul, fail-closed), idempoten per (user, course). Worker Cloudflare `lynkid-router` menerjemahkan payload Lynk.id → format ini (pola sama dengan RuangSaku). Keduanya beri `Purchase(userId, courseId)` yang sama. Mayar tak terpengaruh
- Tidak ada trial, tidak ada langganan, tidak ada kedaluwarsa
- Refund dikelola manual oleh admin
- **Checkout link:** sementara pakai `MAYAR_PAYMENT_URL` (env) untuk kursus pertama. Per-course checkout link ditambah saat kursus ke-2 muncul (lihat backlog)

### Admin panel (brand amber/Sora, semua route dijaga `requireAdmin`)
- `/admin` — ringkasan: total user, kursus, modul, akses kursus terjual, voucher
- `/admin/courses` — **CRUD kursus** (judul, slug, harga, `mayarProductId`, deskripsi, publish, urutan). Hapus ditolak bila kursus masih punya modul
- `/admin/users` — cari email; **beri/cabut akses kursus** per user (baris `Purchase`); toggle admin
- `/admin/modules` — CRUD di UI (tambah/edit/hapus) + **pemilih kursus** (`courseId` wajib saat tambah). Field UI: judul, slug, video, materi (Drive), urutan, deskripsi, **`promptText`** (textarea). `htmlContent`/`parentIds` tetap via seed/kode (IDE)
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
Pengunjung buka / (etalase publik) → lihat katalog + harga (tanpa login)
        ↓
Beli kursus di Mayar (harga per kursus)
        ↓
Gateway (CF Worker) fan-out → webhook /api/webhook/mayar
        ↓
productId → lookup Course → user upsert → Purchase(userId, courseId) [selamanya]
        ↓
User buka /login → input email → klik magic link (email)
        ↓  (dev: auto-redirect tanpa email)
Session dibuat → /dashboard → "Kelasku" (kursus dimiliki) + "Jelajahi"
        ↓
Klik kursus → /belajar/[courseSlug] → flowchart modul → viewer full-screen
        ↓
Mau kursus lain → beli lagi (akses seumur hidup, tidak ada perpanjangan)
```

---

## Keputusan penting

| Keputusan | Alasan |
|---|---|
| Tidak pakai CMS untuk modul | Sederhana, tidak butuh UI tambahan, cukup edit kode |
| **Multi-kursus, beli per kursus, akses selamanya** | Toko ecourse: banyak kursus, harga sendiri. Menggantikan "satu kelas + langganan tahunan" |
| Kepemilikan = tabel `Purchase` (bukan tabel Enrollment baru) | Untuk akses selamanya, "pernah beli" = "boleh akses"; reuse alur webhook |
| Webhook mapping via lookup DB (`Course.mayarProductId`) | Skalabel — tambah kursus tanpa ubah kode |
| Self-hosted di VPS (bukan Vercel) | Kontrol penuh, lebih murah untuk multi-service |
| Magic link tanpa password | Lebih simpel untuk non-IT, tidak ada password forgotten |
| JavaScript (bukan TypeScript) | Lebih cepat untuk solo developer |
| Prisma 7 dengan adapter-pg | Prisma 7 sudah tidak punya binary engine, butuh driver adapter |
| Schema via `prisma db push` (bukan migrasi) | Project tak punya history migrasi. Fresh start → reset bersih di dev |

> **Keputusan lama yang digantikan:** "satu kelas, bukan multi-kelas" & "langganan tahunan Rp1.497rb" — diganti model multi-kursus beli-selamanya (2026-06-22).

---

## Out of scope (yang tidak dikerjakan)

- CMS untuk edit konten modul
- Sistem refund otomatis
- Bundle "beli semua kursus sekaligus"
- Per-course checkout link & voucher per-kursus (sekarang pakai env tunggal + kupon Mayar global)
- Notifikasi WhatsApp (bisa ditambah nanti via Fonnte)
- Forum / komunitas di dalam platform
