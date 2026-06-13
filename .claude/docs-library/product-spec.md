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
- Session JWT 1 tahun, cookie httpOnly — persist sampai logout manual

### Konten — flowchart modul
- Modul tersusun sebagai DAG (Directed Acyclic Graph) — bukan tree linear
- Satu modul bisa punya banyak parent (multiple prerequisite); `parentIds` adalah `String[]`
- Struktur kurikulum: **trunk lurus** (modul persiapan berurutan) lalu **pecah jadi beberapa jalur praktek** (GAS, Web App, Desktop, Android) yang masing-masing punya rantai sub-modul sendiri ke bawah
- Dua pola percabangan dibedakan otomatis oleh `lib/module-tree.js` (`buildSegments`):
  - **diamond** — pecah lalu menyatu lagi (mis. modul A → {B, C} → D)
  - **tracks** — pecah jadi jalur sendiri-sendiri, tidak menyatu (mis. card 12 → 4 jalur praktek)
- Modul berisi salah satu / kombinasi: YouTube embed (video) + Google Drive PDF embed (materi) — Gamma.app TIDAK digunakan (X-Frame-Options: SAMEORIGIN memblokir embedding)
- **Kepala jalur** (mis. "Praktek GAS") boleh tanpa konten langsung — kontennya ada di sub-modul (13.1, 13.2, dst). Penomoran sub-modul bertingkat otomatis dari posisinya di jalur
- **Dua mode tampilan flowchart**, toggle di dashboard (default Ringkas):
  - **Ringkas** — kotak kecil, seluruh kurikulum muat di layar
  - **Kartu** — kartu besar dengan thumbnail
  - Desktop: jalur praktek melebar (fan-out); mobile: scroll samping + judul terpotong auto-scroll
- Progress tracking manual: user klik "Tandai Selesai", tidak otomatis saat buka modul
- Progress user dilacak per modul
- Konten dikelola via `lib/modules-seed.js` + `npm run seed` — bukan CMS. **Seed aman**: default upsert (tidak hapus progress user); reset total dev pakai `SEED_RESET=true`. Saat deploy ke prod, seed jalan otomatis (langkah di `.github/workflows/deploy.yml`) → prod selalu sinkron dengan dev

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
