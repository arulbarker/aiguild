# Desain Fase 1 — Membership Berbasis Waktu

**Tanggal:** 2026-06-15
**Status:** Disetujui (menunggu review spec) → lanjut ke implementation plan
**Fase:** 1 dari 3 (lihat "Di luar lingkup" untuk Fase 2 & 3)

---

## Tujuan

Ubah AI Guild dari model "beli sekali, akses selamanya" jadi **langganan tahunan Rp1.497.000** via Mayar. User yang langganannya mau habis dapat **email reminder + tombol perpanjang**. Yang tidak perpanjang → akses materi dicabut otomatis.

## Keputusan terkunci

| Topik | Keputusan |
|---|---|
| Peran Mayar | **Pembayaran saja** — bukan portal belajar |
| Portal belajar | Tetap web app AI Guild (flowchart, branding, kontrol penuh) |
| Keamanan video | YouTube unlisted di-embed di balik login (Fase 3 nanti: Cloudflare Stream) |
| Model langganan | **Manual + reminder** (H-3 email + tombol perpanjang), bukan auto-charge |
| Webhook | Lewat `mayar-webhook-gateway` yang sudah ada (additive, aman untuk ruangsaku) |
| Harga | Rp1.497.000 / 365 hari (tahunan) |
| Produk Mayar | `ai-guild` (sudah dibuat manual di dashboard) |

## URL Mayar (asli)

- **Link bayar/perpanjang (dipakai sistem):** `https://aiadalahbudak.myr.id/m/ai-guild`
- Halaman jualan (marketing): `https://aiadalahbudak.myr.id/membership/ai-guild`
- Disimpan sebagai env var `MAYAR_PAYMENT_URL` (jangan hardcode di kode).

---

## Arsitektur komponen

```
User bayar di Mayar (/m/ai-guild)
   │
   ▼ webhook (1 URL)
mayar-webhook-gateway (Cloudflare Worker)
   │  fan-out + teruskan header signature
   ├──────────────► app.ruangsaku.com (tidak tersentuh)
   └──────────────► aiguild.online/api/webhook/mayar
                         │  verifikasi signature → FILTER produk ai-guild
                         ▼
                    PostgreSQL: set/perpanjang membershipExpiredAt +365 hari
                         │
   ┌─────────────────────┴─────────────────────┐
   ▼                                            ▼
Penjagaan akses (server layout)        Cron harian (/api/cron/check-membership)
- expired → redirect /perpanjang       - H-3 belum direminder → email Resend + tombol perpanjang
```

## Perubahan data model (Prisma)

Tambah 2 field ke model `User` yang sudah ada (bukan tabel baru — YAGNI, hanya 1 jenis membership):

| Field | Tipe | Guna |
|---|---|---|
| `membershipExpiredAt` | `DateTime?` | Tanggal langganan habis |
| `reminderSentAt` | `DateTime?` | Tandai sudah dikirim reminder H-3 (anti-spam), direset saat perpanjang |

**Status aktif/expired TIDAK disimpan** — dihitung dari `membershipExpiredAt > now()`. Field turunan = hitung saat dibaca (cegah bug sinkronisasi).

Field Telegram (`kodeUnik`, `telegramId`) **ditunda ke Fase 2**.

Migrasi: `npx prisma migrate dev --name add_membership_fields` (test di dev → deploy ke prod dengan perintah eksplisit).

## Alur webhook

### Gateway (Cloudflare Worker — `mayar-webhook-gateway`)
Perubahan **additive** (aman untuk ruangsaku):
1. Tambah `'https://aiguild.online/api/webhook/mayar'` ke array `TARGETS`.
2. Teruskan header `x-mayar-signature` saat fan-out (sekarang hanya kirim `Content-Type` → signature hilang).

> Kode worker ditulis Claude, **deploy dilakukan user** (MCP Cloudflare read-only untuk Workers). Deploy via wrangler atau dashboard Cloudflare.

### Webhook app (`app/api/webhook/mayar/route.js`)
Sudah ada: verifikasi HMAC signature + idempotency by `orderId`. **Ditambah:**
1. **Filter produk (KRITIS):** hanya proses event produk `ai-guild`. Tanpa ini, pembeli ruangsaku dapat akses AI Guild gratis (gateway menyebar semua event ke semua app).
2. **Logika perpanjang:**
   - Kalau `membershipExpiredAt` masih di masa depan → tambah 365 hari ke tanggal itu (numpuk, adil).
   - Kalau sudah habis / belum ada → `now() + 365 hari`.
   - Reset `reminderSentAt = null`.

## Penjagaan akses

Dashboard adalah client component yang ambil data dari `/api/modules`. Middleware (edge) tidak bisa query DB. Jadi cek expiry ditaruh di **dua titik server-side** yang menyajikan materi:
- **`/api/modules` (GET):** kalau membership tidak aktif → balas `403 { error: 'membership_expired' }`. Dashboard client tangkap 403 → `router.push('/perpanjang')`.
- **`/modul/[slug]/page.js` (server component):** kalau tidak aktif → `redirect('/perpanjang')`.
- User expired **tetap bisa login** (supaya bisa lihat halaman perpanjang); yang dicabut hanya akses materi.

## Reminder email + cron

- **Endpoint cron:** `POST /api/cron/check-membership`, dijaga `CRON_SECRET` (header/query).
- **Pemicu:** cron harian di VPS/Coolify (scheduled job).
- **Logika:** cari user dengan `membershipExpiredAt` = 3 hari lagi DAN `reminderSentAt` null → kirim email via Resend (pakai setup email magic link yang sudah ada) berisi tombol perpanjang (`MAYAR_PAYMENT_URL`) → set `reminderSentAt = now()`.

## Halaman perpanjang + pasca-bayar

- **`/perpanjang`:** tampilkan status langganan + tombol bayar (`MAYAR_PAYMENT_URL`).
- **Pasca-bayar:** Mayar redirect ke halaman sukses AI Guild → "Pembayaran berhasil! Cek email untuk link masuk." (magic link login sudah ada). Redirect URL diisi user di dashboard Mayar.

## Langkah manual user (di luar kode)

1. ✅ Produk `ai-guild` (Rp1.497.000/tahun) sudah dibuat di dashboard Mayar.
2. Daftarkan webhook Mayar ke URL gateway (jika belum): `https://mayar-webhook-gateway.mursalinasrul.workers.dev/`.
3. Set redirect URL produk ke halaman sukses AI Guild.
4. Deploy ulang `mayar-webhook-gateway` setelah Claude update kodenya.
5. Isi env var prod di Coolify: `MAYAR_PAYMENT_URL`, `CRON_SECRET` (`MAYAR_WEBHOOK_SECRET` sudah ada).

## Keamanan

- Signature Mayar diverifikasi end-to-end (gateway teruskan header, app verifikasi HMAC).
- Filter produk cegah akses lintas-produk.
- `CRON_SECRET` lindungi endpoint cron dari pemicu publik.
- Semua rahasia di env Coolify, bukan di kode.
- API key Mayar yang dipakai untuk verifikasi desain ini **read-only & sudah terekspos di chat → user disarankan regenerate**.

## Known-unknowns (dikonfirmasi saat implementasi)

1. **Field produk di payload webhook Mayar** — untuk filter produk. Kemungkinan `data.productId` / `data.product.link` / `data.product.name`. Konfirmasi via test webhook atau dokumentasi Mayar.
2. **Apakah Mayar mengizinkan >1 webhook URL** — kalau ya, AI Guild bisa punya URL sendiri (tanpa gateway). Default: pakai gateway (Mayar diasumsikan 1 URL).
3. Bentuk redirect & field email di payload `payment.paid` — verifikasi dari payload asli.

## Di luar lingkup (fase berikutnya)

- **Fase 2 — Akses grup Telegram (gate "Join Request", Cara 1):** rencana lengkap di section bawah.
- **Fase 3 — Keamanan video:** migrasi dari YouTube embed ke Cloudflare Stream (signed URL) saat sudah scale.

---

## Fase 2 — Akses grup Telegram (Cara 1: Join Request)

> Status: arah disetujui 2026-06-19 (Cara 1). Eksekusi setelah Fase 1 live. Ringkasan keputusan ada di `ideas-backlog.md`.

### Keputusan inti
- **Bukan email murni.** Email tidak terhubung ke Telegram (Telegram pakai chat ID berupa angka). Tanpa bot, mustahil cek status membership atau auto-kick. Bot wajib.
- **Cara 1 (Join Request) dipilih, bukan Cara 2 (mute/captcha).** Grup di-set "butuh persetujuan admin untuk masuk". Yang tidak berhak tidak pernah masuk grup — lebih bersih daripada masuk dulu lalu dibungkam.
- **Dipecah 2 bagian** supaya tidak berat dan tidak menabung utang migrasi:
  - **Bagian A (bangun lebih dulu):** catat Telegram ID + invite sekali-pakai + auto-approve join request. Murah, sekali setup. Wajib dari awal agar member tidak jadi "hantu" (tak terlacak) saat grup membesar.
  - **Bagian B (tunda):** auto-kick saat expired via cron. Paling ribet & rawan salah-kick. Awalnya kick manual via halaman admin (volume kecil karena periode langganan panjang).

### Alur user (Bagian A)
```
1. User beli & login → dashboard kasih KODE UNIK (mis. AIG-7K2M) + tombol "Gabung Grup Telegram"
2. User buka bot @aiguild_admin_bot → kirim kode
3. Bot cocokkan kode ↔ akun user → simpan telegramId, tandai terverifikasi
4. Bot balas link grup (atau langsung set siap auto-approve)
5. User klik link → "Minta Bergabung" (grup mode Join Request)
6. Bot terima event chat_join_request → cek DB: terverifikasi & membership aktif?
   → ya: approve   → tidak: tolak/diamkan
```

### Syarat teknis
- Bot jadi **admin grup** dengan hak "Tambah/Batasi Anggota" — bot `aiguild_admin_bot` sudah admin di grup VIP.
- Grup VIP di-set **"Approve new members"** (Join Request).
- Bot perlu endpoint webhook Telegram (atau long-polling) untuk terima `/start`, pesan kode, dan `chat_join_request`.
- Token bot di env (`TELEGRAM_BOT_TOKEN`) — **bukan bot notif admin yang sama bila chat-nya beda**; pastikan tidak bentrok dengan `lib/telegram.js` (notif modul).

### Field DB (ditunda dari Fase 1, masuk di Fase 2)
- `User.telegramId` (String?, unik) — chat ID Telegram user.
- `User.telegramKode` (String?, unik) — kode unik penghubung sekali-pakai.
- Status verifikasi turunan: `telegramId != null`.

### Langkah implementasi (tingkat tinggi — detail TDD dibuat saat eksekusi)
1. Tambah field `telegramId` + `telegramKode` ke schema (additive, nullable → aman).
2. Generate kode unik saat user pertama buka tab "Grup Telegram" di dashboard + tampilkan tombol.
3. Endpoint bot Telegram: handle `/start`, terima kode → simpan `telegramId`.
4. Handle `chat_join_request` → cek verifikasi + `isMembershipActive` → approve/decline.
5. Set grup VIP ke mode Join Request (manual oleh user di Telegram).
6. (Bagian B, nanti) Halaman admin "member expired" → tombol kick manual; lalu cron auto-kick.

### Catatan
- Periode langganan: **tahunan (+365 hari, Rp1.497.000)** sesuai Fase 1. Expired jarang (setahun sekali) → makin kuat alasan tunda Bagian B (kick manual cukup). Bila nanti ditambah produk bulanan terpisah (lihat `ideas-backlog.md`), logika kick tidak berubah.
