# Skill: insert-modul (sisip / urutkan ulang kartu modul a la Excel)

Dipakai saat user minta **sisip kartu modul di posisi tertentu** ("jadikan kartu nomor N",
"taruh di bawah modul X") atau **ubah urutan**. Penomoran ikut bergeser otomatis seperti
menyisipkan baris di Excel.

## Konsep wajib paham dulu

- **Nomor kartu = POSISI urut (rank 1..N), bukan `orderIndex` mentah** (lihat
  `numberMap()` + `displayNumber()` di `lib/module-tree.js`). Jadi kalau ada kartu dihapus,
  nomor sisanya rapat sendiri (a la Excel) — TIDAK perlu menggeser orderIndex satu per satu.
  `orderIndex` tetap penting hanya sebagai **kunci urutan** (sort & field "Urutan" di admin).
- **Posisi visual di flowchart ditentukan `parentIds` (DAG), BUKAN orderIndex.**
  Menggeser orderIndex saja TIDAK memindah kartu di flowchart.
- **`slug` = identitas permanen.** Seed upsert by slug → progress user nyambung via slug→id.
  JANGAN ubah slug saat reorder (kalau diubah, dianggap modul baru, progress putus).
- Konten via seed **TIDAK** memicu notif Telegram (hanya aksi panel admin yang notif).

## Langkah

### 1. Tentukan posisi & dampak
- Posisi baru = nomor yang diminta user. orderIndex target = nomor − 1.
- Semua modul dengan `orderIndex >= target` akan **geser +1**.

### 2. Edit `lib/modules-seed.js`
- Sisip objek modul baru di array.
- **Geser `orderIndex`** semua modul setelahnya +1 (paling aman: tulis ulang blok array
  dari titik sisip sampai akhir, atau edit nilai dari yang TERBESAR dulu agar tidak bentrok).
- **Sambung `parentIds`** supaya kartu benar-benar duduk di posisi yang diminta:
  - Kartu baru `parentIds` = slug kartu tepat sebelumnya.
  - **Re-parent anak** kartu sebelumnya → ke slug kartu baru (kalau ingin kartu baru jadi
    node tunggal di batang utama). Kalau tidak di-re-parent, kartu baru jadi **cabang**
    ("PILIH JALUR"), bukan sisipan di trunk.

### 3. Kalau butuh tipe konten yang belum ada kolomnya
- Video/materi → pakai `youtubeUrl` / `gammaUrl` (Drive `/preview`). **Tidak butuh kolom baru → tidak perlu restart.**
- Prompt copy-paste → `promptText`. Materi HTML → `htmlContent`. Kolom DB sudah ada (tidak perlu
  tambah kolom / restart lagi — sudah sejak Jun 2026).

### 3b. Konten BERAT (HTML 16-slide / prompt panjang) — pola file aset
Jangan tulis HTML/prompt panjang sebagai template string inline di `modules-seed.js`
(ikut ke bundle browser via `MODULES_SEED` + escape backtick rawan error). Pola yang benar:
1. Simpan konten mentah di `lib/card-content/<slug>.html` (HTML) atau `<slug>.txt` (prompt) —
   pakai `.html`/`.txt` (BUKAN `.md`, biar tidak ketrigger aturan doc-hygiene).
2. Di `scripts/seed.js`, daftarkan di map `CARD_CONTENT` by slug (dibaca via `fs.readFileSync`).
3. Di `modules-seed.js` cukup metadata kartu (judul/slug/parentIds/urutan) — TANPA konten berat.

**Sumber kebenaran (penting):** `promptText` di `seed.js` = **CREATE-ONLY** (di-destructure keluar
dari `update`, hanya ikut `create`) → editan admin panel TIDAK ketimpa reseed. `htmlContent` ikut
`update` (sumber = kode/IDE, menyebar tiap `npm run seed`). Lihat `rules.md` bagian konten.

### 4. Sinkron ke DB
```bash
npm run seed   # upsert by slug, progress user dipertahankan (mode aman)
```
Kalau cuma ubah data (bukan kolom), seed cukup — tidak perlu restart server.

### 5. Verifikasi
- Cek dashboard: nomor & posisi kartu benar, total modul bertambah.
- Buka kartu → konten tampil (tab Video/Materi/Prompt/Penjelasan sesuai isinya).
- `npm run test` (smoke).

### 6. Commit
- Branch `feat/...` atau `chore/...`. Conventional commit. STOP setelah push.

## Konversi link Google Drive (untuk `gammaUrl`)
- Link share `.../file/d/<ID>/view?usp=sharing` → ubah ke embed `.../file/d/<ID>/preview`.
