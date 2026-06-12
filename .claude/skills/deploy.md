# Skill: deploy

## Platform
**VPS Hostinger** (Ubuntu 24.04, IP: `187.77.122.42`) via **Coolify** (Docker-based)

## Auto-deploy (cara normal)
Push ke branch `master` → GitHub Actions otomatis SSH ke VPS dan jalankan `/data/deploy-aiguild.sh`

```
git push origin master   ← ini trigger deploy otomatis
```

Cek status di: `github.com/arulbarker/aiguild/actions`

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
