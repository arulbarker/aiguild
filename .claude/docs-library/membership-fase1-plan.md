# Membership Fase 1 — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ubah AI Guild jadi langganan bulanan Rp149rb via Mayar — webhook perpanjang masa aktif, akses dicabut saat habis, reminder email H-3 + tombol perpanjang.

**Architecture:** Mayar → gateway Cloudflare (fan-out + teruskan signature) → webhook Next.js (verifikasi signature, filter produk `ai-guild`, perpanjang `membershipExpiredAt` +30 hari). Akses dijaga di `/api/modules` (403) & `/modul/[slug]` (redirect). Cron harian kirim reminder H-3 via Resend.

**Tech Stack:** Next.js 14 App Router (JS), Prisma 7 + Postgres, jose JWT, Resend, Vitest, Cloudflare Workers.

**Referensi spec:** `.claude/docs-library/membership-fase1-design.md`

---

## File Structure

| File | Tanggung jawab | Aksi |
|---|---|---|
| `prisma/schema.prisma` | +2 field di User | Modify |
| `lib/membership.js` | Logika murni: hitung expiry, status aktif, perlu reminder | Create |
| `lib/membership.test.js` | Test logika membership | Create |
| `lib/mayar-webhook.js` | Logika murni: filter produk, ekstrak email/orderId dari payload | Create |
| `lib/mayar-webhook.test.js` | Test logika webhook | Create |
| `app/api/webhook/mayar/route.js` | Terapkan filter + perpanjang expiry | Modify |
| `app/api/modules/route.js` | Gerbang membership (403) | Modify |
| `app/modul/[slug]/page.js` | Gerbang membership (redirect) | Modify |
| `app/dashboard/page.js` | Tangani 403 → /perpanjang | Modify |
| `app/perpanjang/page.js` | Halaman status + tombol perpanjang | Create |
| `app/sukses/page.js` | Halaman sukses pasca-bayar (publik) | Create |
| `lib/email.js` | +fungsi `sendRenewalReminder` | Modify |
| `app/api/cron/check-membership/route.js` | Cron reminder H-3 | Create |
| `middleware.js` | Proteksi `/perpanjang` | Modify |
| `workers/mayar-webhook-gateway/worker.js` | Kode gateway (versioned; deploy manual) | Create |

---

### Task 1: Schema — field membership

**Files:**
- Modify: `prisma/schema.prisma` (model User, sekitar baris 9-20)

- [ ] **Step 1: Tambah field ke model User**

Di `model User`, setelah baris `createdAt`, tambahkan:

```prisma
model User {
  id                  String         @id @default(uuid())
  email               String         @unique
  name                String?
  isAdmin             Boolean        @default(false) @map("is_admin")
  membershipExpiredAt DateTime?      @map("membership_expired_at")
  reminderSentAt      DateTime?      @map("reminder_sent_at")
  createdAt           DateTime       @default(now()) @map("created_at")
  purchases           Purchase[]
  progress            UserProgress[]
  magicTokens         MagicToken[]

  @@map("users")
}
```

- [ ] **Step 2: Buat & jalankan migrasi di DEV**

Run: `npx prisma migrate dev --name add_membership_fields`
Expected: migrasi dibuat di `prisma/migrations/`, applied ke DB dev, "Your database is now in sync".

- [ ] **Step 3: Commit**

```bash
git add prisma/schema.prisma prisma/migrations
git commit -m "feat: tambah field membershipExpiredAt & reminderSentAt"
```

> **Migrasi PROD: JANGAN sekarang.** Saat deploy, jalankan `npx prisma migrate deploy` di prod hanya dengan perintah eksplisit user + backup dulu (lihat Task 11).

---

### Task 2: Logika membership (TDD)

**Files:**
- Create: `lib/membership.js`
- Test: `lib/membership.test.js`

- [ ] **Step 1: Tulis test yang gagal**

```javascript
// lib/membership.test.js
import { describe, it, expect } from 'vitest'
import { computeNewExpiry, isMembershipActive, needsReminder } from './membership'

const DAY = 24 * 60 * 60 * 1000

describe('computeNewExpiry', () => {
  const now = new Date('2026-06-15T00:00:00Z')

  it('baru/expired → now + 30 hari', () => {
    expect(computeNewExpiry(null, now).getTime()).toBe(now.getTime() + 30 * DAY)
    const past = new Date('2026-05-01T00:00:00Z')
    expect(computeNewExpiry(past, now).getTime()).toBe(now.getTime() + 30 * DAY)
  })

  it('masih aktif → numpuk dari tanggal habis lama', () => {
    const future = new Date('2026-07-01T00:00:00Z')
    expect(computeNewExpiry(future, now).getTime()).toBe(future.getTime() + 30 * DAY)
  })
})

describe('isMembershipActive', () => {
  const now = new Date('2026-06-15T00:00:00Z')
  it('null → false', () => expect(isMembershipActive(null, now)).toBe(false))
  it('masa depan → true', () => expect(isMembershipActive(new Date('2026-06-20T00:00:00Z'), now)).toBe(true))
  it('masa lalu → false', () => expect(isMembershipActive(new Date('2026-06-10T00:00:00Z'), now)).toBe(false))
})

describe('needsReminder', () => {
  const now = new Date('2026-06-15T00:00:00Z')
  it('habis 2 hari lagi, belum direminder → true', () =>
    expect(needsReminder(new Date('2026-06-17T00:00:00Z'), null, now)).toBe(true))
  it('sudah direminder → false', () =>
    expect(needsReminder(new Date('2026-06-17T00:00:00Z'), new Date('2026-06-14T00:00:00Z'), now)).toBe(false))
  it('masih 10 hari lagi → false', () =>
    expect(needsReminder(new Date('2026-06-25T00:00:00Z'), null, now)).toBe(false))
  it('sudah expired → false', () =>
    expect(needsReminder(new Date('2026-06-10T00:00:00Z'), null, now)).toBe(false))
})
```

- [ ] **Step 2: Jalankan test, pastikan gagal**

Run: `npm run test -- lib/membership.test.js`
Expected: FAIL — "does not provide an export named 'computeNewExpiry'"

- [ ] **Step 3: Implementasi**

```javascript
// lib/membership.js
const DAY_MS = 24 * 60 * 60 * 1000
const PERIOD_DAYS = 30
const REMINDER_DAYS_BEFORE = 3

export function computeNewExpiry(currentExpiry, now, days = PERIOD_DAYS) {
  const base = currentExpiry && currentExpiry > now ? currentExpiry : now
  return new Date(base.getTime() + days * DAY_MS)
}

export function isMembershipActive(expiredAt, now) {
  return expiredAt != null && expiredAt > now
}

export function needsReminder(expiredAt, reminderSentAt, now, daysBefore = REMINDER_DAYS_BEFORE) {
  if (!expiredAt || reminderSentAt) return false
  if (expiredAt <= now) return false
  const daysLeft = (expiredAt.getTime() - now.getTime()) / DAY_MS
  return daysLeft <= daysBefore
}
```

- [ ] **Step 4: Jalankan test, pastikan lulus**

Run: `npm run test -- lib/membership.test.js`
Expected: PASS (semua case)

- [ ] **Step 5: Commit**

```bash
git add lib/membership.js lib/membership.test.js
git commit -m "feat: logika membership (expiry, status, reminder)"
```

---

### Task 3: Logika webhook Mayar (TDD)

**Files:**
- Create: `lib/mayar-webhook.js`
- Test: `lib/mayar-webhook.test.js`

> **Known-unknown:** field produk di payload Mayar belum dikonfirmasi (lihat spec). Implementasi cek beberapa path kandidat (`data.product.link`, `data.product.name`, `data.productLink`). Wajib diverifikasi dari payload asli saat smoke test (Task 11).

- [ ] **Step 1: Tulis test yang gagal**

```javascript
// lib/mayar-webhook.test.js
import { describe, it, expect } from 'vitest'
import { isAiGuildProduct, extractEmail, extractOrderId } from './mayar-webhook'

describe('isAiGuildProduct', () => {
  it('cocok via product.link', () =>
    expect(isAiGuildProduct({ data: { product: { link: 'ai-guild' } } }, 'ai-guild')).toBe(true))
  it('produk lain (ruangsaku) → false', () =>
    expect(isAiGuildProduct({ data: { product: { link: 'ruangsaku' } } }, 'ai-guild')).toBe(false))
  it('payload tanpa produk → false', () =>
    expect(isAiGuildProduct({ data: {} }, 'ai-guild')).toBe(false))
})

describe('extractEmail', () => {
  it('lowercase + trim', () =>
    expect(extractEmail({ data: { customer: { email: '  Aku@Mail.com ' } } })).toBe('aku@mail.com'))
  it('tidak ada → null', () =>
    expect(extractEmail({ data: {} })).toBe(null))
})

describe('extractOrderId', () => {
  it('ambil transaction_id', () =>
    expect(extractOrderId({ data: { transaction_id: 'tx_123' } })).toBe('tx_123'))
  it('tidak ada → null', () =>
    expect(extractOrderId({ data: {} })).toBe(null))
})
```

- [ ] **Step 2: Jalankan test, pastikan gagal**

Run: `npm run test -- lib/mayar-webhook.test.js`
Expected: FAIL — export tidak ditemukan

- [ ] **Step 3: Implementasi**

```javascript
// lib/mayar-webhook.js
export function isAiGuildProduct(payload, productLink) {
  const p = payload?.data?.product ?? {}
  const candidates = [p.link, p.name, payload?.data?.productLink].filter(Boolean)
  return candidates.includes(productLink)
}

export function extractEmail(payload) {
  const email = payload?.data?.customer?.email
  return email ? email.toLowerCase().trim() : null
}

export function extractOrderId(payload) {
  return payload?.data?.transaction_id ?? null
}
```

- [ ] **Step 4: Jalankan test, pastikan lulus**

Run: `npm run test -- lib/mayar-webhook.test.js`
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add lib/mayar-webhook.js lib/mayar-webhook.test.js
git commit -m "feat: logika filter produk & ekstraksi payload webhook Mayar"
```

---

### Task 4: Terapkan logika di webhook route

**Files:**
- Modify: `app/api/webhook/mayar/route.js` (ganti seluruh isi setelah `verifySignature`)

- [ ] **Step 1: Ganti handler POST**

Ganti file penuh jadi:

```javascript
// app/api/webhook/mayar/route.js
import { NextResponse } from 'next/server'
import { createHmac, timingSafeEqual } from 'crypto'
import { prisma } from '@/lib/db'
import { computeNewExpiry } from '@/lib/membership'
import { isAiGuildProduct, extractEmail, extractOrderId } from '@/lib/mayar-webhook'

function verifySignature(payload, signature) {
  const expected = createHmac('sha256', process.env.MAYAR_WEBHOOK_SECRET)
    .update(payload)
    .digest('hex')
  try {
    return timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
  } catch {
    return false
  }
}

export async function POST(request) {
  const rawBody = await request.text()
  const signature = request.headers.get('x-mayar-signature') ?? ''

  if (!verifySignature(rawBody, signature)) {
    return NextResponse.json({ error: 'Signature tidak valid' }, { status: 401 })
  }

  let payload
  try {
    payload = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Payload tidak valid' }, { status: 400 })
  }

  if (payload.event !== 'payment.paid') {
    return NextResponse.json({ message: 'Event diabaikan' })
  }

  // Filter produk — gateway menyebar semua event ke semua app
  if (!isAiGuildProduct(payload, process.env.MAYAR_PRODUCT_LINK)) {
    console.log('Webhook: produk bukan ai-guild, diabaikan', JSON.stringify(payload.data?.product ?? {}))
    return NextResponse.json({ message: 'Produk lain diabaikan' })
  }

  const email = extractEmail(payload)
  const orderId = extractOrderId(payload)

  if (!email) {
    return NextResponse.json({ error: 'Email tidak ditemukan di payload' }, { status: 400 })
  }

  // Idempotency — kalau orderId sudah diproses, jangan perpanjang lagi
  if (orderId) {
    const existing = await prisma.purchase.findFirst({ where: { orderId, source: 'mayar' } })
    if (existing) {
      return NextResponse.json({ message: 'Sudah diproses' })
    }
  }

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email },
  })

  const newExpiry = computeNewExpiry(user.membershipExpiredAt, new Date())

  await prisma.user.update({
    where: { id: user.id },
    data: { membershipExpiredAt: newExpiry, reminderSentAt: null },
  })

  await prisma.purchase.create({
    data: { userId: user.id, source: 'mayar', orderId },
  })

  return NextResponse.json({ message: 'OK' })
}
```

- [ ] **Step 2: Pastikan test lama tetap lulus**

Run: `npm run test`
Expected: PASS (test logika tidak berubah)

- [ ] **Step 3: Commit**

```bash
git add app/api/webhook/mayar/route.js
git commit -m "feat: webhook perpanjang membership + filter produk ai-guild"
```

---

### Task 5: Gerbang akses di /api/modules

**Files:**
- Modify: `app/api/modules/route.js`

- [ ] **Step 1: Tambah cek membership**

Ganti file penuh jadi:

```javascript
// app/api/modules/route.js
import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { isMembershipActive } from '@/lib/membership'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { id: session.userId } })
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (!session.isAdmin && !isMembershipActive(user.membershipExpiredAt, new Date())) {
    return NextResponse.json({ error: 'membership_expired' }, { status: 403 })
  }

  const [modules, progress] = await Promise.all([
    prisma.module.findMany({ orderBy: { orderIndex: 'asc' } }),
    prisma.userProgress.findMany({ where: { userId: session.userId } }),
  ])

  const completedIds = progress.map((p) => p.moduleId)
  return NextResponse.json({ modules, completedIds })
}
```

- [ ] **Step 2: Commit**

```bash
git add app/api/modules/route.js
git commit -m "feat: gerbang membership di /api/modules (403 saat expired)"
```

---

### Task 6: Gerbang akses di /modul/[slug] + dashboard handle 403

**Files:**
- Modify: `app/modul/[slug]/page.js` (setelah cek session)
- Modify: `app/dashboard/page.js` (handler fetch)

- [ ] **Step 1: Tambah cek di server page**

Di `app/modul/[slug]/page.js`, tambah import dan cek setelah `if (!session) redirect('/login')`:

```javascript
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { isMembershipActive } from '@/lib/membership'
import ModuleViewerWrapper from './ModuleViewerWrapper'
```

Lalu setelah baris `if (!session) redirect('/login')`:

```javascript
  const me = await prisma.user.findUnique({ where: { id: session.userId } })
  if (!session.isAdmin && !isMembershipActive(me?.membershipExpiredAt, new Date())) {
    redirect('/perpanjang')
  }
```

- [ ] **Step 2: Dashboard tangani 403**

Di `app/dashboard/page.js`, di dalam `useEffect`, ganti blok fetch:

```javascript
  useEffect(() => {
    fetch('/api/modules').then(async (res) => {
      if (res.status === 401) { router.push('/login'); return }
      if (res.status === 403) { router.push('/perpanjang'); return }
      const data = await res.json()
      setModules(data.modules ?? [])
      setCompleted(data.completedIds ?? [])
      setLoading(false)
    })
  }, [router])
```

- [ ] **Step 3: Commit**

```bash
git add app/modul/[slug]/page.js app/dashboard/page.js
git commit -m "feat: gerbang membership di halaman modul + redirect dashboard"
```

---

### Task 7: Halaman /perpanjang

**Files:**
- Create: `app/perpanjang/page.js`
- Modify: `middleware.js`

- [ ] **Step 1: Buat halaman perpanjang**

```javascript
// app/perpanjang/page.js
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { isMembershipActive } from '@/lib/membership'

export const metadata = { title: 'Perpanjang Langganan — AI Guild' }

export default async function PerpanjangPage() {
  const session = await getSession()
  if (!session) redirect('/login')

  const user = await prisma.user.findUnique({ where: { id: session.userId } })
  const active = isMembershipActive(user?.membershipExpiredAt, new Date())
  const payUrl = process.env.MAYAR_PAYMENT_URL
  const habis = user?.membershipExpiredAt
    ? new Date(user.membershipExpiredAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })
    : null

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg)' }}>
      <div className="max-w-md w-full text-center" style={{ fontFamily: 'var(--font-mono)' }}>
        <p style={{ fontSize: 10, letterSpacing: '0.2em', color: 'var(--amber)', textTransform: 'uppercase', marginBottom: 16 }}>
          AI GUILD · LANGGANAN
        </p>
        <h1 className="font-extrabold" style={{ fontSize: '2rem', color: 'var(--cream)', marginBottom: 16, fontFamily: 'var(--font-syne)' }}>
          {active ? 'Langganan Masih Aktif' : 'Langganan Habis'}
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 28, lineHeight: 1.6 }}>
          {active
            ? `Aktif sampai ${habis}. Kamu bisa perpanjang kapan saja — masa aktif numpuk +30 hari.`
            : 'Perpanjang untuk lanjut belajar di AI Guild. Rp149.000 / 30 hari.'}
        </p>
        <a
          href={payUrl}
          style={{
            display: 'inline-block', background: 'var(--amber)', color: '#07070a',
            padding: '14px 32px', borderRadius: 10, textDecoration: 'none', fontWeight: 700,
          }}
        >
          Perpanjang Rp149.000
        </a>
        <p style={{ color: 'var(--muted)', fontSize: 12, marginTop: 24 }}>
          Setelah bayar, masa aktif diperbarui otomatis dalam beberapa menit.
        </p>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Proteksi /perpanjang di middleware**

Di `middleware.js`, ubah blok proteksi dan matcher:

```javascript
  // Proteksi route /dashboard, /modul, /perpanjang
  if (
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/modul') ||
    pathname.startsWith('/perpanjang')
  ) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }
```

Dan matcher:

```javascript
export const config = {
  matcher: ['/login', '/dashboard/:path*', '/modul/:path*', '/perpanjang/:path*', '/admin/:path*'],
}
```

- [ ] **Step 3: Smoke test (Chrome DevTools MCP)**

Login dev sebagai user expired (set `membershipExpiredAt` ke masa lalu via prisma studio/seed) → buka `/dashboard` → harus redirect `/perpanjang` → tombol muncul, link = MAYAR_PAYMENT_URL.

- [ ] **Step 4: Commit**

```bash
git add app/perpanjang/page.js middleware.js
git commit -m "feat: halaman perpanjang langganan + proteksi route"
```

---

### Task 8: Email reminder

**Files:**
- Modify: `lib/email.js` (tambah fungsi)

- [ ] **Step 1: Tambah sendRenewalReminder**

Tambahkan di akhir `lib/email.js`:

```javascript
export async function sendRenewalReminder(email) {
  const payUrl = process.env.MAYAR_PAYMENT_URL

  await resend.emails.send({
    from: 'AI Guild <onboarding@resend.dev>',
    to: email,
    subject: 'Langgananmu di AI Guild habis 3 hari lagi',
    html: `
      <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;">
        <h2 style="color:#7c3aed;">AI Guild</h2>
        <p>Langgananmu akan <strong>habis dalam 3 hari</strong>. Perpanjang sekarang supaya akses materi & grup tidak terputus.</p>
        <a href="${payUrl}"
           style="display:inline-block;background:#7c3aed;color:white;
                  padding:12px 28px;border-radius:8px;text-decoration:none;
                  font-weight:600;margin:16px 0;">
          Perpanjang Rp149.000
        </a>
        <p style="color:#6b7280;font-size:0.85rem;">
          Atau buka link ini:<br/>
          <a href="${payUrl}" style="color:#7c3aed;">${payUrl}</a>
        </p>
      </div>
    `,
  })
}
```

- [ ] **Step 2: Commit**

```bash
git add lib/email.js
git commit -m "feat: email reminder perpanjang langganan"
```

---

### Task 9: Cron endpoint reminder H-3

**Files:**
- Create: `app/api/cron/check-membership/route.js`

- [ ] **Step 1: Buat endpoint cron**

```javascript
// app/api/cron/check-membership/route.js
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { needsReminder } from '@/lib/membership'
import { sendRenewalReminder } from '@/lib/email'

export async function POST(request) {
  const secret = request.headers.get('x-cron-secret')
  if (!secret || secret !== process.env.CRON_SECRET) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const now = new Date()
  const dalam3Hari = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)

  // Kandidat: habis antara sekarang dan 3 hari lagi, belum direminder
  const kandidat = await prisma.user.findMany({
    where: {
      membershipExpiredAt: { gt: now, lte: dalam3Hari },
      reminderSentAt: null,
    },
  })

  let terkirim = 0
  for (const user of kandidat) {
    if (!needsReminder(user.membershipExpiredAt, user.reminderSentAt, now)) continue
    try {
      await sendRenewalReminder(user.email)
      await prisma.user.update({ where: { id: user.id }, data: { reminderSentAt: now } })
      terkirim++
    } catch (e) {
      console.error('Gagal kirim reminder ke', user.email, e?.message)
    }
  }

  return NextResponse.json({ ok: true, dicek: kandidat.length, terkirim })
}
```

- [ ] **Step 2: Smoke test lokal**

Set seorang user dev `membershipExpiredAt` = besok, `reminderSentAt` = null. Jalankan:
Run: `curl -X POST http://localhost:3000/api/cron/check-membership -H "x-cron-secret: $CRON_SECRET"`
Expected: `{"ok":true,"dicek":1,"terkirim":1}` dan `reminderSentAt` terisi (cek ulang → `terkirim:0`).

- [ ] **Step 3: Commit**

```bash
git add app/api/cron/check-membership/route.js
git commit -m "feat: cron reminder H-3 langganan"
```

---

### Task 10: Halaman sukses pasca-bayar + gateway worker

**Files:**
- Create: `app/sukses/page.js`
- Create: `workers/mayar-webhook-gateway/worker.js`

- [ ] **Step 1: Halaman sukses (publik)**

```javascript
// app/sukses/page.js
export const metadata = { title: 'Pembayaran Berhasil — AI Guild' }

export default function SuksesPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: 'var(--bg)' }}>
      <div className="max-w-md w-full text-center" style={{ fontFamily: 'var(--font-mono)' }}>
        <h1 className="font-extrabold" style={{ fontSize: '2rem', color: 'var(--cream)', marginBottom: 16, fontFamily: 'var(--font-syne)' }}>
          Pembayaran Berhasil 🎉
        </h1>
        <p style={{ color: 'var(--muted)', fontSize: 14, marginBottom: 28, lineHeight: 1.6 }}>
          Cek email kamu untuk link masuk ke AI Guild. Klik tombol di email itu untuk mulai belajar.
        </p>
        <a href="/login" style={{ display: 'inline-block', background: 'var(--amber)', color: '#07070a', padding: '14px 32px', borderRadius: 10, textDecoration: 'none', fontWeight: 700 }}>
          Masuk
        </a>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Kode gateway worker (versioned)**

```javascript
// workers/mayar-webhook-gateway/worker.js
// Mayar Webhook Gateway — fan-out 1 webhook URL ke beberapa app.
// Tambah app baru di TARGETS. Meneruskan header x-mayar-signature.

const TARGETS = [
  'https://app.ruangsaku.com/api/webhooks/mayar',
  'https://aiguild.online/api/webhook/mayar',
]

export default {
  async fetch(request) {
    if (request.method === 'GET') {
      return new Response(
        JSON.stringify({ ok: true, service: 'mayar-webhook-gateway', targets: TARGETS.length }),
        { headers: { 'Content-Type': 'application/json' } }
      )
    }
    if (request.method !== 'POST') {
      return new Response('Method not allowed', { status: 405 })
    }

    const body = await request.text()
    const signature = request.headers.get('x-mayar-signature') ?? ''

    const results = await Promise.allSettled(
      TARGETS.map((url) =>
        fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'x-mayar-signature': signature },
          body,
        }).then((r) => ({ url, status: r.status, ok: r.ok }))
      )
    )

    console.log('Mayar webhook fan-out:', JSON.stringify(
      results.map((r) => ({ ok: r.status === 'fulfilled', data: r.status === 'fulfilled' ? r.value : r.reason?.message }))
    ))

    return new Response(
      JSON.stringify({ ok: true, forwarded_to: TARGETS.length }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    )
  },
}
```

> **Deploy gateway = manual oleh user** (MCP Cloudflare read-only untuk Workers). Cara: paste kode di Cloudflare dashboard → Worker `mayar-webhook-gateway` → Edit code → Deploy. Atau `wrangler deploy`. **Aman untuk ruangsaku** — perubahan hanya menambah target + meneruskan header.

- [ ] **Step 3: Commit**

```bash
git add app/sukses/page.js workers/mayar-webhook-gateway/worker.js
git commit -m "feat: halaman sukses pasca-bayar + kode gateway worker terupdate"
```

---

### Task 11: Env, smoke test menyeluruh, deploy

**Files:**
- Modify: `.env.local` (dev), env Coolify (prod — manual user)

- [ ] **Step 1: Tambah env dev** (`.env.local`)

```
MAYAR_PAYMENT_URL=https://aiadalahbudak.myr.id/m/ai-guild
MAYAR_PRODUCT_LINK=ai-guild
CRON_SECRET=<generate-acak-panjang>
```

- [ ] **Step 2: Smoke test menyeluruh (Chrome DevTools MCP)**

1. User aktif → `/dashboard` tampil modul normal.
2. User expired → `/dashboard` redirect `/perpanjang`, tombol bayar benar.
3. `/modul/<slug>` untuk user expired → redirect `/perpanjang`.
4. Admin → selalu bisa akses walau tanpa membership.
5. Cron endpoint → kirim reminder, set `reminderSentAt`, idempotent.
6. Console bersih, tidak ada error baru.

- [ ] **Step 3: Verifikasi filter produk dengan payload asli**

Setelah gateway terdeploy & webhook Mayar diarahkan ke gateway: lakukan 1 pembayaran test (atau Mayar "webhook test"). Cek log container: `docker logs aiguild-app --tail 50`. Konfirmasi field produk di payload cocok dengan `isAiGuildProduct`. Kalau path field beda → sesuaikan `lib/mayar-webhook.js` + test.

- [ ] **Step 4: Deploy (perintah eksplisit user)**

Saat user bilang "push ke prod":
1. Pastikan env prod di Coolify terisi (`MAYAR_PAYMENT_URL`, `MAYAR_PRODUCT_LINK`, `CRON_SECRET`).
2. **Backup DB prod** (ada migrasi struktur).
3. Merge ke master → auto-deploy.
4. Migrasi prod: auto-seed di deploy.yml hanya `npm run seed` — **migrasi `prisma migrate deploy` perlu ditambah ke pipeline atau dijalankan manual** (catatan: `npx prisma migrate deploy` di container prod).
5. Set cron harian di Coolify/VPS → `POST /api/cron/check-membership` dengan header `x-cron-secret`.
6. Deploy gateway worker (Step 2 Task 10).
7. Verifikasi pasca-deploy: bayar test → akses aktif.

- [ ] **Step 5: Update product-spec.md**

Tambah ringkasan fitur membership ke `.claude/docs-library/product-spec.md` (model langganan, alur bayar→akses→perpanjang).

---

## Catatan deploy penting

- **Project pakai `prisma db push` (bukan migrasi).** Tidak ada folder `prisma/migrations`. Schema dev disinkron via `npx prisma db push`.
- **Schema prod TIDAK disinkron otomatis** (sesuai aturan: perubahan DB prod hanya dengan perintah eksplisit + backup). `deploy.yml` cuma `prisma generate && seed`. Saat deploy Fase 1 ini, jalankan **sekali manual** di container prod setelah backup DB:
  ```bash
  docker run --rm --network aiguild-net --env-file /data/aiguild/.env.production \
    -v /data/aiguild:/app -w /app node:20-alpine \
    sh -c "npm ci && npx prisma generate && npx prisma db push"
  ```
  Kolom baru nullable → additive, aman (db push abort kalau ada data-loss di CI non-interaktif). **Tanpa langkah ini, kolom baru tidak ada di prod → webhook & query error.**
- Cron belum ada infrastrukturnya — perlu dibuat scheduled job di Coolify/VPS (Task 11 Step 4.5).
