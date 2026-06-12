# Skill: new-feature

## Checklist setiap kali membuat fitur baru

### Sebelum mulai
- [ ] Buat branch baru dengan format yang benar:
  ```bash
  git checkout -b feat/nama-fitur
  ```
- [ ] Baca `rules.md` — ada aturan yang relevan dengan fitur ini?
- [ ] Fitur menyentuh schema database? → tanya user dulu sebelum lanjut

### Saat coding
- [ ] Tambah modul baru? → edit `lib/modules-seed.js` + jalankan `npm run seed`
- [ ] Buat API route baru? → pastikan ada auth check (`getSession()`)
- [ ] Tambah kolom di schema? → `npx prisma migrate dev --name nama-migrasi`
- [ ] Install package baru? → konfirmasi ke user dulu

### Monitoring & tracking
- [ ] Pasang PostHog event tracking untuk fitur baru (kalau user-facing)
- [ ] Pasang Sentry error boundary kalau relevan

### Sebelum push
- [ ] Smoke test:
  - Buka semua halaman utama (/, /login, /dashboard, /admin)
  - Cek fitur baru berjalan tanpa error
  - Cek tidak ada `console.error` baru di browser
- [ ] Jalankan test suite: `npm run test`
- [ ] Fitur menyentuh auth / pembayaran / input user / endpoint baru?
  → WAJIB `/security-review` sebelum push

### Setelah push
- [ ] Buat PR di GitHub
- [ ] STOP — tunggu perintah merge dari user

## Pola API route baru
```js
// Selalu cek session dulu
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET(request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  // ...
}
```

## Pola tambah modul
Edit `lib/modules-seed.js`:
```js
{ slug: 'nama-modul', title: 'Judul Modul', parentIds: ['slug-parent'], 
  youtubeUrl: 'https://youtube.com/...', gammaUrl: 'https://gamma.app/embed/...' }
```
Lalu: `npm run seed`
