# Rencana — Integrasi Lynk.id → AI Guild (jual kelas GAS di dua tempat)

Tanggal: 2026-07-01 · Branch: `feat/lynkid-integration` · Status: disetujui, siap implementasi

> **Untuk pelaksana:** kerjakan task berurutan. Langkah pakai checkbox (`- [ ]`). Pola: tulis test gagal → implement minimal → test lulus → commit. Uji manual route via skill `.claude/skills/test-webhook-lokal.md`.

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
- Bila `isAiGuild`: POST ke `https://aiguild.online/api/webhook/lynkid` dengan body `{ event:'lynkid_purchase', email, name, product_title, timestamp, source, raw }` + header `x-shared-secret: env.AIGUILD_APP`.
- Blok RuangSaku / StickerPack / default **tidak diubah**.

## Env & secret (nilai asli di env, BUKAN di doc)
- AI Guild (Coolify prod + `.env.local` dev): `LYNKID_SHARED_SECRET=<nilai rahasia>`.
- Worker (Cloudflare secret): `AIGUILD_APP=<nilai sama dengan LYNKID_SHARED_SECRET>`.
- Domain prod AI Guild yang dituju Worker: `https://aiguild.online/api/webhook/lynkid`.
- Catatan: `LYNKID_WEBHOOK_SECRET` lama (HMAC) tidak lagi dipakai webhook ini; boleh dibersihkan belakangan.

## Testing (Vitest — fungsi kritis akses berbayar)
`lib/lynkid-webhook.test.js` + test route:
- Shared secret valid → lolos; salah/kosong → 401; env kosong → 500.
- `product_title` cocok (termasuk beda kapital/spasi) → course benar; tak cocok → diabaikan.
- Email kosong → 400.
- Idempotensi: kirim dua kali → satu Purchase.
- Manual: simulasi payload via skill `test-webhook-lokal.md` (tambah contoh payload Lynk.id).

## Struktur file
- **Buat:** `lib/lynkid-webhook.js` — helper murni (normalisasi judul, cocokkan course, verifikasi secret, ekstrak email/judul). Bisa ditest tanpa DB.
- **Buat:** `lib/lynkid-webhook.test.js` — test Vitest untuk helper.
- **Ubah:** `prisma/schema.prisma` — kolom `lynkidProductTitle` di `Course`.
- **Ubah:** `app/api/webhook/lynkid/route.js` — tulis ulang total (kerangka mati → pola shared-secret).
- **Ubah:** `lib/modules-seed.js` — isi `lynkidProductTitle` course default (reproducible).
- **Ubah:** `.env.local` + `.env.example` — variabel `LYNKID_SHARED_SECRET`.
- **Ubah (di Cloudflare):** Worker `lynkid-router` — tambah 1 cabang AI Guild.

Konvensi test project: hanya helper murni yang di-test otomatis (lihat `lib/mayar-webhook.test.js`); route diuji manual via simulasi payload. Ikuti pola ini — jangan bikin harness test route baru.

---

## Task 1: Kolom DB `lynkidProductTitle`

**Files:** Ubah `prisma/schema.prisma:22-37` (model `Course`)

- [ ] **Step 1: Tambah kolom** — di model `Course`, tepat di bawah baris `mayarProductId`:

```prisma
  mayarProductId String?    @map("mayar_product_id")
  lynkidProductTitle String? @map("lynkid_product_title")
```

- [ ] **Step 2: Terapkan ke DB dev + generate** (Docker postgres dev harus hidup)

Project ini pakai `prisma db push` (belum ada folder `prisma/migrations` — masih fase db push). JANGAN `migrate dev` (memaksa baseline → minta reset/hapus data). Kolom nullable = aditif, aman via db push.

Run: `npx prisma db push` lalu `npx prisma generate`
Expected: "Your database is now in sync", kolom `lynkid_product_title` (nullable) muncul di tabel `courses`, tanpa data hilang.

- [ ] **Step 3: Commit**

```bash
git add prisma/schema.prisma
git commit -m "feat: tambah kolom lynkidProductTitle di Course"
```

> Prod: pakai `npx prisma db push` juga (sama seperti dev, karena project belum bermigrasi). Kolom nullable → tidak menyentuh data user.

---

## Task 2: Isi judul produk di course default

**Files:** Ubah `lib/modules-seed.js:284-288` (objek course default)

- [ ] **Step 1: Set nilai di seed** — pada objek course `vibe-coding-gas`, tambah field:

```js
    slug: 'vibe-coding-gas',
    mayarProductId: null, // diisi via admin setelah produk dibuat di Mayar
    lynkidProductTitle: 'Ecourse vibe coding google appscript',
```

- [ ] **Step 2: Terapkan ke DB dev** (upsert via seed)

Run: `npm run seed`
Expected: selesai tanpa error.

- [ ] **Step 3: Verifikasi nilai tersimpan**

Run: `docker exec aiguild-postgres-dev psql -U aiguild -d aiguild -c "SELECT slug, lynkid_product_title FROM courses WHERE slug='vibe-coding-gas';"`
Expected: kolom `lynkid_product_title` = `Ecourse vibe coding google appscript`.

- [ ] **Step 4: Commit**

```bash
git add lib/modules-seed.js
git commit -m "feat: petakan produk Lynk.id ke course vibe-coding-gas"
```

> Prod: jalankan `UPDATE courses SET lynkid_product_title='Ecourse vibe coding google appscript' WHERE slug='vibe-coding-gas';` di DB prod, atau `npm run seed` (upsert) saat deploy. Tidak menyentuh data user.

---

## Task 3: Helper `lib/lynkid-webhook.js` (TDD)

**Files:** Buat `lib/lynkid-webhook.js`, Test `lib/lynkid-webhook.test.js`

- [ ] **Step 1: Tulis test yang gagal** — buat `lib/lynkid-webhook.test.js`:

```js
import { describe, it, expect } from 'vitest'
import { normalizeTitle, isValidSharedSecret, extractLynkidEmail, extractLynkidProductTitle, matchCourseByTitle } from './lynkid-webhook'

describe('normalizeTitle', () => {
  it('lowercase, trim, rapatkan spasi', () =>
    expect(normalizeTitle('  Ecourse   Vibe  Coding ')).toBe('ecourse vibe coding'))
  it('null → string kosong', () =>
    expect(normalizeTitle(null)).toBe(''))
})

describe('isValidSharedSecret', () => {
  it('cocok → true', () =>
    expect(isValidSharedSecret('rahasia', 'rahasia')).toBe(true))
  it('salah → false', () =>
    expect(isValidSharedSecret('salah', 'rahasia')).toBe(false))
  it('expected kosong → false (fail-closed)', () =>
    expect(isValidSharedSecret('rahasia', '')).toBe(false))
  it('provided kosong → false', () =>
    expect(isValidSharedSecret('', 'rahasia')).toBe(false))
})

describe('extractLynkidEmail', () => {
  it('lowercase + trim', () =>
    expect(extractLynkidEmail({ email: '  Aku@Mail.com ' })).toBe('aku@mail.com'))
  it('tidak ada → null', () =>
    expect(extractLynkidEmail({})).toBe(null))
})

describe('extractLynkidProductTitle', () => {
  it('ambil product_title', () =>
    expect(extractLynkidProductTitle({ product_title: 'Ecourse X' })).toBe('Ecourse X'))
  it('fallback ke raw items[0].title', () =>
    expect(extractLynkidProductTitle({ raw: { data: { message_data: { items: [{ title: 'Judul Raw' }] } } } })).toBe('Judul Raw'))
  it('tidak ada → null', () =>
    expect(extractLynkidProductTitle({})).toBe(null))
})

describe('matchCourseByTitle', () => {
  const courses = [
    { id: 'c1', slug: 'vibe-coding-gas', lynkidProductTitle: 'Ecourse vibe coding google appscript' },
    { id: 'c2', slug: 'lain', lynkidProductTitle: 'Kelas Lain' },
  ]
  it('cocok walau beda kapital/spasi', () =>
    expect(matchCourseByTitle(courses, 'ECOURSE   Vibe Coding Google Appscript')?.slug).toBe('vibe-coding-gas'))
  it('produk tak dikenal → null (fail-closed)', () =>
    expect(matchCourseByTitle(courses, 'Produk Asing')).toBe(null))
  it('judul kosong → null', () =>
    expect(matchCourseByTitle(courses, '')).toBe(null))
  it('course tanpa lynkidProductTitle diabaikan', () =>
    expect(matchCourseByTitle([{ id: 'c3', lynkidProductTitle: null }], 'apa saja')).toBe(null))
})
```

- [ ] **Step 2: Jalankan, pastikan GAGAL**

Run: `npx vitest run lib/lynkid-webhook.test.js`
Expected: FAIL — "Failed to resolve import './lynkid-webhook'".

- [ ] **Step 3: Implement helper** — buat `lib/lynkid-webhook.js`:

```js
export function normalizeTitle(s) {
  return String(s ?? '').toLowerCase().trim().replace(/\s+/g, ' ')
}

export function isValidSharedSecret(provided, expected) {
  if (!expected) return false
  return provided === expected
}

export function extractLynkidEmail(payload) {
  const email = payload?.email
  return email ? String(email).toLowerCase().trim() : null
}

export function extractLynkidProductTitle(payload) {
  return payload?.product_title ?? payload?.raw?.data?.message_data?.items?.[0]?.title ?? null
}

export function matchCourseByTitle(courses, productTitle) {
  const target = normalizeTitle(productTitle)
  if (!target) return null
  return courses.find((c) => c.lynkidProductTitle && normalizeTitle(c.lynkidProductTitle) === target) ?? null
}
```

- [ ] **Step 4: Jalankan, pastikan LULUS**

Run: `npx vitest run lib/lynkid-webhook.test.js`
Expected: PASS semua.

- [ ] **Step 5: Commit**

```bash
git add lib/lynkid-webhook.js lib/lynkid-webhook.test.js
git commit -m "feat: helper webhook Lynk.id (map produk->course, verifikasi secret)"
```

---

## Task 4: Tulis ulang route `app/api/webhook/lynkid/route.js`

**Files:** Ubah `app/api/webhook/lynkid/route.js` (ganti seluruh isi)

- [ ] **Step 1: Ganti seluruh isi file** dengan:

```js
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import {
  isValidSharedSecret,
  matchCourseByTitle,
  extractLynkidEmail,
  extractLynkidProductTitle,
} from '@/lib/lynkid-webhook'

export async function POST(request) {
  const expected = process.env.LYNKID_SHARED_SECRET
  if (!expected) {
    console.error('Webhook Lynk.id: LYNKID_SHARED_SECRET belum diset — ditolak')
    return NextResponse.json({ error: 'Webhook belum dikonfigurasi' }, { status: 500 })
  }

  const provided = request.headers.get('x-shared-secret') ?? ''
  if (!isValidSharedSecret(provided, expected)) {
    return NextResponse.json({ error: 'Secret tidak valid' }, { status: 401 })
  }

  let payload
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ error: 'Payload tidak valid' }, { status: 400 })
  }

  if (payload.event !== 'lynkid_purchase') {
    return NextResponse.json({ message: 'Event diabaikan' })
  }

  const email = extractLynkidEmail(payload)
  if (!email) {
    return NextResponse.json({ error: 'Email tidak ditemukan di payload' }, { status: 400 })
  }
  const productTitle = extractLynkidProductTitle(payload)

  // Gerbang produk via DB: judul produk Lynk.id → course. Fail-closed.
  // Tambah kursus baru = isi lynkidProductTitle di admin/seed, nol perubahan kode.
  const courses = await prisma.course.findMany({
    where: { lynkidProductTitle: { not: null } },
    select: { id: true, slug: true, lynkidProductTitle: true },
  })
  const course = matchCourseByTitle(courses, productTitle)
  if (!course) {
    console.log('Webhook Lynk.id: produk tak terpetakan ke course, diabaikan:', productTitle)
    return NextResponse.json({ message: 'Produk tidak dikenal' })
  }

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email },
  })

  // Idempoten per (user, course): sekali beli = sekali akses. Kirim ulang → skip.
  const existing = await prisma.purchase.findFirst({
    where: { userId: user.id, courseId: course.id, source: 'lynkid' },
  })
  if (existing) {
    return NextResponse.json({ message: 'Sudah diproses', course: course.slug })
  }

  await prisma.purchase.create({
    data: { userId: user.id, courseId: course.id, source: 'lynkid' },
  })

  return NextResponse.json({ message: 'OK', course: course.slug })
}
```

- [ ] **Step 2: Uji manual (simulasi payload)** — dev server jalan di port 3001, set `LYNKID_SHARED_SECRET` di `.env.local` (Task 5) dulu.

Tanpa secret → harus 401:
```powershell
$body = '{"event":"lynkid_purchase","email":"tes-lynk@contoh.test","name":"Tes","product_title":"Ecourse vibe coding google appscript"}'
Invoke-WebRequest -Uri "http://localhost:3001/api/webhook/lynkid" -Method POST -Body $body -ContentType "application/json"
```
Expected: 401.

Dengan secret benar → harus 200 `{"message":"OK","course":"vibe-coding-gas"}`:
```powershell
$h = @{ 'x-shared-secret' = 'dev-lynkid-shared' }
Invoke-WebRequest -Uri "http://localhost:3001/api/webhook/lynkid" -Method POST -Headers $h -Body $body -ContentType "application/json"
```
Expected: 200, message OK, course vibe-coding-gas.

- [ ] **Step 3: Verifikasi akses tercatat di DB**

Run: `docker exec aiguild-postgres-dev psql -U aiguild -d aiguild -c "SELECT u.email, c.slug, p.source FROM purchases p JOIN users u ON u.id=p.user_id JOIN courses c ON c.id=p.course_id WHERE u.email='tes-lynk@contoh.test';"`
Expected: satu baris — email, `vibe-coding-gas`, `lynkid`. Kirim ulang request → tetap satu baris (idempoten).

- [ ] **Step 4: Commit**

```bash
git add app/api/webhook/lynkid/route.js
git commit -m "feat: webhook Lynk.id beri akses course (pola shared-secret)"
```

---

## Task 5: Variabel env `LYNKID_SHARED_SECRET`

**Files:** Ubah `.env.local` (dev), `.env.example` (dokumentasi)

- [ ] **Step 1: Tambah di `.env.local`** (dev) — nilai dev bebas, samakan dengan yang dipakai di uji manual:

```
LYNKID_SHARED_SECRET=dev-lynkid-shared
```

- [ ] **Step 2: Dokumentasikan di `.env.example`** (tanpa nilai asli):

```
LYNKID_SHARED_SECRET=
```

- [ ] **Step 3: Commit** (`.env.local` sudah di-gitignore, tidak ikut)

```bash
git add .env.example
git commit -m "docs: dokumentasikan env LYNKID_SHARED_SECRET"
```

> Prod: set `LYNKID_SHARED_SECRET` di env Coolify dengan nilai rahasia acak yang kuat. Nilai ini harus SAMA dengan secret `AIGUILD_APP` di Worker (Task 6).

---

## Task 6: Cabang AI Guild di Worker `lynkid-router` (Cloudflare)

**Files:** Ubah Worker `lynkid-router` (di dashboard Cloudflare / wrangler). Deploy hanya setelah Task 1–5 lulus di lokal.

- [ ] **Step 1: Tambah konstanta** di atas file worker (setelah `RUANGSAKU_URL`):

```js
const AIGUILD_URL      = 'https://aiguild.online/api/webhook/lynkid';
const AIGUILD_TITLES   = ['ecourse vibe coding google appscript'];
```

- [ ] **Step 2: Tambah deteksi** — di blok `try { ... }` parsing, setelah `isStickerPack` di-set, tambah:

```js
      const normTitle = productTitle.toLowerCase().trim().replace(/\s+/g, ' ');
      isAiGuild = AIGUILD_TITLES.indexOf(normTitle) > -1;
```
(deklarasikan `let isAiGuild = false;` bersama variabel `isRuangSaku`/`isStickerPack` di atas `try` — jangan pakai `var` di dalam try.)

- [ ] **Step 3: Tambah cabang** — sisipkan SEBELUM blok `else` (default Apps Script), setelah blok `else if (isStickerPack)`:

```js
    } else if (isAiGuild) {
      const payload = {
        event: 'lynkid_purchase',
        email: String(email || '').trim().toLowerCase(),
        name: String(customerName || '').trim(),
        product_title: productTitle,
        timestamp: new Date().toISOString(),
        source: 'cloudflare_worker_lynkid_router_v1',
        raw: parsed
      };
      try {
        const r = await fetch(AIGUILD_URL, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-shared-secret': env.AIGUILD_APP || ''
          },
          body: JSON.stringify(payload)
        });
        const txt = await r.text();
        console.log('Routed AIGuild ' + r.status + ' email=' + email + ' body=' + txt.slice(0, 200));
      } catch (e) {
        console.error('AIGuild forward error: ' + e.message);
      }
```

- [ ] **Step 4: Update respons** `routed_to` agar menyertakan AI Guild:

```js
      routed_to: isRuangSaku ? 'ruangsaku' : (isStickerPack ? 'stickerpack' : (isAiGuild ? 'aiguild' : 'apps_script')),
```
(dan opsional tambahkan `aiguild: AIGUILD_URL` di objek `routes` pada handler GET.)

- [ ] **Step 5: Set secret Worker** — nilai SAMA dengan `LYNKID_SHARED_SECRET` prod:

Run (wrangler): `npx wrangler secret put AIGUILD_APP`
Atau via dashboard Cloudflare → Worker `lynkid-router` → Settings → Variables → tambah secret `AIGUILD_APP`.

- [ ] **Step 6: Deploy Worker** (dashboard "Save and Deploy" atau `npx wrangler deploy`). Verifikasi GET root Worker mengembalikan `routes` yang menyertakan aiguild.

---

## Task 7: Smoke test end-to-end & konfigurasi Lynk.id

- [ ] **Step 1: Arahkan webhook Lynk.id** ke URL Worker `lynkid-router` (bila belum) di dashboard Lynk.id untuk produk "Ecourse vibe coding google appscript".
- [ ] **Step 2: Beli uji / kirim payload uji** lewat jalur Worker → cek log Worker menunjukkan `Routed AIGuild 200`.
- [ ] **Step 3: Verifikasi di DB prod** — user + Purchase(course vibe-coding-gas, source lynkid) tercatat.
- [ ] **Step 4: Uji login** — buka `https://aiguild.online`, `POST /api/auth/send-link` dengan email pembeli → 200 (terdaftar) → login via magic link → mendarat di `/belajar/vibe-coding-gas`.
- [ ] **Step 5: Cek Mayar tidak terganggu** — beli/uji Mayar seperti biasa, pastikan tetap berfungsi.

---

## Task 8: Update product-spec & selesai branch

**Files:** Ubah `.claude/docs-library/product-spec.md`

- [ ] **Step 1:** Catat Lynk.id sebagai kanal penjualan kedua untuk kelas GAS (Mayar + Lynk.id, keduanya beri akses course sama via webhook).
- [ ] **Step 2: Commit** `git add .claude/docs-library/product-spec.md && git commit -m "docs: catat Lynk.id sebagai kanal jual kedua"`
- [ ] **Step 3: Push branch** `git push -u origin feat/lynkid-integration` lalu STOP (jangan merge — tunggu perintah eksplisit user).

## Di luar cakupan (YAGNI)
- Kirim email/magic-link otomatis dari webhook (login tetap via alur magic link yang ada; pengiriman "aplikasi" dilakukan user seperti biasa).
- Mengubah alur Mayar.
- Refund/pembatalan akses dari Lynk.id.
