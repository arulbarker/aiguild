# Rencana — Integrasi Lynk.id → AI Guild (jual kelas GAS di dua tempat)

Tanggal: 2026-07-01 · Branch: `feat/lynkid-integration` · Status: disetujui, siap implementasi

## Tujuan
Kelas `vibe-coding-gas` (Google Apps Script) dijual di **dua tempat**: Mayar (sudah jalan) dan Lynk.id (baru). Saat ada yang beli di Lynk.id, email pembeli tersimpan di database AI Guild dan Purchase-nya mengaitkan ke course tsb, sehingga pembeli tinggal login pakai email → langsung masuk ruang belajar.

## Prinsip (batasan wajib)
- **Mayar tidak disentuh sama sekali** — kode webhook Mayar, gateway Mayar, `mayarProductId` tetap.
- **Meniru pola RuangSaku** yang sudah terbukti di Worker `lynkid-router`: autentikasi pakai header `x-shared-secret` (bukan HMAC).
- Tambah kelas Lynk.id baru = cukup isi field di admin, **nol ubah kode webhook** (sejajar filosofi `mayarProductId`).

## Kondisi awal (hasil investigasi)
- Cloudflare Worker `lynkid-router` sudah jadi **satu pintu webhook Lynk.id → routing ke banyak app** by judul produk (RuangSaku, StickerPack, default Apps Script). Payload Lynk.id asli: `data.message_data.items[0].title`, `data.message_data.customer.email`, `.name`. Lynk.id mengenali produk lewat **judul teks**, bukan ID angka.
- Blok RuangSaku mengirim `{ event:'lynkid_purchase', email, name, product_title, ... }` + header `x-shared-secret: env.RUANGSAKU_APP`.
- Webhook AI Guild `app/api/webhook/lynkid/route.js` yang ada = **kerangka mati**: menunggu HMAC + `payment.success`, tidak cocok format Worker, dan Worker belum pernah menunjuk ke AI Guild. Aman ditulis ulang tanpa merusak apa pun.
- Akses kelas ditentukan `Purchase.courseId` (lihat `lib/ownership.js` → `getOwnedCourseIds` hanya hitung purchase dengan `courseId` tidak null). Webhook lama membuat `courseId: null` → tak berguna. Ini yang diperbaiki.

## Judul produk Lynk.id (final)
`Ecourse vibe coding google appscript` — pencocokan **case-insensitive**, spasi di-normalisasi.

## Alur data
```
Beli di Lynk.id
  ↓ webhook resmi Lynk.id
Worker lynkid-router  (+ cabang baru: AI Guild)
  ↓ POST { event:'lynkid_purchase', email, name, product_title } + header x-shared-secret
AI Guild POST /api/webhook/lynkid  (ditulis ulang)
  ↓ verifikasi shared secret → cocokkan product_title → course via lynkidProductTitle
  ↓ upsert user + Purchase(courseId terisi, idempoten)
User login pakai email → masuk /belajar/vibe-coding-gas
```

## Perubahan (3 titik)

### 1. Database — kolom baru (migrasi aman, nullable)
Tambah di model `Course` (`prisma/schema.prisma`):
```prisma
lynkidProductTitle String? @map("lynkid_product_title")
```
- Migrasi Prisma baru (nullable, tidak destruktif, tidak menyentuh data/kolom lain).
- Nilai untuk course `vibe-coding-gas`: `Ecourse vibe coding google appscript` (diisi via admin atau seed/update terpisah).
- Mayar `mayarProductId` tetap seperti apa adanya.

### 2. AI Guild `app/api/webhook/lynkid/route.js` — tulis ulang
- Verifikasi header `x-shared-secret` == `process.env.LYNKID_SHARED_SECRET` pakai `timingSafeEqual`. Kosong/salah → **401** (fail-closed). Env kosong → **500** (belum dikonfigurasi), sejajar pola guard di webhook Mayar.
- Terima event `lynkid_purchase`; event lain → 200 "diabaikan".
- Ambil `email` (lowercase+trim) dan `product_title`. Email kosong → 400.
- Cocokkan `product_title` (normalisasi: lowercase, trim, spasi tunggal) ke `Course.lynkidProductTitle`. Tak ada yang cocok → 200 "produk tak dikenal" (bukan error, supaya Lynk.id/Worker tidak retry).
- Idempotensi: dedup key = `orderId` bila ada, else `body:<sha256(rawBody)[:32]>`. Cek `Purchase(orderId=dedupKey, source:'lynkid', courseId)` → sudah ada → 200 "sudah diproses".
- `prisma.user.upsert` by email → `prisma.purchase.create({ userId, courseId, source:'lynkid', orderId:dedupKey })`.
- Logika pemetaan produk→course diletakkan di helper `lib/lynkid-webhook.js` (sejajar `lib/mayar-webhook.js`) agar mudah ditest & tidak menggemukkan route.

### 3. Worker `lynkid-router` (Cloudflare) — tambah 1 cabang
- Daftar judul produk AI Guild di atas file (array), mis. `['ecourse vibe coding google appscript']` (normalisasi lowercase).
- Deteksi `isAiGuild` = judul (dinormalisasi) ada di daftar. Cabang ditaruh **sebelum** `default` agar tidak ketangkap route Apps Script.
- Bila `isAiGuild`: POST ke `<AIGUILD_PROD_URL>/api/webhook/lynkid` dengan body `{ event:'lynkid_purchase', email, name, product_title, timestamp, source, raw }` + header `x-shared-secret: env.AIGUILD_APP`.
- Blok RuangSaku / StickerPack / default **tidak diubah**.

## Env & secret (nilai asli di env, BUKAN di doc)
- AI Guild (Coolify prod + `.env.local` dev): `LYNKID_SHARED_SECRET=<nilai rahasia>`.
- Worker (Cloudflare secret): `AIGUILD_APP=<nilai sama dengan LYNKID_SHARED_SECRET>`.
- Domain prod AI Guild yang dituju Worker: `<AIGUILD_PROD_URL>` — **INPUT dari user** (belum diketahui, ada di env Coolify).
- Catatan: `LYNKID_WEBHOOK_SECRET` lama (HMAC) tidak lagi dipakai webhook ini; boleh dibersihkan belakangan.

## Testing (Vitest — fungsi kritis akses berbayar)
`lib/lynkid-webhook.test.js` + test route:
- Shared secret valid → lolos; salah/kosong → 401; env kosong → 500.
- `product_title` cocok (termasuk beda kapital/spasi) → course benar; tak cocok → diabaikan.
- Email kosong → 400.
- Idempotensi: kirim dua kali → satu Purchase.
- Manual: simulasi payload via skill `test-webhook-lokal.md` (tambah contoh payload Lynk.id).

## Urutan implementasi (TDD)
1. Migrasi Prisma tambah `lynkidProductTitle` (dev) + `prisma generate`.
2. Isi `lynkidProductTitle` course `vibe-coding-gas` (dev).
3. Tulis test `lib/lynkid-webhook.js` (merah) → implement helper (hijau).
4. Tulis ulang route `app/api/webhook/lynkid/route.js` + test route.
5. Tambah cabang AI Guild di Worker `lynkid-router` (deploy setelah lokal lulus).
6. Set env di AI Guild + secret di Worker; arahkan judul produk Lynk.id.
7. Smoke test end-to-end (tunnel/simulasi) → verifikasi Purchase & login.

## Di luar cakupan (YAGNI)
- Kirim email/magic-link otomatis dari webhook (login tetap via alur magic link yang ada; pengiriman "aplikasi" dilakukan user seperti biasa).
- Mengubah alur Mayar.
- Refund/pembatalan akses dari Lynk.id.
