# Skill: deploy

## Platform
**VPS Hostinger** (Ubuntu 24.04, IP: `187.77.122.42`) via **Coolify** (Docker-based)

## Auto-deploy (cara normal)
Push ke branch `master` → GitHub Actions otomatis SSH ke VPS dan jalankan `/data/deploy-aiguild.sh` + `db push` + `seed`.

```
git push origin master   ← ini trigger deploy otomatis
```

Cek status di: `github.com/arulbarker/aiguild/actions`

**Auto-retry SSH (sejak 2026-06-17):** `deploy.yml` punya 2 percobaan — kalau attempt 1 gagal (mis. `dial tcp :22 i/o timeout` sesaat) → tunggu 20s → retry sekali. Script idempoten (env upsert pakai sed, seed mode aman) jadi re-run penuh aman. Kalau VPS tak terjangkau berkepanjangan (kedua attempt timeout), deploy gagal — TAPI tidak merusak prod (situs tetap jalan versi lama). Tinggal re-run saat koneksi pulih.

**Catatan arsitektur (penting):** app ini **docker-compose buatan tangan** (lihat `docker-compose.prod.yml`), BUKAN "Coolify application". Coolify = proxy Traefik + jaringan + penyimpan env saja, BUKAN auto-pull dari GitHub. Pemicu deploy = GitHub Actions SSH. Rencana upgrade ke Coolify native auto-deploy ada di `docs-library/ideas-backlog.md`.

## Manual deploy (kalau GitHub Actions gagal)
```bash
ssh -i ~/.ssh/aiguild_vps root@187.77.122.42
bash /data/deploy-aiguild.sh
```

## Environment variables production
Disimpan di Coolify dashboard — JANGAN hardcode di kode.
Pastikan semua var ini ada sebelum deploy:
```
DATABASE_URL
JWT_SECRET
TOKEN_SECRET
NEXT_PUBLIC_APP_URL
RESEND_API_KEY
LYNKID_WEBHOOK_SECRET
MAYAR_WEBHOOK_SECRET
NEXT_PUBLIC_POSTHOG_KEY
NEXT_PUBLIC_POSTHOG_HOST
SENTRY_DSN
```

## Checklist sebelum deploy ke production
- [ ] Semua test lulus: `npm run test`
- [ ] Smoke test lokal lulus
- [ ] Tidak ada console.error baru
- [ ] `/security-review` lulus (wajib kalau menyentuh auth/webhook/API baru)
- [ ] Environment variables production sudah diupdate kalau ada yang baru
- [ ] Branch sudah di-merge ke `master` via PR

## Docker & build notes
- `next.config.mjs` pakai `output: 'standalone'`
- Dockerfile: multi-stage (deps → build-deps → builder → runner) — build-deps pakai `npm ci` (semua deps termasuk tailwindcss), runner pakai `npm ci --omit=dev`
- `public/` folder harus ada (dibuat dengan `RUN mkdir -p public` di Dockerfile)
- Deploy pakai `docker-compose.prod.yml` — JANGAN pakai `docker run` langsung (backtick di Traefik label akan rusak di bash)
- Container WAJIB punya label `traefik.docker.network=coolify` jika terhubung ke lebih dari 1 Docker network (aiguild-net + coolify)

## Rollback
```bash
ssh -i ~/.ssh/aiguild_vps root@187.77.122.42
# Lihat image lama
docker images aiguild-app
# Revert ke commit sebelumnya di GitHub lalu push — auto-deploy akan jalan
git revert HEAD
git push origin master
```

## Cek log container di VPS
```bash
ssh -i ~/.ssh/aiguild_vps root@187.77.122.42
docker logs aiguild-app --tail 50
docker logs aiguild-app -f   # follow realtime
```

## Troubleshooting: situs tampak DOWN tapi server sehat (gejala palsu)
**Kejadian 2026-06-18:** `aiguild.online` & SSH `ERR_CONNECTION_TIMED_OUT` dari PC rumah, padahal VPS sehat total (Docker jalan, `curl localhost` balas, outbound OK, UFW/iptables kosong). Ternyata **IP publik rumah (Indihome) diblokir sementara di edge network Hostinger** — terpicu oleh ping + SSH retry beruntun saat diagnosa (Hostinger anggap mencurigakan, auto-block per-IP).

**Cara kenali (bukan server yang down):**
1. Buka situs dari **HP pakai data kartu** → kalau BISA, server aman, yang keblokir IP rumahmu.
2. `tracert -d 187.77.122.42` dari PC → paket sampai edge Hostinger (`153.92.x` / `172.17.x`) lalu putus = bukan masalah rute internasional, tapi blokir di gerbang Hostinger.
3. `ping`/`ssh` ke IP langsung (bukan domain) juga timeout → buktinya **bukan DNS/domain**.

**Penting — yang BUKAN penyebab (jangan buang waktu ke sini):**
- Bukan DNS/nameserver. Nameserver Hostinger memang `*.dns-parking.com` (normal — domain lain yang sehat juga pakai itu). Jangan ganti nameserver.
- Bukan Docker/Coolify/aplikasi. Bukan folder lokal yang dipindah.
- Bukan UFW/iptables/fail2ban (semua kosong di VPS ini).

**Fix (urut tercepat):**
1. **Restart router Indihome** (cabut listrik 1 menit) → dapat IP publik baru → lolos blokir. **TERBUKTI BERHASIL** (IP `182.10.97.111` → `182.10.100.255`, langsung tembus).
2. Sementara nunggu: pakai **hotspot HP** untuk kerja/SSH.
3. Tunggu beberapa jam — blokir auto-expire.
4. Kalau besok masih: chat Hostinger, minta unblock IP rumah (sebutkan IP publik kamu, cek via `curl -4 https://ifconfig.me`).

**Pencegahan:** jangan spam ping/SSH cepat-cepat ke VPS saat diagnosa — itu sendiri yang memicu blokir. Satu-dua tes cukup.
