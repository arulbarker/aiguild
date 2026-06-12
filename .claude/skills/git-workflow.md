# Skill: git-workflow

## Branch utama
`master` — SUCI, dilarang commit/push langsung

## Format nama branch
```
feat/nama-fitur      — fitur baru
fix/nama-bug         — perbaikan bug
docs/nama-dokumen    — update dokumentasi
chore/nama-task      — maintenance, refactor, dependency
```
Contoh: `feat/edit-modul-admin`, `fix/webhook-mayar-signature`, `chore/upgrade-prisma`

## Alur setiap task

```
1. Buat branch baru
   git checkout -b feat/nama-fitur

2. Kerjakan perubahan
   - Commit setiap perubahan berarti (jangan tunggu selesai semua)
   - Format: feat: / fix: / docs: / chore: + deskripsi singkat
   - Contoh: git commit -m "feat: tambah halaman edit modul di admin"

3. Smoke test sebelum push
   - Cek semua halaman utama bisa dibuka
   - Cek fungsi kritis tidak error
   - Cek tidak ada console.error baru

4. Push ke remote
   git push origin feat/nama-fitur

5. STOP — tunggu perintah eksplisit user sebelum merge
```

## Conventional commits yang dipakai
| Prefix | Kapan |
|---|---|
| `feat:` | Fitur baru |
| `fix:` | Perbaikan bug |
| `docs:` | Update dokumentasi |
| `chore:` | Maintenance, config, dependency |
| `refactor:` | Refaktor tanpa perubahan fungsional |

## Yang TIDAK boleh dilakukan
- Commit langsung ke `master`
- Force push ke `master`
- Merge sendiri tanpa perintah eksplisit user
- Commit file `.env`, `.env.local`, atau file berisi rahasia
