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
