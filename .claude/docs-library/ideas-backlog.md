# Ideas Backlog

Tampungan ide baru DAN keputusan yang dibatalkan.
Format: tanggal — judul — konteks 1-2 kalimat — status (nanti/simpan/BATAL + alasan)

Ide disetujui dikerjakan → pindah ke product-spec.md
Keputusan dibatalkan → hapus dari product-spec.md, catat di sini dengan status BATAL

---

## Upgrade pipeline deploy (parkir — nanti)

- **2026-06-17 — Migrasi ke Coolify native auto-deploy** — App sekarang docker-compose buatan tangan (`deploy-aiguild.sh`) yang dipicu GitHub Actions SSH; Coolify cuma proxy/jaringan. Upgrade: jadikan app "Coolify application" beneran → push = Coolify build & deploy sendiri tanpa SSH (anti-timeout). Perlu bikin ulang app di dashboard Coolify (env, domain, jaringan) + pindah `seed` ke post-deploy command. Risiko downtime → eksekusi saat santai. **status: nanti** (user pilih tetap pakai Actions SSH + retry untuk sekarang)
- **2026-06-17 — Gate test/build sebelum deploy** — `deploy.yml` belum jalankan `npm run test`/`build` sebelum deploy; commit rusak bisa langsung ke prod. Tambah job CI yang wajib lulus dulu. **status: nanti**
- **2026-06-17 — Ganti `prisma db push` → `migrate deploy` di prod** — Prod sudah ada user; `db push` melanggar prinsip "migrate setelah prod berdata". Beralih ke migrasi versioned (perlu baseline saat prod sudah berdata + backup). **status: nanti**

---

## Model langganan — paket bulanan (nanti)

- **2026-06-19 — Buat PRODUK BARU "AI Guild Bulanan" (nanti)** — Sekarang fokus **tahunan** (Rp1.497.000 / 365 hari). Nanti kalau kelas sepi, buat **produk Mayar terpisah** "AI Guild Bulanan" (link produk sendiri, mis. `ai-guild-bulanan`) — keputusan user 2026-06-19: produk baru, BUKAN tier di produk yang sama. **Konsekuensi kode kecil:** karena produk terpisah, link berbeda → webhook gampang bedakan (tinggal kenali link produk baru → durasi 30 hari via `computeNewExpiry(currentExpiry, now, 30)`). Tidak perlu baca tier/`amount`. **status: nanti (saat kelas sepi)**

## Admin panel — edit garis flowchart (`parentIds`)

- **2026-06-25 — Tambah kolom edit `parentIds` di `/admin/modules`** — Saat ini admin panel bisa hapus/edit/geser kartu, TAPI tidak bisa mengubah `parentIds` (garis koneksi flowchart). Akibatnya: hapus kartu di tengah rantai lewat admin = anak jadi yatim, dan sambung-ulang HARUS lewat kode/seed. Idenya: kasih UI pilih parent (multi-select slug) di form modul → admin bisa sambung/putus garis sendiri tanpa developer. **Catatan:** sejak fitur auto-renumber (sesi ini), hapus kartu via admin TIDAK lagi merusak NOMOR (otomatis rapat) — tapi garis flowchart masih bisa putus. Fitur ini melengkapi celah terakhir itu. **status: simpan** (user belum putuskan eksekusi)

## Fase 2 Telegram — gate grup VIP (arah disetujui, eksekusi nanti)

- **2026-06-19 — Akses grup Telegram lewat "Join Request" + bot (Cara 1), BUKAN email** — Invite via email murni buntu: Telegram pakai chat ID (angka), tidak terhubung ke email, jadi tak bisa cek status/lama membership maupun auto-kick. Keputusan: pakai bot + gate "Join Request". **Dipecah 2 bagian biar tidak berat:** **(A) Catat Telegram ID + invite sekali-pakai + auto-approve join request** = dibangun lebih dulu (murah, mencegah utang migrasi member lama jadi "hantu"). **(B) Auto-kick saat expired via cron** = ditunda, kick manual dulu (volume kecil karena periode langganan panjang). Bot `aiguild_admin_bot` sudah admin di grup VIP. Detail rencana di `membership-fase1-design.md` → section "Fase 2 — Akses grup Telegram". **status: arah disetujui (Cara 1), eksekusi setelah Fase 1 live**
