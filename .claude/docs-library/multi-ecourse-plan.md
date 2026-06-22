# Multi-Ecourse Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Mengubah AI Guild dari platform 1 langganan tahunan menjadi toko multi-ecourse (beli per kursus, akses selamanya).

**Architecture:** Tambah model `Course`; tiap `Module` milik satu course; kepemilikan = baris `Purchase(userId, courseId)` tanpa kedaluwarsa. Etalase publik (tanpa login), gerbang per-kursus untuk konten. Webhook Mayar memetakan `productId` → course via lookup DB (bukan env).

**Tech Stack:** Next.js 14 App Router (JS), Prisma 7 + adapter-pg, PostgreSQL, Vitest, Tailwind, jose JWT, Resend.

**Acuan desain:** `.claude/docs-library/multi-ecourse-design.md`

**Catatan testing (sesuai aturan project):** TDD penuh untuk logika kritis (kepemilikan + mapping webhook = auth & payment). Halaman/UI diverifikasi manual via Chrome DevTools MCP (Lapis 1) — tidak ada unit test UI.

**Aturan kerja:** branch `feat/multi-ecourse` (sudah dibuat). Commit tiap task. Local-first: semua dites di `localhost:3001` sampai mulus; deploy belakangan dengan perintah eksplisit. Karena fresh start, reset schema lokal aman.

---

## File Map

**Buat:**
- `lib/ownership.js` — helper akses kursus (pure, testable)
- `lib/ownership.test.js`
- `app/kursus/[slug]/page.js` — halaman jualan per kursus (publik)
- `app/belajar/[courseSlug]/page.js` — wrapper auth+ownership
- `app/belajar/[courseSlug]/LearnClient.js` — flowchart belajar (pindahan dari dashboard)
- `app/api/courses/route.js` — list course publik (untuk storefront)
- `app/admin/courses/page.js` + `app/admin/courses/CoursesManager.js` — CRUD kursus
- `app/api/admin/courses/route.js` — API admin kursus

**Ubah:**
- `prisma/schema.prisma` — model Course, Module.courseId, Purchase.courseId, buang field membership di User
- `lib/modules-seed.js` — buang modul 21-23; tambah definisi course + courseSlug
- `scripts/seed.js` — seed Course dulu lalu assign courseId
- `lib/mayar-webhook.js` — tambah `matchCourseByProduct`
- `lib/mayar-webhook.test.js` — test helper baru
- `app/api/webhook/mayar/route.js` — pakai course lookup + Purchase berkursus
- `app/api/modules/route.js` — terima `?course=slug`, gerbang kepemilikan
- `app/dashboard/page.js` — Kelasku + Jelajahi (Layout B)
- `app/modul/[slug]/page.js` — gerbang kepemilikan kursus
- `app/page.js` / komponen landing — etalase Hero + Grid
- `app/admin/modules/page.js` — pemilih kursus per modul
- `app/api/admin/modules/route.js` — terima `courseId`
- `app/admin/users/UsersTable.js` + `app/api/admin/users/route.js` — beri/cabut akses kursus
- `lib/admin-stats.js` (+ test) — statistik per kursus, buang metrik membership
- `.claude/docs-library/product-spec.md` — update setelah implementasi

**Hapus:**
- `app/perpanjang/page.js`
- `app/api/cron/check-membership/route.js`
- `lib/membership.js` + `lib/membership.test.js` (atau kosongkan referensi)
- Modul 21,22,23 dari seed

---

## Phase 0 — Schema & Seed (fondasi)

### Task 1: Update Prisma schema

**Files:**
- Modify: `prisma/schema.prisma`

- [ ] **Step 1: Tambah model Course + ubah Module/Purchase/User**

Ganti blok `model User`, `model Module`, `model Purchase` dan tambah `model Course`:

```prisma
model User {
  id          String         @id @default(uuid())
  email       String         @unique
  name        String?
  isAdmin     Boolean        @default(false) @map("is_admin")
  createdAt   DateTime       @default(now()) @map("created_at")
  purchases   Purchase[]
  progress    UserProgress[]
  magicTokens MagicToken[]

  @@map("users")
}

model Course {
  id            String   @id @default(uuid())
  title         String
  slug          String   @unique
  description   String?
  price         Int      @default(0)
  mayarProductId String? @map("mayar_product_id")
  coverImage    String?  @map("cover_image")
  isPublished   Boolean  @default(false) @map("is_published")
  orderIndex    Int      @default(0) @map("order_index")
  createdAt     DateTime @default(now()) @map("created_at")
  modules       Module[]

  @@map("courses")
}

model Module {
  id          String         @id @default(uuid())
  course      Course         @relation(fields: [courseId], references: [id])
  courseId    String         @map("course_id")
  title       String
  slug        String         @unique
  description String?
  youtubeUrl  String?        @map("youtube_url")
  gammaUrl    String?        @map("gamma_url")
  promptText  String?        @map("prompt_text")
  htmlContent String?        @map("html_content")
  contentUpdatedAt DateTime? @map("content_updated_at")
  parentIds   String[]       @default([]) @map("parent_ids")
  orderIndex  Int            @default(0) @map("order_index")
  createdAt   DateTime       @default(now()) @map("created_at")
  progress    UserProgress[]

  @@map("modules")
}

model Purchase {
  id          String   @id @default(uuid())
  user        User     @relation(fields: [userId], references: [id])
  userId      String   @map("user_id")
  course      Course?  @relation(fields: [courseId], references: [id])
  courseId    String?  @map("course_id")
  source      String
  orderId     String?  @map("order_id")
  purchasedAt DateTime @default(now()) @map("purchased_at")

  @@map("purchases")
}
```

> Catatan: `Purchase.course` relation perlu balik-relasi di `Course`. Tambahkan `purchases Purchase[]` ke `Course` jika Prisma minta. (Tambahkan baris `purchases Purchase[]` di model Course.)

- [ ] **Step 2: Tambah balik-relasi purchases di Course**

Di `model Course`, tambah baris setelah `modules Module[]`:
```prisma
  purchases Purchase[]
```

- [ ] **Step 3: Reset & push schema (dev, fresh start)**

Run:
```bash
npm run dev   # pastikan container postgres dev jalan (atau jalankan docker terpisah)
# di terminal lain:
$env:SEED_RESET="true"; npx prisma db push --force-reset; npx prisma generate
```
Expected: `Your database is now in sync with your Prisma schema.` Tidak ada error.

> `--force-reset` aman: fresh start, belum ada data nyata. Ini DEV.

- [ ] **Step 4: Commit**
```bash
git add prisma/schema.prisma
git commit -m "feat: skema multi-course (Course, Module.courseId, Purchase.courseId)"
```

---

### Task 2: Restructure seed (course + buang modul 21-23)

**Files:**
- Modify: `lib/modules-seed.js`
- Modify: `scripts/seed.js`

- [ ] **Step 1: Tambah definisi course di `lib/modules-seed.js`**

Di atas `export const MODULES_SEED`, tambahkan:
```js
export const COURSES_SEED = [
  {
    slug: 'vibe-coding-gas',
    title: 'Vibe Coding Google Apps Script: Dari Nol Bikin Aplikasi Sampai Menghasilkan',
    description: 'Belajar vibe coding dari mindset sampai bikin & menjual aplikasi Google Apps Script — khusus pemula non-IT.',
    price: 500000,
    mayarProductId: null, // diisi via admin setelah produk dibuat di Mayar
    isPublished: true,
    orderIndex: 0,
  },
]

// Semua modul saat ini milik satu course.
const DEFAULT_COURSE_SLUG = 'vibe-coding-gas'
```

- [ ] **Step 2: Hapus 3 modul dari `MODULES_SEED`**

Hapus objek bertanggung slug `praktek-webapp`, `praktek-desktop`, `praktek-apk-android` (modul 21-23) dari array `MODULES_SEED`. Pastikan tidak ada modul lain yang menyebut ketiganya di `parentIds` (cek: hanya mereka sendiri yang punya parent `magic-prompt-existing`; aman dihapus).

- [ ] **Step 3: Beri `courseSlug` ke tiap modul**

Tambahkan field `courseSlug: 'vibe-coding-gas'` ke SETIAP objek di `MODULES_SEED`. (Semua modul milik course yang sama.)

- [ ] **Step 4: Update `scripts/seed.js` — seed Course dulu**

Tambah import: ganti baris import seed menjadi:
```js
import { MODULES_SEED, COURSES_SEED } from '../lib/modules-seed.js'
```

Di `main()`, SEBELUM loop modul (setelah blok RESET), tambah:
```js
  console.log('Sinkronisasi course...')
  const courseSlugToId = {}
  for (const c of COURSES_SEED) {
    const { slug, ...rest } = c
    const upserted = await prisma.course.upsert({
      where: { slug },
      update: { title: rest.title, description: rest.description, isPublished: rest.isPublished, orderIndex: rest.orderIndex },
      // price & mayarProductId CREATE-ONLY (jadi milik admin setelah dibuat)
      create: { slug, ...rest },
    })
    courseSlugToId[slug] = upserted.id
  }
```

- [ ] **Step 5: Sertakan courseId saat upsert modul**

Di loop modul, ubah destructuring & data agar menyertakan courseId:
```js
  for (const rawMod of MODULES_SEED) {
    const mod = { ...rawMod, ...(CARD_CONTENT[rawMod.slug] ?? {}) }
    const { parentIds: _slugParentIds, promptText, courseSlug, ...rest } = mod
    const courseId = courseSlugToId[courseSlug]
    if (!courseId) throw new Error(`Course tidak ditemukan untuk modul ${mod.slug}: ${courseSlug}`)

    const upserted = await prisma.module.upsert({
      where: { slug: mod.slug },
      update: { ...rest, courseId, parentIds: [] },
      create: { ...rest, courseId, promptText: promptText ?? null, parentIds: [] },
    })
    slugToId[mod.slug] = upserted.id
  }
```

- [ ] **Step 6: Jalankan seed & verifikasi**

Run:
```bash
$env:SEED_RESET="true"; npm run seed
```
Expected: "Sinkronisasi course...", lalu "Selesai: 25 modul tersinkron." (28 - 3 = 25). Tidak ada error "Slug parent tidak ditemukan".

- [ ] **Step 7: Commit**
```bash
git add lib/modules-seed.js scripts/seed.js
git commit -m "feat: seed course vibe-coding-gas + assign courseId, buang modul 21-23"
```

---

## Phase 1 — Ownership lib (TDD)

### Task 3: `lib/ownership.js` — helper akses kursus

**Files:**
- Create: `lib/ownership.js`
- Test: `lib/ownership.test.js`

- [ ] **Step 1: Tulis test gagal**

`lib/ownership.test.js`:
```js
import { describe, it, expect } from 'vitest'
import { hasCourseAccess } from './ownership.js'

describe('hasCourseAccess', () => {
  it('admin selalu boleh', () => {
    expect(hasCourseAccess({ isAdmin: true, ownedCourseIds: [] }, 'c1')).toBe(true)
  })
  it('punya kursus → boleh', () => {
    expect(hasCourseAccess({ isAdmin: false, ownedCourseIds: ['c1', 'c2'] }, 'c1')).toBe(true)
  })
  it('tidak punya kursus → tolak', () => {
    expect(hasCourseAccess({ isAdmin: false, ownedCourseIds: ['c2'] }, 'c1')).toBe(false)
  })
  it('list kosong → tolak', () => {
    expect(hasCourseAccess({ isAdmin: false, ownedCourseIds: [] }, 'c1')).toBe(false)
  })
})
```

- [ ] **Step 2: Jalankan, pastikan gagal**

Run: `npm run test -- ownership`
Expected: FAIL — `hasCourseAccess is not a function` / module tidak ada.

- [ ] **Step 3: Implementasi minimal**

`lib/ownership.js`:
```js
export function hasCourseAccess(user, courseId) {
  if (user?.isAdmin) return true
  return Array.isArray(user?.ownedCourseIds) && user.ownedCourseIds.includes(courseId)
}

// Helper query: ambil set courseId yang dimiliki user dari tabel Purchase.
export async function getOwnedCourseIds(prisma, userId) {
  const rows = await prisma.purchase.findMany({
    where: { userId, courseId: { not: null } },
    select: { courseId: true },
  })
  return [...new Set(rows.map((r) => r.courseId))]
}
```

- [ ] **Step 4: Jalankan, pastikan lulus**

Run: `npm run test -- ownership`
Expected: PASS (4 tests).

- [ ] **Step 5: Commit**
```bash
git add lib/ownership.js lib/ownership.test.js
git commit -m "feat: lib ownership (hasCourseAccess + getOwnedCourseIds) + test"
```

---

### Task 4: `matchCourseByProduct` di mayar-webhook (TDD)

**Files:**
- Modify: `lib/mayar-webhook.js`
- Modify: `lib/mayar-webhook.test.js`

- [ ] **Step 1: Tulis test gagal** — tambahkan ke `lib/mayar-webhook.test.js`:
```js
import { matchCourseByProduct } from './mayar-webhook.js'

describe('matchCourseByProduct', () => {
  const courses = [
    { id: 'c1', mayarProductId: 'prod_gas', title: 'GAS' },
    { id: 'c2', mayarProductId: 'prod_web', title: 'Web' },
  ]
  it('cocok by productId', () => {
    const payload = { data: { productId: 'prod_web' } }
    expect(matchCourseByProduct(courses, payload)?.id).toBe('c2')
  })
  it('produk tak dikenal → null (fail-closed)', () => {
    const payload = { data: { productId: 'prod_x' } }
    expect(matchCourseByProduct(courses, payload)).toBe(null)
  })
  it('course tanpa mayarProductId diabaikan', () => {
    const c = [{ id: 'c3', mayarProductId: null }]
    expect(matchCourseByProduct(c, { data: { productId: null } })).toBe(null)
  })
})
```

- [ ] **Step 2: Jalankan, pastikan gagal**

Run: `npm run test -- mayar-webhook`
Expected: FAIL — `matchCourseByProduct is not a function`.

- [ ] **Step 3: Implementasi** — tambahkan ke `lib/mayar-webhook.js`:
```js
export function matchCourseByProduct(courses, payload) {
  const productId = payload?.data?.productId
  if (!productId) return null
  return courses.find((c) => c.mayarProductId && c.mayarProductId === productId) ?? null
}
```

- [ ] **Step 4: Jalankan, pastikan lulus**

Run: `npm run test -- mayar-webhook`
Expected: PASS (semua test lama + 3 baru).

- [ ] **Step 5: Commit**
```bash
git add lib/mayar-webhook.js lib/mayar-webhook.test.js
git commit -m "feat: matchCourseByProduct untuk mapping webhook → course"
```

---

## Phase 2 — Webhook rework

### Task 5: Webhook Mayar pakai course lookup

**Files:**
- Modify: `app/api/webhook/mayar/route.js`

- [ ] **Step 1: Tulis ulang route** — ganti seluruh isi `app/api/webhook/mayar/route.js`:
```js
import { NextResponse } from 'next/server'
import { createHash } from 'crypto'
import { prisma } from '@/lib/db'
import { matchCourseByProduct, extractEmail, extractOrderId, isValidMayarToken } from '@/lib/mayar-webhook'

export async function POST(request) {
  const rawBody = await request.text()

  const expectedToken = process.env.MAYAR_WEBHOOK_TOKEN
  if (!expectedToken) {
    console.error('Webhook Mayar: MAYAR_WEBHOOK_TOKEN belum diset — webhook ditolak')
    return NextResponse.json({ error: 'Webhook belum dikonfigurasi' }, { status: 500 })
  }
  const headers = {
    authorization: request.headers.get('authorization'),
    'x-webhook-token': request.headers.get('x-webhook-token'),
    'x-callback-token': request.headers.get('x-callback-token'),
    'x-gateway-token': request.headers.get('x-gateway-token'),
  }
  if (!isValidMayarToken(headers, expectedToken)) {
    return NextResponse.json({ error: 'Token webhook tidak valid' }, { status: 401 })
  }

  let payload
  try { payload = JSON.parse(rawBody) } catch {
    return NextResponse.json({ error: 'Payload tidak valid' }, { status: 400 })
  }

  if (payload.event !== 'payment.received') {
    return NextResponse.json({ message: 'Event diabaikan' })
  }

  // Gerbang produk via DB: productId → course. Fail-closed.
  const courses = await prisma.course.findMany({
    where: { mayarProductId: { not: null } },
    select: { id: true, slug: true, mayarProductId: true },
  })
  const course = matchCourseByProduct(courses, payload)
  if (!course) {
    console.log('Webhook: produk tak terpetakan ke course, diabaikan', payload.data?.productId)
    return NextResponse.json({ message: 'Produk tidak dikenal' })
  }

  const email = extractEmail(payload)
  const orderId = extractOrderId(payload)
  if (!email) {
    return NextResponse.json({ error: 'Email tidak ditemukan di payload' }, { status: 400 })
  }

  // Idempotency: orderId, atau hash body. Per course (cegah dobel grant).
  const dedupKey = orderId || `body:${createHash('sha256').update(rawBody).digest('hex').slice(0, 32)}`
  const existing = await prisma.purchase.findFirst({
    where: { orderId: dedupKey, source: 'mayar', courseId: course.id },
  })
  if (existing) {
    return NextResponse.json({ message: 'Sudah diproses' })
  }

  const user = await prisma.user.upsert({
    where: { email }, update: {}, create: { email },
  })

  await prisma.purchase.create({
    data: { userId: user.id, courseId: course.id, source: 'mayar', orderId: dedupKey },
  })

  return NextResponse.json({ message: 'OK', course: course.slug })
}
```

- [ ] **Step 2: Verifikasi tidak ada referensi membership tersisa**

Run: `npm run test` (semua suite)
Expected: PASS. (Jika `membership.test.js` error karena impor — Task 16 menghapusnya; untuk sementara biarkan, akan dibereskan. Jika error sekarang, skip file itu.)

- [ ] **Step 3: Tes webhook lokal** (skill `test-webhook-lokal.md`)

Kirim payload contoh `payment.received` dengan `data.productId` = produk course (set `mayarProductId` course di DB dulu via Prisma Studio / admin nanti). Verifikasi: baris Purchase baru dengan courseId terisi, dan user dibuat. Kirim ulang payload sama → balasan "Sudah diproses" (idempotent).

- [ ] **Step 4: Commit**
```bash
git add app/api/webhook/mayar/route.js
git commit -m "feat: webhook Mayar grant akses per-course via lookup DB"
```

---

## Phase 3 — API gates

### Task 6: `/api/modules` gerbang kepemilikan + filter course

**Files:**
- Modify: `app/api/modules/route.js`

- [ ] **Step 1: Tulis ulang** `app/api/modules/route.js`:
```js
import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getOwnedCourseIds, hasCourseAccess } from '@/lib/ownership'

export async function GET(request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const courseSlug = searchParams.get('course')
  if (!courseSlug) return NextResponse.json({ error: 'course wajib' }, { status: 400 })

  const course = await prisma.course.findUnique({ where: { slug: courseSlug } })
  if (!course) return NextResponse.json({ error: 'Course tidak ditemukan' }, { status: 404 })

  const ownedCourseIds = await getOwnedCourseIds(prisma, session.userId)
  if (!hasCourseAccess({ isAdmin: session.isAdmin, ownedCourseIds }, course.id)) {
    return NextResponse.json({ error: 'not_owned' }, { status: 403 })
  }

  const [modules, progress] = await Promise.all([
    prisma.module.findMany({ where: { courseId: course.id }, orderBy: { orderIndex: 'asc' } }),
    prisma.userProgress.findMany({ where: { userId: session.userId } }),
  ])

  const completedIds = progress.filter((p) => p.completed).map((p) => p.moduleId)
  const viewed = progress.map((p) => ({ moduleId: p.moduleId, lastViewedAt: p.lastViewedAt }))
  return NextResponse.json({ course: { slug: course.slug, title: course.title }, modules, completedIds, viewed })
}
```

- [ ] **Step 2: Commit**
```bash
git add app/api/modules/route.js
git commit -m "feat: /api/modules gerbang per-course (filter + ownership)"
```

---

## Phase 4 — Halaman publik (etalase)

> Verifikasi manual (Chrome DevTools MCP). Reuse styling/komponen dari landing lama (`app/page.js`) — warna amber/cream, font display, motion. JANGAN bikin desain baru dari nol; ikuti pola visual yang ada.

### Task 7: API list course publik

**Files:**
- Create: `app/api/courses/route.js`

- [ ] **Step 1: Buat route**:
```js
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  const courses = await prisma.course.findMany({
    where: { isPublished: true },
    orderBy: { orderIndex: 'asc' },
    select: { slug: true, title: true, description: true, price: true, coverImage: true },
  })
  return NextResponse.json({ courses })
}
```
- [ ] **Step 2: Commit** `git add app/api/courses/route.js && git commit -m "feat: API list course publik"`

### Task 8: Storefront `/` (Hero + Grid)

**Files:**
- Modify: `app/page.js` (dan komponen landing terkait — cek `components/` untuk LandingClient)

- [ ] **Step 1: Inspeksi landing lama**

Run: baca `app/page.js` + komponen yang diimpornya. Identifikasi bagian hero produk tunggal & section harga.

- [ ] **Step 2: Ubah jadi etalase**

Struktur baru (Layout A — Hero + Grid):
- Hero: course unggulan (course pertama / `orderIndex` terkecil) — judul, deskripsi, harga, tombol "Beli Sekarang" (link ke `mayarProductLink` atau `/kursus/[slug]`), tombol "Masuk".
- Section "Semua Kursus": grid kartu dari `GET /api/courses`. Tiap kartu → link `/kursus/[slug]`.
- Pertahankan komponen FAQ/footer/section "cara mulai" yang relevan; buang teks yang menyebut "membership tahunan / Rp1.497.000".

> Ambil data course di server component (panggil `prisma.course.findMany` langsung) agar SEO bagus. Hero = course[0], grid = sisanya (sekarang cuma 1 → grid menampilkan placeholder "kursus berikutnya segera" opsional).

- [ ] **Step 3: Verifikasi manual** (Chrome DevTools): buka `/` tanpa login → tampil hero GAS + harga Rp500.000, tombol beli & masuk, tidak ada error console.

- [ ] **Step 4: Commit** `git commit -m "feat: storefront etalase Hero + Grid"`

### Task 9: Halaman jualan `/kursus/[slug]`

**Files:**
- Create: `app/kursus/[slug]/page.js`

- [ ] **Step 1: Server component**: ambil course by slug (`prisma.course.findUnique`), 404 → redirect `/`. Ambil modul course (`prisma.module.findMany({ where: { courseId } })`) untuk preview kurikulum (judul + nomor, tanpa konten). Tampilkan: judul, deskripsi, daftar modul, harga, tombol "Beli Sekarang". Jika user login & sudah punya → tombol jadi "Masuk ke Kelas" (link `/belajar/[slug]`).
- [ ] **Step 2: Verifikasi manual**: `/kursus/vibe-coding-gas` tampil kurikulum + tombol beli.
- [ ] **Step 3: Commit** `git commit -m "feat: halaman jualan per kursus /kursus/[slug]"`

---

## Phase 5 — Halaman belajar

### Task 10: Pindahkan flowchart ke `/belajar/[courseSlug]`

**Files:**
- Create: `app/belajar/[courseSlug]/page.js` (server: auth + ownership gate)
- Create: `app/belajar/[courseSlug]/LearnClient.js` (isi dari `app/dashboard/page.js` lama)

- [ ] **Step 1: Buat `page.js` (server gate)**:
```js
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getOwnedCourseIds, hasCourseAccess } from '@/lib/ownership'
import LearnClient from './LearnClient'

export default async function BelajarPage({ params }) {
  const { courseSlug } = await params
  const session = await getSession()
  if (!session) redirect('/login')

  const course = await prisma.course.findUnique({ where: { slug: courseSlug } })
  if (!course) redirect('/dashboard')

  const ownedCourseIds = await getOwnedCourseIds(prisma, session.userId)
  if (!hasCourseAccess({ isAdmin: session.isAdmin, ownedCourseIds }, course.id)) {
    redirect(`/kursus/${courseSlug}`)
  }
  return <LearnClient courseSlug={courseSlug} courseTitle={course.title} />
}
```

- [ ] **Step 2: Buat `LearnClient.js`**

Pindahkan isi `app/dashboard/page.js` lama ke sini. Ubah fetch jadi `fetch('/api/modules?course=' + courseSlug)`; tangani `403 → router.push('/kursus/' + courseSlug)` (ganti `/perpanjang`). Header judul pakai `courseTitle`.

- [ ] **Step 3: Verifikasi manual**: dev-login → buka `/belajar/vibe-coding-gas` → flowchart tampil; modul bisa diklik.
- [ ] **Step 4: Commit** `git commit -m "feat: halaman belajar per-course /belajar/[courseSlug]"`

### Task 11: Dashboard "Kelasku + Jelajahi" (Layout B)

**Files:**
- Modify: `app/dashboard/page.js` (ganti total jadi daftar kursus)

- [ ] **Step 1: Server component** ambil: course dimiliki user (join Purchase) + progress per course; course lain yang published (untuk Jelajahi). Render:
  - Section "KELASKU": kartu tiap course dimiliki + progress bar (`completed/total modul course itu`) + tombol "Lanjut Belajar →" (link `/belajar/[slug]`).
  - Section "JELAJAHI KURSUS LAIN": course published yang belum dimiliki → kartu + tombol "Beli" (link `/kursus/[slug]`). Sekarang kosong/placeholder → tampilkan "Kursus baru segera".
- [ ] **Step 2: Verifikasi manual**: dev-login (admin punya akses semua) → dashboard tampilkan kelas + progress.
- [ ] **Step 3: Commit** `git commit -m "feat: dashboard Kelasku + Jelajahi"`

### Task 12: Gate `/modul/[slug]`

**Files:**
- Modify: `app/modul/[slug]/page.js`

- [ ] **Step 1: Ganti gate membership → ownership**:
```js
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getOwnedCourseIds, hasCourseAccess } from '@/lib/ownership'
import ModuleViewerWrapper from './ModuleViewerWrapper'

export async function generateMetadata({ params }) {
  const { slug } = await params
  const mod = await prisma.module.findUnique({ where: { slug } })
  return { title: mod ? `${mod.title} — AI Guild` : 'AI Guild' }
}

export default async function ModulPage({ params }) {
  const session = await getSession()
  if (!session) redirect('/login')

  const { slug } = await params
  const mod = await prisma.module.findUnique({ where: { slug } })
  if (!mod) redirect('/dashboard')

  const ownedCourseIds = await getOwnedCourseIds(prisma, session.userId)
  if (!hasCourseAccess({ isAdmin: session.isAdmin, ownedCourseIds }, mod.courseId)) {
    const course = await prisma.course.findUnique({ where: { id: mod.courseId }, select: { slug: true } })
    redirect(course ? `/kursus/${course.slug}` : '/dashboard')
  }

  await prisma.userProgress.upsert({
    where: { userId_moduleId: { userId: session.userId, moduleId: mod.id } },
    update: { lastViewedAt: new Date() },
    create: { userId: session.userId, moduleId: mod.id },
  })

  const allModules = await prisma.module.findMany({ where: { courseId: mod.courseId }, orderBy: { orderIndex: 'asc' } })
  const progress = await prisma.userProgress.findMany({ where: { userId: session.userId } })
  const completedIds = progress.filter((p) => p.completed).map((p) => p.moduleId)

  return <ModuleViewerWrapper module={mod} modules={allModules} completedIds={completedIds} />
}
```
- [ ] **Step 2: Verifikasi manual**: buka modul via dashboard → viewer terbuka; navigasi antar modul dalam course jalan.
- [ ] **Step 3: Commit** `git commit -m "feat: gate /modul/[slug] berbasis kepemilikan course"`

---

## Phase 6 — Admin

### Task 13: Admin courses CRUD

**Files:**
- Create: `app/api/admin/courses/route.js`
- Create: `app/admin/courses/page.js` + `app/admin/courses/CoursesManager.js`

- [ ] **Step 1: API** (`app/api/admin/courses/route.js`) — pola sama `app/api/admin/modules/route.js`: `requireAdmin()`, GET (list), POST (create: title, slug, price, mayarProductId, description, isPublished, orderIndex), PATCH (update by id), DELETE (by id — tolak jika masih punya modul: cek `prisma.module.count({ where: { courseId } })`).
- [ ] **Step 2: UI** (`page.js` server guard `requireAdmin` + `CoursesManager.js` client) — tabel course + form tambah/edit (judul, slug, harga, **Mayar Product ID**, publish). Ikuti gaya admin amber/Sora yang ada (lihat `app/admin/vouchers/VoucherManager.js` sebagai contoh pola).
- [ ] **Step 3: Verifikasi manual**: `/admin/courses` → isi `mayarProductId` course GAS → tersimpan.
- [ ] **Step 4: Commit** `git commit -m "feat: admin panel CRUD course"`

### Task 14: Pemilih course di admin modules

**Files:**
- Modify: `app/api/admin/modules/route.js`
- Modify: `app/admin/modules/page.js`

- [ ] **Step 1: API** — POST terima `courseId` (wajib): tambah ke destructuring & `prisma.module.create({ data: { ..., courseId } })`; validasi `courseId` ada. GET sertakan course (`include: { course: { select: { slug: true, title: true } } }` atau kembalikan courseId).
- [ ] **Step 2: UI** — tambah dropdown "Kursus" (dari `GET /api/admin/courses`) di form tambah/edit modul.
- [ ] **Step 3: Verifikasi manual**: tambah modul uji → pilih course → tersimpan dengan courseId benar. (Hapus modul uji setelah.)
- [ ] **Step 4: Commit** `git commit -m "feat: pemilih course di admin modules"`

### Task 15: Admin users — beri/cabut akses kursus

**Files:**
- Modify: `app/api/admin/users/route.js`
- Modify: `app/admin/users/UsersTable.js`

- [ ] **Step 1: API** — ganti aksi "set/perpanjang/cabut membership" jadi: `grantCourse` (buat Purchase `source: 'admin'` jika belum ada) & `revokeCourse` (hapus Purchase user+course). Terima `userId`, `courseId`, `action`.
- [ ] **Step 2: UI** — di baris user: dropdown course + tombol "Beri akses" / "Cabut". Tampilkan course yang dimiliki user. Pertahankan toggle admin.
- [ ] **Step 3: Verifikasi manual**: beri akses course ke user uji → muncul di "Kelasku" user itu; cabut → hilang.
- [ ] **Step 4: Commit** `git commit -m "feat: admin beri/cabut akses kursus per user"`

---

## Phase 7 — Cleanup & docs

### Task 16: Hapus mekanisme membership

**Files:**
- Delete: `app/perpanjang/page.js`, `app/api/cron/check-membership/route.js`, `lib/membership.js`, `lib/membership.test.js`
- Modify: `lib/admin-stats.js` (+ `lib/admin-stats.test.js`), `app/admin/page.js`

- [ ] **Step 1: Cari semua referensi tersisa**

Run (Grep): cari `membershipExpiredAt`, `isMembershipActive`, `computeNewExpiry`, `needsReminder`, `reminderSentAt`, `/perpanjang`, `check-membership` di seluruh `app/` & `lib/`. Daftar semua hit.

- [ ] **Step 2: Hapus file & perbaiki referensi**

Hapus 4 file di atas. Untuk tiap referensi tersisa (mis. di `app/sukses/page.js`, `lib/admin-stats.js`, `app/admin/page.js`): ganti metrik "member aktif/expired" → "total pembelian per course" / "total pemilik course". Ganti redirect `/perpanjang` → `/dashboard` atau `/kursus/[slug]`.

- [ ] **Step 3: Update admin-stats**

Ubah `lib/admin-stats.js` agar hitung: total user, total course, total modul, total purchase (per course). Sesuaikan `lib/admin-stats.test.js` (TDD: update test dulu sesuai bentuk data baru, jalankan gagal, perbaiki impl, lulus).

- [ ] **Step 4: Jalankan semua test**

Run: `npm run test`
Expected: PASS semua. Tidak ada impor ke file yang dihapus.

- [ ] **Step 5: Smoke test menyeluruh** (Chrome DevTools)

Buka berurutan tanpa error console: `/` → `/kursus/vibe-coding-gas` → `/login` → dev-login → `/dashboard` → `/belajar/vibe-coding-gas` → klik modul → `/admin` → `/admin/courses`.

- [ ] **Step 6: Commit** `git commit -m "chore: hapus mekanisme membership (perpanjang, cron, lib) → model per-course"`

### Task 17: Update product-spec.md

**Files:**
- Modify: `.claude/docs-library/product-spec.md`

- [ ] **Step 1:** Update bagian "Produk ini apa", "Fitur inti", "Alur user", tabel "Keputusan penting", dan "Out of scope" agar mencerminkan model multi-course beli-selamanya. Pindahkan keputusan lama (langganan tahunan, satu kelas) ke catatan "digantikan" + rujuk `multi-ecourse-design.md`.
- [ ] **Step 2: Commit** `git commit -m "docs: sinkron product-spec ke model multi-ecourse"`

---

## Self-Review (penulis plan)

- **Cakupan spec:** Course model ✓ (T1), Module.courseId ✓ (T1/T2), Purchase entitlement ✓ (T1/T5), buang membership ✓ (T1/T16), buang modul 21-23 ✓ (T2), etalase publik Hero+Grid ✓ (T8), `/kursus/[slug]` ✓ (T9), dashboard Kelasku+Jelajahi ✓ (T11), `/belajar/[course]` ✓ (T10), gate modul ✓ (T12), webhook lookup DB ✓ (T5), admin courses/modules/users ✓ (T13-15), hapus /perpanjang & cron ✓ (T16). Semua poin desain tercakup.
- **Konsistensi tipe:** `hasCourseAccess({ isAdmin, ownedCourseIds }, courseId)` dipakai konsisten di T6/T10/T12. `getOwnedCourseIds(prisma, userId)` dipakai konsisten. `matchCourseByProduct(courses, payload)` konsisten T4/T5. Course slug `vibe-coding-gas` konsisten.
- **Placeholder:** UI tasks (T8-15) sengaja deskriptif + reuse komponen, dengan kode lengkap pada gate/logika (server components). Verifikasi manual sesuai aturan testing project (UI = Chrome DevTools, bukan unit test).
- **Catatan:** harga di hero/storefront tampil dari `course.price`; tautan beli Mayar (URL produk) belum dimodelkan — gunakan `coverImage`/link manual atau tambah field `mayarLink` jika perlu (kecil, bisa ditambah saat T8 kalau dibutuhkan).
```
