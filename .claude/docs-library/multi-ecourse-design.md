# Desain — Platform Multi-Ecourse (pivot dari single-membership)

Tanggal: 2026-06-22
Status: disetujui (brainstorming), siap masuk rencana implementasi.

> Pivot besar: dari **1 langganan tahunan buka semua modul** → **toko kursus** (banyak ecourse, harga sendiri-sendiri, beli sekali akses selamanya). Dokumen ini jadi acuan implementasi; `product-spec.md` diupdate setelah implementasi disepakati.

---

## 1. Konsep inti

- Banyak kursus dijual terpisah, tiap kursus punya harga sendiri.
- **Akses seumur hidup** — beli sekali, punya selamanya. Tidak ada perpanjangan, tidak ada kedaluwarsa, tidak ada reminder.
- **Etalase publik** — pengunjung bisa lihat semua kursus + harga TANPA login (penting untuk SEO, share link, konversi).
- **Login wajib hanya untuk masuk ke isi kursus** yang sudah dimiliki.
- **Fresh start** — belum ada member, tidak ada migrasi data. Boleh re-seed bersih.

## 2. Kursus pertama

- **Judul:** "Vibe Coding Google Apps Script: Dari Nol Bikin Aplikasi Sampai Menghasilkan"
- **Harga:** Rp500.000 (akses selamanya)
- **Isi:** modul lama **1 → 20.5** (fondasi vibe coding + praktek Google Apps Script + monetisasi)
- **Dibuang:** modul 21, 22, 23 (Web App, Desktop, APK Android — yang masih `soon`)

## 3. Halaman (routes)

| Route | Akses | Keterangan |
|---|---|---|
| `/` | publik | Etalase — **Hero unggulan + Grid** kursus |
| `/kursus/[slug]` | publik | Halaman jualan per kursus (preview kurikulum + tombol beli ke Mayar) |
| `/login` | publik | Magic link (sudah ada) |
| `/dashboard` | login | **Kelasku** (kursus dimiliki + progress) **+ Jelajahi** (kursus lain, upsell) |
| `/belajar/[courseSlug]` | login + punya kursus | Flowchart belajar (yang sekarang ada di `/dashboard`, dipindah jadi per-kursus) |
| `/modul/[slug]` | login + punya kursus | Viewer modul (gerbang dari "membership aktif?" → "punya kursus ini?") |
| `/sukses` | publik | Pasca-bayar (sudah ada) |
| `/perpanjang` | — | **DIHAPUS** — tidak ada perpanjangan lagi. Akses tidak dimiliki → arahkan ke `/kursus/[slug]` |

**Layout terpilih (mockup):** Beranda = **Hero + Grid (A)**; Dashboard = **Kelasku + Jelajahi (B)**.

## 4. Database

### Model baru: `Course`
```
Course {
  id           String   @id @default(uuid())
  title        String
  slug         String   @unique
  description  String?
  price        Int
  mayarProductId String?  // untuk mapping webhook
  coverImage   String?
  isPublished  Boolean  @default(false)
  orderIndex   Int      @default(0)
  createdAt    DateTime @default(now())
  modules      Module[]
}
```

### `Module` — tambah relasi ke kursus
- Tambah `courseId String` + relasi `course Course`.
- `parentIds` / `orderIndex` / tipe konten (`youtubeUrl`, `gammaUrl`, `promptText`, `htmlContent`) tetap. DAG sekarang per-kursus.

### Kepemilikan — pakai `Purchase` (tabel sudah ada)
- Tambah `courseId String` ke `Purchase`.
- **Punya kursus = ada baris Purchase `(userId, courseId)`.** Selamanya, tanpa tanggal kedaluwarsa.
- Cek akses: `Purchase.findFirst({ where: { userId, courseId } })` → boleh akses. Admin selalu bypass.
- Admin beri akses gratis = buat baris Purchase `source: "admin"`.

### `User` — buang yang tak relevan
- Hapus `membershipExpiredAt`, `reminderSentAt`.
- Hapus cron `/api/cron/check-membership` + reminder email (Resend tetap dipakai untuk magic link).

## 5. Alur pembayaran (Mayar)

```
Beli kursus di Mayar (harga per kursus)
        ↓
Gateway (CF Worker) → webhook /api/webhook/mayar
        ↓
data.productId → cari Course (Course.mayarProductId) → fail-closed kalau tak dikenal
        ↓
user upsert → buat Purchase(userId, courseId) [kepemilikan selamanya]
        ↓
User /login → magic link → /dashboard → Kelasku → /belajar/[course]
```

- **Ganti** gerbang env tunggal `MAYAR_PRODUCT_ID` → **lookup database** by `mayarProductId`. Tambah kursus baru = isi product ID di admin, **nol perubahan kode**.
- Token webhook statis (`MAYAR_WEBHOOK_TOKEN`) tetap.
- Voucher Mayar (kupon) tetap berfungsi — webhook bertumpu `productId`, bukan nominal.

## 6. Admin panel

- **BARU `/admin/courses`** — CRUD kursus (judul, slug, harga, `mayarProductId`, deskripsi, cover, publish, urutan).
- `/admin/modules` — tambah **pemilih kursus** untuk tiap modul; semua field lama tetap.
- `/admin/users` — ganti "set/perpanjang/cabut membership" → **beri/cabut akses kursus** (kelola baris Purchase per kursus).
- `/admin/purchases` — tetap; tampilkan kursus yang dibeli.
- `/admin/vouchers` — tetap (kupon Mayar).

## 7. Yang dihapus / disederhanakan (fresh start)

- Modul 21, 22, 23.
- Mekanisme membership: `membershipExpiredAt`, `reminderSentAt`, cron check-membership, reminder email H-3, halaman `/perpanjang`, env `MAYAR_PRODUCT_ID`/`MAYAR_PRODUCT_NAME`/`MAYAR_MIN_AMOUNT` (digantikan lookup DB).
- Schema di-reset bersih (boleh `prisma db push` karena belum ada data prod nyata).

## 8. Keputusan penting (delta dari product-spec lama)

| Keputusan | Alasan |
|---|---|
| Multi-kursus (sebelumnya out-of-scope) | Arah produk baru: jual banyak ecourse di satu website |
| Akses seumur hidup per kursus (bukan langganan tahunan) | "Beli sekali punya selamanya" lebih gampang dijual + kode lebih simpel (tanpa cron/reminder) |
| Etalase publik, login hanya untuk belajar | SEO + konversi; orang lihat harga sebelum beli |
| `Purchase` jadi sumber kepemilikan (bukan tabel Enrollment baru) | Untuk akses selamanya, "pernah beli" = "boleh akses"; reuse alur webhook |
| Webhook mapping via DB lookup (bukan env per produk) | Skalabel — tambah kursus tanpa ubah kode |

## 9. Out of scope (belum dikerjakan)

- Bundle "beli semua kursus sekaligus" (bisa ditambah nanti).
- Voucher per-kursus spesifik (sekarang kupon Mayar global).
- Migrasi member lama (tidak ada member).
- CMS penuh untuk konten modul (tetap seed + admin terbatas seperti sekarang).
