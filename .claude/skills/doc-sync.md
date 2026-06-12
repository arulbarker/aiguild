# Skill: doc-sync

## Kapan aktif otomatis
Ketika user ketik: "sync docs" / "audit library" / "cek dokumen" / "update docs"

## Yang harus dilakukan
1. Baca semua file di `.claude/docs-library/`
2. Scan SELURUH project untuk file .md liar — file yang tidak terdaftar
   di CLAUDE.md dan tidak di lokasi yang benar (dari plugin apapun,
   skill apapun, atau Claude sendiri). Pengecualian: README.md,
   LICENSE.md, CHANGELOG.md, folder docs/, node_modules/
3. Baca kondisi kode saat ini (struktur folder, dependencies, schema)
4. Sorting SEMUA file .md baru/liar dengan pertanyaan "Siapa yang butuh file ini?":
   - Claude butuh saat coding project ini → `.claude/docs-library/`
   - Claude butuh di semua project → laporkan untuk dipindah ke `~/.claude/templates/`
   - User/customer butuh → `docs/` di root project
   - Tidak jelas → tanyakan ke user
5. Kalau satu file berisi campuran topik → rekomendasikan untuk dipecah, konfirmasi dulu
6. Buat laporan lengkap:
   - File yang masih akurat ✓
   - File yang outdated — sebutkan apa yang berubah
   - File yang tidak relevan — sebutkan alasannya
   - File liar yang ditemukan + rekomendasi lokasinya
   - File yang perlu dipecah
7. Tunggu konfirmasi user sebelum eksekusi apapun
8. Untuk file tidak relevan: jangan hapus langsung
   Tawarkan 3 opsi ke user:
   a. Hapus permanen
   b. Arsip ke `.claude/archive/` (tidak aktif dibaca tapi tersimpan)
   c. Update isinya supaya relevan lagi
9. Eksekusi sesuai pilihan user
10. Catat semua perubahan di SESSION.md

## Yang TIDAK boleh dilakukan
- Jangan update, hapus, atau pindahkan file tanpa konfirmasi user
- Jangan pecah file tanpa konfirmasi user
- Kalau ada konflik antara dokumen dan kode → percayai kode, laporkan ke user
- File di `.claude/archive/` tidak perlu didaftarkan di CLAUDE.md
