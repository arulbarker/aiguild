# Admin Panel + Voucher — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) atau superpowers:executing-plans untuk implement task-by-task. Step pakai checkbox (`- [ ]`).

**Goal:** Lengkapi admin panel AI Guild (restyle ke brand, kelola membership, statistik+filter, CRUD modul penuh) dan tambah manajemen voucher diskon via UI yang tersambung ke API kupon Mayar.

**Architecture:** Admin pages Next.js (server components untuk data, client untuk interaktif). Voucher: UI admin → API route server kita (pegang `MAYAR_API_KEY`) → Mayar `POST /coupon/create`; tabel `Voucher` lokal sebagai cermin untuk daftar/status (Mayar = sumber kebenaran penukaran di checkout). Semua endpoint admin dijaga `requireAdmin()` (session.isAdmin).

**Tech Stack:** Next.js 14 App Router (JS), Prisma 7 + Postgres (db push), Vitest, Mayar Headless API, Tailwind + design token brand (amber/Sora/dark).

**Referensi:** Mayar create coupon `POST https://api.mayar.id/hl/v1/coupon/create`, auth `Authorization: Bearer <MAYAR_API_KEY>`, body `{ name, expiredAt, discount:{discountType:'monetary'|'percentage', value, minimumPurchase, eligibleCustomerType:'all', totalCoupons}, coupon:{code, type:'reusable'|'onetime'}, products:[] }`.

---

## File Structure

| File | Tanggung jawab | Aksi |
|---|---|---|
| `prisma/schema.prisma` | +model `Voucher` | Modify |
| `lib/admin.js` | helper `requireAdmin()` dipakai bersama | Create |
| `lib/admin-stats.js` | logika murni hitung statistik (aktif/expired/pendapatan) | Create |
| `lib/admin-stats.test.js` | test statistik | Create |
| `lib/mayar-api.js` | client Mayar: `buildCouponPayload`, `createMayarCoupon` | Create |
| `lib/mayar-api.test.js` | test `buildCouponPayload` | Create |
| `components/AdminLayout.js` | shell admin (bg, nav, breadcrumb) brand | Create |
| `app/admin/page.js` | dashboard statistik (restyle + angka baru) | Modify |
| `app/admin/users/page.js` | tabel user + status membership + search | Modify |
| `app/admin/users/UsersTable.js` | client: filter + aksi (set membership, toggle admin) | Create |
| `app/api/admin/users/route.js` | GET (with membership) + PATCH (isAdmin, membershipExpiredAt) | Modify |
| `app/admin/modules/page.js` | restyle + tambah/hapus modul | Modify |
| `app/admin/purchases/page.js` | restyle + search | Modify |
| `app/api/admin/stats/route.js` | GET statistik dashboard | Create |
| `app/admin/vouchers/page.js` | UI daftar + form buat voucher | Create |
| `app/admin/vouchers/VoucherManager.js` | client: form + list | Create |
| `app/api/admin/vouchers/route.js` | GET (list lokal) + POST (buat di Mayar + simpan cermin) | Create |

---

### Task 1: Model Voucher + helper admin

**Files:**
- Modify: `prisma/schema.prisma`
- Create: `lib/admin.js`

- [ ] **Step 1: Tambah model Voucher**

Di `prisma/schema.prisma`, tambahkan di akhir:

```prisma
model Voucher {
  id              String   @id @default(uuid())
  code            String   @unique
  name            String
  discountType    String   @map("discount_type")
  value           Int
  minimumPurchase Int      @default(0) @map("minimum_purchase")
  totalCoupons    Int      @map("total_coupons")
  couponType      String   @map("coupon_type")
  expiredAt       DateTime @map("expired_at")
  mayarId         String?  @map("mayar_id")
  isActive        Boolean  @default(true) @map("is_active")
  createdAt       DateTime @default(now()) @map("created_at")

  @@map("vouchers")
}
```

- [ ] **Step 2: Push schema ke dev**

Run: `npx prisma db push && npx prisma generate`
Expected: "Your database is now in sync", client regenerated.

- [ ] **Step 3: Buat helper requireAdmin**

```javascript
// lib/admin.js
import { getSession } from '@/lib/auth'

export async function requireAdmin() {
  const session = await getSession()
  if (!session?.isAdmin) return null
  return session
}
```

- [ ] **Step 4: Commit**

```bash
git add prisma/schema.prisma lib/admin.js
git commit -m "feat: model Voucher + helper requireAdmin"
```

---

### Task 2: Logika statistik (TDD)

**Files:**
- Create: `lib/admin-stats.js`
- Test: `lib/admin-stats.test.js`

- [ ] **Step 1: Tulis test gagal**

```javascript
// lib/admin-stats.test.js
import { describe, it, expect } from 'vitest'
import { summarizeMembers } from './admin-stats'

const now = new Date('2026-06-15T00:00:00Z')

describe('summarizeMembers', () => {
  it('hitung aktif vs expired vs belum pernah', () => {
    const users = [
      { membershipExpiredAt: new Date('2026-07-01T00:00:00Z') }, // aktif
      { membershipExpiredAt: new Date('2026-06-01T00:00:00Z') }, // expired
      { membershipExpiredAt: null },                             // belum
    ]
    const s = summarizeMembers(users, now)
    expect(s.active).toBe(1)
    expect(s.expired).toBe(1)
    expect(s.never).toBe(1)
    expect(s.total).toBe(3)
  })
})
```

- [ ] **Step 2: Run test → gagal**

Run: `npm run test -- lib/admin-stats.test.js`
Expected: FAIL — export tidak ada.

- [ ] **Step 3: Implementasi**

```javascript
// lib/admin-stats.js
export function summarizeMembers(users, now = new Date()) {
  let active = 0, expired = 0, never = 0
  for (const u of users) {
    if (!u.membershipExpiredAt) never++
    else if (new Date(u.membershipExpiredAt) > now) active++
    else expired++
  }
  return { active, expired, never, total: users.length }
}
```

- [ ] **Step 4: Run test → lulus**

Run: `npm run test -- lib/admin-stats.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/admin-stats.js lib/admin-stats.test.js
git commit -m "feat: logika statistik member admin"
```

---

### Task 3: Client Mayar API + payload builder (TDD)

**Files:**
- Create: `lib/mayar-api.js`
- Test: `lib/mayar-api.test.js`

- [ ] **Step 1: Tulis test gagal**

```javascript
// lib/mayar-api.test.js
import { describe, it, expect } from 'vitest'
import { buildCouponPayload } from './mayar-api'

describe('buildCouponPayload', () => {
  it('bentuk body sesuai skema Mayar', () => {
    const body = buildCouponPayload({
      name: 'Diskon Launch', code: 'LAUNCH50', discountType: 'percentage',
      value: 50, minimumPurchase: 0, totalCoupons: 100, couponType: 'reusable',
      expiredAt: '2030-01-01T00:00:00.000Z',
    })
    expect(body).toEqual({
      name: 'Diskon Launch',
      expiredAt: '2030-01-01T00:00:00.000Z',
      discount: { discountType: 'percentage', value: 50, minimumPurchase: 0, eligibleCustomerType: 'all', totalCoupons: 100 },
      coupon: { code: 'LAUNCH50', type: 'reusable' },
      products: [],
    })
  })
})
```

- [ ] **Step 2: Run test → gagal**

Run: `npm run test -- lib/mayar-api.test.js`
Expected: FAIL.

- [ ] **Step 3: Implementasi**

```javascript
// lib/mayar-api.js
const BASE = process.env.MAYAR_API_BASE || 'https://api.mayar.id/hl/v1'

export function buildCouponPayload({ name, code, discountType, value, minimumPurchase = 0, totalCoupons, couponType, expiredAt, productIds = [] }) {
  return {
    name,
    expiredAt,
    discount: { discountType, value, minimumPurchase, eligibleCustomerType: 'all', totalCoupons },
    coupon: { code, type: couponType },
    products: productIds,
  }
}

export async function createMayarCoupon(input) {
  if (!process.env.MAYAR_API_KEY) throw new Error('MAYAR_API_KEY belum diset')
  const res = await fetch(`${BASE}/coupon/create`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${process.env.MAYAR_API_KEY}`, 'Content-Type': 'application/json' },
    body: JSON.stringify(buildCouponPayload(input)),
  })
  const json = await res.json().catch(() => ({}))
  if (!res.ok || (json.statusCode && json.statusCode >= 400)) {
    throw new Error(json.messages || `Mayar error ${res.status}`)
  }
  return json.data
}
```

- [ ] **Step 4: Run test → lulus**

Run: `npm run test -- lib/mayar-api.test.js`
Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add lib/mayar-api.js lib/mayar-api.test.js
git commit -m "feat: client Mayar coupon API + payload builder"
```

---

### Task 4: AdminLayout brand + restyle dashboard

**Files:**
- Create: `components/AdminLayout.js`
- Modify: `app/admin/page.js`
- Create: `app/api/admin/stats/route.js`

- [ ] **Step 1: Buat AdminLayout**

```javascript
// components/AdminLayout.js
import Link from 'next/link'

const NAV = [
  { href: '/admin', label: 'Ringkasan' },
  { href: '/admin/users', label: 'User' },
  { href: '/admin/modules', label: 'Modul' },
  { href: '/admin/purchases', label: 'Pembelian' },
  { href: '/admin/vouchers', label: 'Voucher' },
]

export default function AdminLayout({ active, children }) {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)', color: 'var(--cream)' }}>
      <header className="border-b" style={{ borderColor: 'var(--border)' }}>
        <div className="max-w-6xl mx-auto px-5 py-4 flex items-center justify-between">
          <span className="font-extrabold" style={{ fontFamily: 'var(--font-display)', fontSize: 16 }}>
            AI<span style={{ color: 'var(--amber)' }}>·</span>GUILD <span style={{ color: 'var(--muted)', fontSize: 12 }}>admin</span>
          </span>
          <nav className="flex gap-1" style={{ fontFamily: 'var(--font-mono)', fontSize: 12 }}>
            {NAV.map((n) => (
              <Link key={n.href} href={n.href}
                style={{ padding: '6px 12px', borderRadius: 8, color: active === n.href ? '#07070A' : 'var(--muted)', background: active === n.href ? 'var(--amber)' : 'transparent' }}>
                {n.label}
              </Link>
            ))}
          </nav>
        </div>
      </header>
      <main className="max-w-6xl mx-auto px-5 py-8">{children}</main>
    </div>
  )
}
```

- [ ] **Step 2: Endpoint statistik**

```javascript
// app/api/admin/stats/route.js
import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { prisma } from '@/lib/db'
import { summarizeMembers } from '@/lib/admin-stats'

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const [users, modules, purchases, vouchers] = await Promise.all([
    prisma.user.findMany({ select: { membershipExpiredAt: true } }),
    prisma.module.count(),
    prisma.purchase.count(),
    prisma.voucher.count(),
  ])
  const members = summarizeMembers(users)
  return NextResponse.json({ members, modules, purchases, vouchers })
}
```

- [ ] **Step 3: Restyle dashboard pakai AdminLayout + statistik**

Ganti `app/admin/page.js` jadi server component yang ambil data langsung:

```javascript
// app/admin/page.js
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { summarizeMembers } from '@/lib/admin-stats'
import AdminLayout from '@/components/AdminLayout'

export const metadata = { title: 'Admin — AI Guild' }

export default async function AdminDashboard() {
  const session = await getSession()
  if (!session?.isAdmin) redirect('/')

  const [users, modules, purchases, vouchers] = await Promise.all([
    prisma.user.findMany({ select: { membershipExpiredAt: true } }),
    prisma.module.count(),
    prisma.purchase.count(),
    prisma.voucher.count(),
  ])
  const m = summarizeMembers(users)

  const cards = [
    { label: 'Member aktif', value: m.active, accent: true },
    { label: 'Member expired', value: m.expired },
    { label: 'Total user', value: m.total },
    { label: 'Modul', value: modules },
    { label: 'Pembelian', value: purchases },
    { label: 'Voucher', value: vouchers },
  ]

  return (
    <AdminLayout active="/admin">
      <h1 className="font-extrabold mb-6" style={{ fontFamily: 'var(--font-display)', fontSize: 28 }}>Ringkasan</h1>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="rounded-2xl p-6" style={{ background: 'var(--surface)', border: `1px solid ${c.accent ? 'rgba(232,160,32,0.3)' : 'var(--border)'}` }}>
            <p style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>{c.label}</p>
            <p className="font-extrabold mt-2" style={{ fontFamily: 'var(--font-display)', fontSize: 36, color: c.accent ? 'var(--amber)' : 'var(--cream)' }}>{c.value}</p>
          </div>
        ))}
      </div>
    </AdminLayout>
  )
}
```

- [ ] **Step 4: Smoke + commit**

Run: `npm run build` (Expected: Compiled successfully)

```bash
git add components/AdminLayout.js app/admin/page.js app/api/admin/stats/route.js
git commit -m "feat: admin layout brand + dashboard statistik membership"
```

---

### Task 5: Kelola user — membership + admin (API)

**Files:**
- Modify: `app/api/admin/users/route.js`

- [ ] **Step 1: Update route (GET sertakan membership; PATCH dukung membershipExpiredAt)**

```javascript
// app/api/admin/users/route.js
import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { prisma } from '@/lib/db'

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true, email: true, name: true, isAdmin: true,
      membershipExpiredAt: true, createdAt: true,
      purchases: { select: { source: true }, take: 1, orderBy: { purchasedAt: 'desc' } },
      _count: { select: { progress: true } },
    },
  })
  return NextResponse.json({ users })
}

export async function PATCH(request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const { userId, isAdmin, membershipExpiredAt } = await request.json()
  if (!userId) return NextResponse.json({ error: 'userId diperlukan' }, { status: 400 })

  const data = {}
  if (typeof isAdmin === 'boolean') data.isAdmin = isAdmin
  if (membershipExpiredAt !== undefined) {
    data.membershipExpiredAt = membershipExpiredAt ? new Date(membershipExpiredAt) : null
    data.reminderSentAt = null
  }
  const user = await prisma.user.update({ where: { id: userId }, data })
  return NextResponse.json({ user })
}
```

- [ ] **Step 2: Commit**

```bash
git add app/api/admin/users/route.js
git commit -m "feat: API admin kelola membership user + toggle admin"
```

---

### Task 6: Kelola user — UI tabel + filter + aksi

**Files:**
- Modify: `app/admin/users/page.js`
- Create: `app/admin/users/UsersTable.js`

- [ ] **Step 1: Page server → render UsersTable**

```javascript
// app/admin/users/page.js
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import AdminLayout from '@/components/AdminLayout'
import UsersTable from './UsersTable'

export const metadata = { title: 'User — Admin AI Guild' }

export default async function UsersPage() {
  const session = await getSession()
  if (!session?.isAdmin) redirect('/')
  return (
    <AdminLayout active="/admin/users">
      <h1 className="font-extrabold mb-6" style={{ fontFamily: 'var(--font-display)', fontSize: 28 }}>User</h1>
      <UsersTable />
    </AdminLayout>
  )
}
```

- [ ] **Step 2: UsersTable client (fetch, search, set membership, toggle admin)**

```javascript
// app/admin/users/UsersTable.js
'use client'
import { useState, useEffect } from 'react'

function statusBadge(expiredAt) {
  if (!expiredAt) return { t: 'Belum', c: 'var(--muted)' }
  return new Date(expiredAt) > new Date() ? { t: 'Aktif', c: 'var(--amber)' } : { t: 'Expired', c: '#f87171' }
}

export default function UsersTable() {
  const [users, setUsers] = useState([])
  const [q, setQ] = useState('')
  const [loading, setLoading] = useState(true)

  async function load() {
    const res = await fetch('/api/admin/users')
    const data = await res.json()
    setUsers(data.users ?? [])
    setLoading(false)
  }
  useEffect(() => { load() }, [])

  async function patch(userId, body) {
    await fetch('/api/admin/users', { method: 'PATCH', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ userId, ...body }) })
    await load()
  }

  function extendOneYear(u) {
    const base = u.membershipExpiredAt && new Date(u.membershipExpiredAt) > new Date() ? new Date(u.membershipExpiredAt) : new Date()
    const next = new Date(base.getTime() + 365 * 24 * 60 * 60 * 1000)
    patch(u.id, { membershipExpiredAt: next.toISOString() })
  }

  const filtered = users.filter((u) => u.email.toLowerCase().includes(q.toLowerCase()))
  if (loading) return <p style={{ color: 'var(--muted)' }}>Memuat...</p>

  return (
    <div>
      <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Cari email..."
        className="w-full sm:w-80 rounded-xl px-4 py-2.5 mb-4 text-sm outline-none"
        style={{ background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--cream)' }} />
      <div className="rounded-2xl overflow-hidden" style={{ border: '1px solid var(--border)' }}>
        {filtered.map((u) => {
          const b = statusBadge(u.membershipExpiredAt)
          return (
            <div key={u.id} className="flex flex-wrap items-center gap-3 px-4 py-3" style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
              <span className="flex-1" style={{ fontSize: 14, minWidth: 180 }}>{u.email}{u.isAdmin && <span style={{ color: 'var(--amber)', fontSize: 11 }}> · admin</span>}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: b.c, minWidth: 64 }}>{b.t}</span>
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted)' }}>
                {u.membershipExpiredAt ? new Date(u.membershipExpiredAt).toLocaleDateString('id-ID') : '—'}
              </span>
              <button onClick={() => extendOneYear(u)} style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: '#07070A', background: 'var(--amber)', padding: '5px 10px', borderRadius: 7 }}>+1 thn</button>
              <button onClick={() => patch(u.id, { membershipExpiredAt: null })} style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted)', border: '1px solid var(--border)', padding: '5px 10px', borderRadius: 7 }}>Cabut</button>
              <button onClick={() => patch(u.id, { isAdmin: !u.isAdmin })} style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted)', border: '1px solid var(--border)', padding: '5px 10px', borderRadius: 7 }}>{u.isAdmin ? 'Cabut admin' : 'Jadikan admin'}</button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Smoke + commit**

Run: `npm run build` (Expected: Compiled successfully)

```bash
git add app/admin/users/page.js app/admin/users/UsersTable.js
git commit -m "feat: UI admin kelola user (status membership, perpanjang, cabut, toggle admin)"
```

---

### Task 7: Restyle modul (tambah/hapus) + purchases (search)

**Files:**
- Modify: `app/admin/modules/page.js`
- Modify: `app/admin/purchases/page.js`

- [ ] **Step 1: Restyle modules + tambah aksi Create/Delete**

Bungkus halaman dengan `AdminLayout active="/admin/modules"`, ganti class Tailwind ungu/gray ke token brand (`var(--surface)`, `var(--border)`, `var(--amber)`, `var(--cream)`, `var(--font-display)`). Pakai API yang sudah ada: POST `/api/admin/modules` (tambah, butuh `title`+`slug`), DELETE `/api/admin/modules` (body `{ id }`). Tambahkan:
- Tombol "+ Modul baru" buka form kosong (title, slug, description, youtubeUrl, gammaUrl, orderIndex) → POST → reload.
- Tombol "Hapus" per modul → konfirmasi `window.confirm` → DELETE → reload.

- [ ] **Step 2: Restyle purchases + search email**

Bungkus `AdminLayout active="/admin/purchases"`. Restyle tabel ke token brand. Tambah input search yang filter baris berdasarkan email (client-side, jadikan client component kecil bila perlu).

- [ ] **Step 3: Smoke + commit**

Run: `npm run build` (Expected: Compiled successfully)

```bash
git add app/admin/modules/page.js app/admin/purchases/page.js
git commit -m "feat: restyle admin modul (tambah/hapus) + purchases (search)"
```

---

### Task 8: Voucher — API (buat di Mayar + cermin lokal, list)

**Files:**
- Create: `app/api/admin/vouchers/route.js`

- [ ] **Step 1: Route GET (list lokal) + POST (Mayar + simpan)**

```javascript
// app/api/admin/vouchers/route.js
import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { prisma } from '@/lib/db'
import { createMayarCoupon } from '@/lib/mayar-api'

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const vouchers = await prisma.voucher.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json({ vouchers })
}

export async function POST(request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const body = await request.json()
  const { name, code, discountType, value, minimumPurchase, totalCoupons, couponType, expiredAt } = body

  if (!name || !code || !discountType || !value || !totalCoupons || !couponType || !expiredAt) {
    return NextResponse.json({ error: 'Field wajib kurang' }, { status: 400 })
  }
  if (!['monetary', 'percentage'].includes(discountType)) {
    return NextResponse.json({ error: 'discountType tidak valid' }, { status: 400 })
  }

  const existing = await prisma.voucher.findUnique({ where: { code } })
  if (existing) return NextResponse.json({ error: 'Kode voucher sudah dipakai' }, { status: 409 })

  let mayar
  try {
    mayar = await createMayarCoupon({
      name, code, discountType, value: Number(value),
      minimumPurchase: Number(minimumPurchase) || 0,
      totalCoupons: Number(totalCoupons), couponType, expiredAt,
    })
  } catch (e) {
    return NextResponse.json({ error: `Gagal di Mayar: ${e.message}` }, { status: 502 })
  }

  const voucher = await prisma.voucher.create({
    data: {
      code, name, discountType, value: Number(value),
      minimumPurchase: Number(minimumPurchase) || 0,
      totalCoupons: Number(totalCoupons), couponType,
      expiredAt: new Date(expiredAt), mayarId: mayar?.id ?? null,
    },
  })
  return NextResponse.json({ voucher })
}
```

- [ ] **Step 2: Commit**

```bash
git add app/api/admin/vouchers/route.js
git commit -m "feat: API voucher (buat kupon Mayar + cermin lokal, list)"
```

---

### Task 9: Voucher — UI

**Files:**
- Create: `app/admin/vouchers/page.js`
- Create: `app/admin/vouchers/VoucherManager.js`

- [ ] **Step 1: Page server**

```javascript
// app/admin/vouchers/page.js
import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import AdminLayout from '@/components/AdminLayout'
import VoucherManager from './VoucherManager'

export const metadata = { title: 'Voucher — Admin AI Guild' }

export default async function VouchersPage() {
  const session = await getSession()
  if (!session?.isAdmin) redirect('/')
  return (
    <AdminLayout active="/admin/vouchers">
      <h1 className="font-extrabold mb-6" style={{ fontFamily: 'var(--font-display)', fontSize: 28 }}>Voucher Diskon</h1>
      <VoucherManager />
    </AdminLayout>
  )
}
```

- [ ] **Step 2: VoucherManager client (form + list)**

```javascript
// app/admin/vouchers/VoucherManager.js
'use client'
import { useState, useEffect } from 'react'

const empty = { name: '', code: '', discountType: 'percentage', value: '', minimumPurchase: '', totalCoupons: '100', couponType: 'reusable', expiredAt: '' }

export default function VoucherManager() {
  const [vouchers, setVouchers] = useState([])
  const [form, setForm] = useState(empty)
  const [msg, setMsg] = useState('')
  const [saving, setSaving] = useState(false)

  async function load() {
    const res = await fetch('/api/admin/vouchers')
    const data = await res.json()
    setVouchers(data.vouchers ?? [])
  }
  useEffect(() => { load() }, [])

  async function submit(e) {
    e.preventDefault()
    setSaving(true); setMsg('')
    const res = await fetch('/api/admin/vouchers', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(form) })
    const data = await res.json()
    setSaving(false)
    if (!res.ok) { setMsg(data.error || 'Gagal'); return }
    setForm(empty); setMsg('Voucher dibuat ✓'); load()
  }

  const inp = { background: 'var(--surface-2)', border: '1px solid var(--border)', color: 'var(--cream)', borderRadius: 10, padding: '10px 12px', fontSize: 14, width: '100%' }

  return (
    <div className="grid lg:grid-cols-2 gap-8">
      <form onSubmit={submit} className="rounded-2xl p-6 space-y-3" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <input style={inp} placeholder="Nama (mis. Diskon Launch)" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
        <input style={inp} placeholder="KODE (mis. LAUNCH50)" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} required />
        <div className="flex gap-3">
          <select style={inp} value={form.discountType} onChange={(e) => setForm({ ...form, discountType: e.target.value })}>
            <option value="percentage">Persen (%)</option>
            <option value="monetary">Rupiah (Rp)</option>
          </select>
          <input style={inp} type="number" placeholder={form.discountType === 'percentage' ? 'Nilai % (mis. 50)' : 'Nilai Rp'} value={form.value} onChange={(e) => setForm({ ...form, value: e.target.value })} required />
        </div>
        <div className="flex gap-3">
          <input style={inp} type="number" placeholder="Kuota (totalCoupons)" value={form.totalCoupons} onChange={(e) => setForm({ ...form, totalCoupons: e.target.value })} required />
          <select style={inp} value={form.couponType} onChange={(e) => setForm({ ...form, couponType: e.target.value })}>
            <option value="reusable">Reusable</option>
            <option value="onetime">Sekali pakai</option>
          </select>
        </div>
        <input style={inp} type="number" placeholder="Minimum pembelian (Rp, opsional)" value={form.minimumPurchase} onChange={(e) => setForm({ ...form, minimumPurchase: e.target.value })} />
        <label style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--muted)' }}>Kedaluwarsa</label>
        <input style={inp} type="datetime-local" value={form.expiredAt} onChange={(e) => setForm({ ...form, expiredAt: e.target.value ? new Date(e.target.value).toISOString() : '' })} required />
        <button type="submit" disabled={saving} className="w-full py-3 rounded-xl font-bold" style={{ background: 'var(--amber)', color: '#07070A', fontFamily: 'var(--font-mono)', fontSize: 12, textTransform: 'uppercase' }}>
          {saving ? 'Menyimpan...' : 'Buat Voucher'}
        </button>
        {msg && <p style={{ fontSize: 13, color: msg.includes('✓') ? 'var(--amber)' : '#f87171' }}>{msg}</p>}
      </form>

      <div className="space-y-2">
        {vouchers.length === 0 && <p style={{ color: 'var(--muted)' }}>Belum ada voucher.</p>}
        {vouchers.map((v) => (
          <div key={v.id} className="rounded-xl p-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
            <div className="flex items-center justify-between">
              <span className="font-bold" style={{ fontFamily: 'var(--font-mono)', color: 'var(--amber)' }}>{v.code}</span>
              <span style={{ fontSize: 13 }}>{v.discountType === 'percentage' ? `${v.value}%` : `Rp${v.value.toLocaleString('id-ID')}`}</span>
            </div>
            <p style={{ fontSize: 12, color: 'var(--muted)', marginTop: 4 }}>{v.name} · kuota {v.totalCoupons} · s/d {new Date(v.expiredAt).toLocaleDateString('id-ID')}</p>
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Smoke test (Chrome DevTools)**

Set env dev `MAYAR_API_KEY` (sandbox dari web.mayar.club/api-keys) + `MAYAR_API_BASE=https://api.mayar.club/hl/v1`. Login admin (dev-login) → buka `/admin/vouchers` → isi form → submit → cek voucher muncul di list + tidak ada error console. Bila API key belum ada, verifikasi UI render & validasi error "Gagal di Mayar" muncul.

- [ ] **Step 4: Commit**

```bash
git add app/admin/vouchers/page.js app/admin/vouchers/VoucherManager.js
git commit -m "feat: UI admin voucher (form buat + daftar)"
```

---

### Task 10: Env, smoke menyeluruh, docs

**Files:**
- Modify: `.env.local` (dev), env Coolify (prod — manual user)
- Modify: `.claude/docs-library/product-spec.md`

- [ ] **Step 1: Env dev** (`.env.local`)

```
MAYAR_API_KEY=<sandbox-key>
MAYAR_API_BASE=https://api.mayar.club/hl/v1
```
(Prod: `MAYAR_API_KEY` production + `MAYAR_API_BASE=https://api.mayar.id/hl/v1` di Coolify.)

- [ ] **Step 2: Smoke menyeluruh (Chrome DevTools)**

1. Admin login → semua menu admin terbuka, brand konsisten.
2. Dashboard angka benar (aktif/expired/total/modul/pembelian/voucher).
3. User: search jalan; +1 thn / cabut / toggle admin → status berubah & persist.
4. Modul: tambah & hapus jalan.
5. Voucher: buat → muncul; (dengan API key sandbox) terbuat di Mayar.
6. Non-admin tidak bisa akses `/admin/*` (redirect).
7. Console bersih.

- [ ] **Step 3: Update product-spec**

Tambah bagian admin panel + voucher (Mayar coupon API, cermin lokal) ke `product-spec.md`.

- [ ] **Step 4: Commit**

```bash
git add .claude/docs-library/product-spec.md
git commit -m "docs: admin panel + voucher di product-spec"
```

---

## Catatan penting

- **Voucher = checkout discount Mayar.** Kupon dibuat via API Mayar supaya berlaku saat buyer bayar. Tabel `Voucher` lokal hanya cermin untuk daftar/UI — Mayar sumber kebenaran penukaran.
- **Nonaktifkan voucher belum didukung API** (endpoint index Mayar: create/detail/validate saja). Untuk v1, nonaktif dilakukan di dashboard Mayar. Bisa ditambah bila Mayar sediakan endpoint.
- **Webhook nominal:** karena diskon → bayar kurang, gerbang webhook bertumpu pada `productId` (sudah dikoreksi di branch membership), bukan nominal. Pastikan `MAYAR_PRODUCT_ID`/`MAYAR_PRODUCT_NAME` terisi.
- **Schema prod:** `prisma db push` manual + backup saat deploy (model `Voucher` baru) — sesuai aturan, tidak otomatis.
- **Keamanan:** semua route `/api/admin/*` wajib `requireAdmin()`. `MAYAR_API_KEY` hanya server-side, jangan `NEXT_PUBLIC_`.
```
