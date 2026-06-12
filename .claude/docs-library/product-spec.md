# Product Spec — AI Guild

Dokumen hidup. Update hanya saat ada keputusan baru yang disetujui.
Sumber kebenaran produk ini.

---

## Produk ini apa

Platform pembelajaran vibe coding berbayar. Target: non-IT yang ingin bangun produk digital dengan bantuan AI. User beli akses sekali (lifetime) via Lynk.id atau Mayar.id, lalu belajar via email magic link.

---

## Fitur inti (sudah diputuskan)

### Autentikasi
- Magic link via email — tidak ada password
- User dibuat otomatis saat pembelian berhasil (via webhook)
- Session JWT 30 hari, cookie httpOnly

### Konten — flowchart modul
- Modul tersusun sebagai DAG (Directed Acyclic Graph) — bukan tree linear
- Satu modul bisa punya banyak parent (multiple prerequisite)
- Setiap modul berisi: YouTube embed (video) + Gamma.app embed (materi slide)
- Progress user dilacak per modul (last_viewed_at)
- Konten dikelola via `lib/modules-seed.js` + `npm run seed` — bukan CMS

### Pembayaran & akses
- Lynk.id dan Mayar.id → webhook masuk → user dibuat → purchase dicatat
- Tidak ada trial, tidak ada level berbeda — beli = akses semua modul
- Refund dikelola manual oleh admin

### Admin panel
- `/admin/users` — lihat daftar user, revoke akses
- `/admin/modules` — lihat daftar modul (read-only di UI)
- `/admin/purchases` — riwayat pembelian dari kedua platform

---

## Alur user utama

```
Beli di Lynk.id / Mayar.id
        ↓
Webhook masuk → user + purchase disimpan
        ↓
User buka /login → input email → klik magic link (email)
        ↓  (dev: auto-redirect tanpa email)
Session dibuat → redirect ke /dashboard
        ↓
Flowchart modul → klik modul → viewer full-screen
(YouTube tab | Materi tab)
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

---

## Out of scope (yang tidak dikerjakan)

- CMS untuk edit konten modul
- Sistem refund otomatis
- Multi-kelas
- Notifikasi WhatsApp (bisa ditambah nanti via Fonnte)
- Forum / komunitas di dalam platform
