# AI Guild — Platform Pembelajaran Vibe Coding

Platform berbayar untuk belajar membangun produk digital dengan AI. Modul flowchart interaktif, video + materi dalam satu layar, akses via email magic link.

## Stack

- **Next.js 14** App Router (JavaScript) + Tailwind CSS
- **PostgreSQL** + Prisma 7 + `@prisma/adapter-pg`
- **Auth:** Magic link (jose JWT + Resend)
- **Deploy:** VPS Hostinger (Coolify + Docker) + GitHub Actions

## Local Development

**Syarat:** SSH key ke VPS tersimpan di `~/.ssh/aiguild_vps`

```bash
npm install
npm run dev       # otomatis buka SSH tunnel ke DB + Next.js dev server
```

Buka `http://localhost:3001` (atau 3000 jika port bebas).

Login dengan email yang sudah ada di database. Di dev mode, magic link dikembalikan langsung — tidak perlu buka email.

### Seed database

```bash
# Set ADMIN_EMAIL di .env.local terlebih dahulu
npm run seed
```

## Environment Variables

Salin `.env.example` ke `.env.local` dan isi nilainya:

```
DATABASE_URL=postgresql://aiguild:...@localhost:5433/aiguild
JWT_SECRET=
TOKEN_SECRET=
NEXT_PUBLIC_APP_URL=http://localhost:3001
ADMIN_EMAIL=
RESEND_API_KEY=
LYNKID_WEBHOOK_SECRET=
MAYAR_WEBHOOK_SECRET=
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=
SENTRY_DSN=
```

## Deploy

Push ke `master` → GitHub Actions auto-deploy ke VPS. Detail di `.claude/skills/deploy.md`.

## Lisensi

Hak cipta © 2026 Arul. Seluruh hak dilindungi.
