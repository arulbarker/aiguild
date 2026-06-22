const SETUP_PLUGIN_PROMPT = `Setup Claude Code — Standar Komunitas AI Guild

Halo Claude! Aku baru install Claude Code dan mau setup semua plugin
standar komunitas AI Guild. Tolong bantu aku step by step.

===============================================================
STEP 1 — TULIS FILE KONFIGURASI PLUGIN
===============================================================
Tolong tulis file settings.json di lokasi ini:
C:\\Users\\[USERNAME]\\.claude\\settings.json

Ganti [USERNAME] dengan nama user Windows-ku yang sebenarnya.
Kalau file sudah ada, merge — jangan hapus isi yang lama.

Isi yang perlu ditambahkan:

{
  "$schema": "https://json.schemastore.org/claude-code-settings.json",
  "extraKnownMarketplaces": {
    "claude-code-plugins": {
      "source": {
        "source": "github",
        "repo": "anthropics/claude-code"
      }
    },
    "mem0-plugins": {
      "source": {
        "source": "github",
        "repo": "mem0ai/mem0"
      }
    }
  },
  "enabledPlugins": {
    "superpowers@claude-plugins-official": true,
    "code-review@claude-plugins-official": true,
    "feature-dev@claude-plugins-official": true,
    "frontend-design@claude-plugins-official": true,
    "commit-commands@claude-plugins-official": true,
    "pr-review-toolkit@claude-plugins-official": true,
    "security-guidance@claude-plugins-official": true,
    "claude-md-management@claude-plugins-official": true,
    "code-simplifier@claude-plugins-official": true,
    "skill-creator@claude-plugins-official": true,
    "plugin-dev@claude-plugins-official": true,
    "claude-code-setup@claude-plugins-official": true,
    "remember@claude-plugins-official": true,
    "playground@claude-plugins-official": true,
    "context7@claude-plugins-official": true,
    "chrome-devtools-mcp@claude-plugins-official": true,
    "playwright@claude-plugins-official": true,
    "supabase@claude-plugins-official": true,
    "vercel@claude-plugins-official": true,
    "cloudflare@claude-plugins-official": true,
    "railway@claude-plugins-official": true,
    "github@claude-plugins-official": true,
    "gitlab@claude-plugins-official": true,
    "figma@claude-plugins-official": true,
    "sentry@claude-plugins-official": true,
    "posthog@claude-plugins-official": true,
    "postman@claude-plugins-official": true,
    "serena@claude-plugins-official": true,
    "firecrawl@claude-plugins-official": true,
    "coderabbit@claude-plugins-official": true,
    "linear@claude-plugins-official": true,
    "mintlify@claude-plugins-official": true,
    "telegram@claude-plugins-official": true,
    "semgrep@claude-plugins-official": true,
    "ralph-loop@claude-plugins-official": true,
    "agent-sdk-dev@claude-plugins-official": true,
    "mcp-server-dev@claude-plugins-official": true,
    "typescript-lsp@claude-plugins-official": true,
    "pyright-lsp@claude-plugins-official": true,
    "gopls-lsp@claude-plugins-official": true,
    "rust-analyzer-lsp@claude-plugins-official": true,
    "kotlin-lsp@claude-plugins-official": true,
    "fakechat@claude-plugins-official": true,
    "greptile@claude-plugins-official": true,
    "atomic-agents@claude-plugins-official": true,
    "qodo-skills@claude-plugins-official": true,
    "session-report@claude-plugins-official": true,
    "ai-plugins@claude-plugins-official": true,
    "learning-output-style@claude-plugins-official": true,
    "explanatory-output-style@claude-plugins-official": true,
    "code-review@claude-code-plugins": true,
    "commit-commands@claude-code-plugins": true,
    "feature-dev@claude-code-plugins": true,
    "frontend-design@claude-code-plugins": true,
    "security-guidance@claude-code-plugins": true,
    "plugin-dev@claude-code-plugins": true,
    "agent-sdk-dev@claude-code-plugins": true,
    "pr-review-toolkit@claude-code-plugins": true,
    "ralph-wiggum@claude-code-plugins": true,
    "claude-opus-4-5-migration@claude-code-plugins": true,
    "learning-output-style@claude-code-plugins": true,
    "explanatory-output-style@claude-code-plugins": true,
    "mem0@mem0-plugins": true
  },
  "mcpServers": {
    "chrome-devtools": {
      "command": "npx",
      "args": ["chrome-devtools-mcp", "--autoConnect"]
    }
  }
}

Setelah selesai menulis file, beritahu aku dan lanjut ke step berikutnya.

===============================================================
STEP 2 — RESTART CLAUDE CODE
===============================================================
Setelah file tersimpan:
1. Tutup Claude Code sepenuhnya
2. Buka lagi Claude Code
3. Semua plugin akan otomatis ter-download dan aktif saat startup
4. Tunggu beberapa menit sampai selesai, lalu balik ke sini

===============================================================
STEP 3 — SETUP MCP YANG BUTUH LOGIN (opsional tapi direkomendasikan)
===============================================================
Beberapa MCP butuh akun/token pribadi. Setup setelah restart:

Ketik /mcp di Claude Code untuk lihat daftar MCP yang tersedia.
MCP yang perlu diauth akan terlihat dengan status "not connected".

Yang direkomendasikan untuk disetup:

- GitHub MCP (butuh GitHub Personal Access Token)
  Cara dapat token: github.com > Settings > Developer settings > Personal access tokens
  Lalu ketik ke Claude: "Tolong bantu aku setup GitHub MCP dengan token ini: [TOKEN_KAMU]"

- Mem0 MCP (butuh API key dari mem0.ai)
  Cara dapat key: daftar di mem0.ai > ambil API key dari dashboard
  Lalu ketik ke Claude: "Tolong bantu aku setup Mem0 MCP dengan token ini: [TOKEN_KAMU]"

===============================================================
STEP 4 — VERIFIKASI SEMUA PLUGIN AKTIF
===============================================================
Ketik ke Claude setelah restart:
"Cek semua plugin yang sudah aktif dan beritahu aku hasilnya"

Claude akan menampilkan daftar plugin yang berhasil aktif beserta statusnya.

===============================================================
STEP 5 — CEK & PERBAIKI PLUGIN YANG ERROR
===============================================================
Setelah daftar muncul, pastikan tidak ada yang gagal. Ketik ke Claude:

"Cek lagi apakah ada plugin atau MCP yang error/gagal aktif.
Kalau ada, tolong perbaiki. Error paling sering terjadi karena plugin
belum ter-update — jadi coba update dulu. Tapi tetap periksa kemungkinan
penyebab lain juga (konfigurasi salah, marketplace belum terdaftar,
dependensi kurang). Kalau bisa kamu perbaiki sendiri, langsung lakukan.
Kalau ada yang butuh tindakan manual dariku, katakan terus terang
langkah-langkahnya apa — jangan dipaksakan."

Yang akan Claude lakukan:
1. Mengidentifikasi plugin/MCP mana yang error
2. Mencoba update plugin lebih dulu (penyebab paling umum)
3. Memeriksa kemungkinan lain (config, marketplace, dependensi)
4. Memperbaiki otomatis yang memang bisa diperbaiki
5. Memberitahu dengan jujur kalau ada yang harus kamu lakukan manual

Ulangi langkah ini sampai semua plugin yang kamu butuhkan aktif tanpa error.

---------------------------------------------------------------
Dibuat oleh: Arul (AI Guild)
Komunitas vibe coding untuk non-IT
---------------------------------------------------------------`

const PLUGIN_DOC_HTML = `
<div class="plg-doc">
  <style>
    .plg-doc { color: rgba(240,232,212,0.85); max-width: 860px; margin: 0 auto; padding: 4px 2px 48px; font-size: 14px; line-height: 1.6; }
    .plg-doc * { box-sizing: border-box; }
    .plg-hero { border: 1px solid var(--border, rgba(255,255,255,0.1)); border-radius: 16px; padding: 22px 20px; background: var(--surface, rgba(255,255,255,0.03)); margin-bottom: 26px; }
    .plg-kicker { font-family: var(--font-mono, monospace); font-size: 10px; letter-spacing: 0.2em; text-transform: uppercase; color: #E8A020; margin: 0 0 8px; }
    .plg-hero h1 { font-size: 21px; font-weight: 700; color: #F0E8D4; margin: 0 0 8px; letter-spacing: -0.01em; }
    .plg-hero p { margin: 0; color: rgba(240,232,212,0.7); font-size: 13.5px; }
    .plg-cat { margin-top: 30px; }
    .plg-cat-head { display: flex; align-items: center; gap: 10px; margin-bottom: 6px; }
    .plg-cat-ico { font-size: 17px; }
    .plg-cat-title { font-family: var(--font-mono, monospace); font-size: 12.5px; letter-spacing: 0.12em; text-transform: uppercase; color: #E8A020; margin: 0; }
    .plg-cat-sub { color: rgba(240,232,212,0.5); font-size: 12.5px; margin: 0 0 12px; }
    .plg-item { display: flex; gap: 14px; padding: 11px 2px; border-bottom: 1px solid rgba(255,255,255,0.06); }
    .plg-item:last-child { border-bottom: none; }
    .plg-name { font-family: var(--font-mono, monospace); font-size: 12.5px; color: #E8A020; width: 190px; flex-shrink: 0; word-break: break-word; }
    .plg-desc { color: rgba(240,232,212,0.78); font-size: 13.5px; }
    .plg-tip { margin-top: 30px; border: 1px dashed rgba(232,160,32,0.35); border-radius: 14px; padding: 16px 18px; background: rgba(232,160,32,0.04); }
    .plg-tip b { color: #E8A020; }
    @media (max-width: 640px) {
      .plg-item { flex-direction: column; gap: 3px; padding: 10px 2px; }
      .plg-name { width: auto; }
    }
  </style>

  <div class="plg-hero">
    <p class="plg-kicker">AI GUILD · PANDUAN PLUGIN</p>
    <h1>Apa Saja yang Baru Kamu Install?</h1>
    <p>Daftar lengkap plugin & MCP standar komunitas, dikelompokkan biar gampang dipahami. Tidak perlu hafal — cukup tahu masing-masing gunanya buat apa, supaya kamu tahu kapan memanggilnya.</p>
  </div>

  <div class="plg-cat">
    <div class="plg-cat-head"><span class="plg-cat-ico">⚡</span><p class="plg-cat-title">Workflow Inti</p></div>
    <p class="plg-cat-sub">Otak cara kerja Claude sehari-hari — dari mikir, ngoding, sampai rapikan.</p>
    <div class="plg-item"><div class="plg-name">superpowers</div><div class="plg-desc">Kumpulan "jurus" yang bikin Claude kerja disiplin: brainstorming, testing, debugging sistematis, dan banyak lagi. Ini fondasinya.</div></div>
    <div class="plg-item"><div class="plg-name">code-review</div><div class="plg-desc">Memeriksa kode yang baru kamu ubah untuk cari bug dan kasih saran perbaikan.</div></div>
    <div class="plg-item"><div class="plg-name">feature-dev</div><div class="plg-desc">Memandu pembuatan fitur baru — dari paham kode lama sampai rancang arsitekturnya.</div></div>
    <div class="plg-item"><div class="plg-name">frontend-design</div><div class="plg-desc">Bikin tampilan UI yang rapi dan profesional, bukan asal jadi.</div></div>
    <div class="plg-item"><div class="plg-name">code-simplifier</div><div class="plg-desc">Merapikan kode yang sudah jalan tapi masih berantakan.</div></div>
    <div class="plg-item"><div class="plg-name">commit-commands</div><div class="plg-desc">Bantu commit, push, dan bikin Pull Request dengan format yang benar.</div></div>
    <div class="plg-item"><div class="plg-name">pr-review-toolkit</div><div class="plg-desc">Review Pull Request menyeluruh: bug, test, komentar, sampai desain tipe data.</div></div>
    <div class="plg-item"><div class="plg-name">security-guidance</div><div class="plg-desc">Panduan keamanan supaya aplikasimu tidak gampang dibobol.</div></div>
    <div class="plg-item"><div class="plg-name">claude-md-management</div><div class="plg-desc">Merawat file CLAUDE.md — "memori" dan aturan project-mu.</div></div>
    <div class="plg-item"><div class="plg-name">skill-creator</div><div class="plg-desc">Bikin skill / SOP baru supaya Claude punya kemampuan khusus.</div></div>
    <div class="plg-item"><div class="plg-name">plugin-dev</div><div class="plg-desc">Bikin plugin Claude Code-mu sendiri.</div></div>
    <div class="plg-item"><div class="plg-name">agent-sdk-dev</div><div class="plg-desc">Bangun aplikasi AI agent pakai Claude Agent SDK.</div></div>
    <div class="plg-item"><div class="plg-name">mcp-server-dev</div><div class="plg-desc">Bangun MCP server sendiri — jembatan Claude ke layanan luar.</div></div>
    <div class="plg-item"><div class="plg-name">remember</div><div class="plg-desc">Memori jangka panjang: Claude ingat konteks lintas sesi.</div></div>
    <div class="plg-item"><div class="plg-name">claude-code-setup</div><div class="plg-desc">Kasih rekomendasi otomatisasi & setup Claude Code.</div></div>
    <div class="plg-item"><div class="plg-name">playground</div><div class="plg-desc">Tempat eksperimen fitur Claude tanpa takut merusak project.</div></div>
    <div class="plg-item"><div class="plg-name">ralph-loop / ralph-wiggum</div><div class="plg-desc">Menjalankan tugas berulang secara otomatis dalam loop.</div></div>
    <div class="plg-item"><div class="plg-name">session-report</div><div class="plg-desc">Bikin laporan ringkas dari sesi kerjamu.</div></div>
    <div class="plg-item"><div class="plg-name">claude-opus-4-5-migration</div><div class="plg-desc">Bantu menyesuaikan project ke versi model Claude yang lebih baru.</div></div>
  </div>

  <div class="plg-cat">
    <div class="plg-cat-head"><span class="plg-cat-ico">🔌</span><p class="plg-cat-title">Integrasi Layanan (MCP)</p></div>
    <p class="plg-cat-sub">Jembatan yang menghubungkan Claude ke alat & platform luar.</p>
    <div class="plg-item"><div class="plg-name">context7</div><div class="plg-desc">Ambil dokumentasi library terbaru (React, Next.js, Prisma, dll) langsung — biar Claude tidak ngarang sintaks lama.</div></div>
    <div class="plg-item"><div class="plg-name">chrome-devtools-mcp</div><div class="plg-desc">Buka & inspeksi browser real-time bareng Claude: debug visual, console, network. Andalan dev harian.</div></div>
    <div class="plg-item"><div class="plg-name">playwright</div><div class="plg-desc">Robot QA — uji alur app otomatis (login, checkout) di browser.</div></div>
    <div class="plg-item"><div class="plg-name">supabase</div><div class="plg-desc">Kelola database & autentikasi di Supabase.</div></div>
    <div class="plg-item"><div class="plg-name">vercel</div><div class="plg-desc">Deploy & kelola project di Vercel.</div></div>
    <div class="plg-item"><div class="plg-name">cloudflare</div><div class="plg-desc">Akses Workers, Pages, storage, dan layanan Cloudflare lain.</div></div>
    <div class="plg-item"><div class="plg-name">railway</div><div class="plg-desc">Deploy aplikasi & database di Railway.</div></div>
    <div class="plg-item"><div class="plg-name">github</div><div class="plg-desc">Operasikan GitHub (repo, PR, issue) langsung dari Claude.</div></div>
    <div class="plg-item"><div class="plg-name">gitlab</div><div class="plg-desc">Sama seperti GitHub, tapi untuk GitLab.</div></div>
    <div class="plg-item"><div class="plg-name">figma</div><div class="plg-desc">Ambil desain dari Figma untuk diubah jadi kode.</div></div>
    <div class="plg-item"><div class="plg-name">sentry</div><div class="plg-desc">Pantau error aplikasi secara real-time.</div></div>
    <div class="plg-item"><div class="plg-name">posthog</div><div class="plg-desc">Analitik perilaku user — lihat apa yang mereka lakukan di app-mu.</div></div>
    <div class="plg-item"><div class="plg-name">postman</div><div class="plg-desc">Uji & dokumentasikan API.</div></div>
    <div class="plg-item"><div class="plg-name">serena</div><div class="plg-desc">Navigasi kode pintar — paham struktur, cari fungsi/simbol dengan cepat.</div></div>
    <div class="plg-item"><div class="plg-name">firecrawl</div><div class="plg-desc">Ubah website / dokumentasi jadi skill atau data.</div></div>
    <div class="plg-item"><div class="plg-name">coderabbit</div><div class="plg-desc">Review kode otomatis bertenaga AI.</div></div>
    <div class="plg-item"><div class="plg-name">linear</div><div class="plg-desc">Kelola task & project di Linear.</div></div>
    <div class="plg-item"><div class="plg-name">mintlify</div><div class="plg-desc">Bikin dokumentasi yang rapi dan enak dibaca.</div></div>
    <div class="plg-item"><div class="plg-name">telegram</div><div class="plg-desc">Hubungkan Claude ke Telegram.</div></div>
    <div class="plg-item"><div class="plg-name">semgrep</div><div class="plg-desc">Pindai celah keamanan di dalam kode.</div></div>
    <div class="plg-item"><div class="plg-name">mem0</div><div class="plg-desc">Lapisan memori untuk aplikasi AI buatanmu.</div></div>
    <div class="plg-item"><div class="plg-name">greptile</div><div class="plg-desc">Pencarian & review kode berbasis AI untuk repo besar.</div></div>
    <div class="plg-item"><div class="plg-name">atomic-agents</div><div class="plg-desc">Framework untuk membangun AI agent.</div></div>
    <div class="plg-item"><div class="plg-name">qodo-skills</div><div class="plg-desc">Kumpulan skill dari Qodo (aturan & resolver PR).</div></div>
    <div class="plg-item"><div class="plg-name">ai-plugins</div><div class="plg-desc">Paket integrasi tambahan (misalnya setup Endor).</div></div>
    <div class="plg-item"><div class="plg-name">fakechat</div><div class="plg-desc">Simulasikan percakapan chat untuk keperluan testing.</div></div>
  </div>

  <div class="plg-cat">
    <div class="plg-cat-head"><span class="plg-cat-ico">🧠</span><p class="plg-cat-title">Dukungan Bahasa (LSP)</p></div>
    <p class="plg-cat-sub">Autocomplete & deteksi error pintar per bahasa pemrograman.</p>
    <div class="plg-item"><div class="plg-name">typescript-lsp</div><div class="plg-desc">Untuk TypeScript / JavaScript.</div></div>
    <div class="plg-item"><div class="plg-name">pyright-lsp</div><div class="plg-desc">Untuk Python.</div></div>
    <div class="plg-item"><div class="plg-name">gopls-lsp</div><div class="plg-desc">Untuk Go.</div></div>
    <div class="plg-item"><div class="plg-name">rust-analyzer-lsp</div><div class="plg-desc">Untuk Rust.</div></div>
    <div class="plg-item"><div class="plg-name">kotlin-lsp</div><div class="plg-desc">Untuk Kotlin (Android).</div></div>
  </div>

  <div class="plg-cat">
    <div class="plg-cat-head"><span class="plg-cat-ico">🎨</span><p class="plg-cat-title">Gaya Output</p></div>
    <p class="plg-cat-sub">Mengatur cara Claude menjelaskan saat menemanimu ngoding.</p>
    <div class="plg-item"><div class="plg-name">learning-output-style</div><div class="plg-desc">Mode "belajar" — Claude menjelaskan sambil kerja dan mengajakmu ikut menulis kode.</div></div>
    <div class="plg-item"><div class="plg-name">explanatory-output-style</div><div class="plg-desc">Mode "penjelasan" — memberi insight edukatif di sela-sela ngoding.</div></div>
  </div>

  <div class="plg-tip">
    <b>Tidak perlu dihafal.</b> Kamu cukup tahu kategori besarnya. Saat butuh sesuatu, tinggal minta ke Claude pakai bahasa biasa — misalnya "tolong deploy ke Vercel" atau "cek error di Sentry" — dan plugin yang sesuai akan otomatis dipakai.
  </div>
</div>`

// Course pertama. Semua modul saat ini milik course ini (fallback di seed.js).
export const DEFAULT_COURSE_SLUG = 'vibe-coding-gas'

export const COURSES_SEED = [
  {
    slug: 'vibe-coding-gas',
    title: 'Vibe Coding Google Apps Script: Dari Nol Bikin Aplikasi Sampai Menghasilkan',
    description: 'Belajar vibe coding dari mindset sampai bikin & menjual aplikasi Google Apps Script — khusus pemula non-IT.',
    price: 500000,
    mayarProductId: null, // diisi via admin setelah produk dibuat di Mayar
    isPublished: true,
    orderIndex: 0,
  },
]

export const MODULES_SEED = [
  {
    title: 'Mindset Vibe Coding',
    slug: 'intro-vibe-coding',
    description: 'Kenalan dengan cara baru ngoding — tanpa harus jadi programmer dulu.',
    youtubeUrl: 'https://youtu.be/g2ykOVfJXyo',
    gammaUrl: 'https://drive.google.com/file/d/1CSR08CezZFAr2MT3mQu-I0iME7qPWNry/preview',
    parentIds: [],
    orderIndex: 0,
  },
  {
    title: 'Pentingnya Logika yang Benar Saat Membuat Project',
    slug: 'setup-lingkungan-kerja',
    description: 'Install semua yang dibutuhkan: VS Code, Node.js, Claude Code.',
    youtubeUrl: null,
    gammaUrl: 'https://drive.google.com/file/d/121iyc9NxHddM8SEKeqtTIemrxWQlPnL9/preview',
    parentIds: ['intro-vibe-coding'],
    orderIndex: 1,
  },
  {
    title: 'Cara Instal VS Code, Claude Code dan Membeli Akun Pro Claude',
    slug: 'prompt-engineering-dasar',
    description: 'Cara ngomong ke AI supaya hasilnya sesuai keinginan.',
    youtubeUrl: 'https://youtu.be/7PpoNa2d4w4',
    gammaUrl: null,
    parentIds: ['intro-vibe-coding'],
    orderIndex: 2,
  },
  {
    title: 'Persiapan Download Plugin Skill dan MCP',
    slug: 'web-app-pertama',
    description: 'Dari nol sampai jalan — web app sederhana dengan Next.js.',
    youtubeUrl: 'https://youtu.be/v9PUQaazavo',
    gammaUrl: 'https://drive.google.com/file/d/1Js4RN_MVZptqxZV2YfGCVrV6VjnBhCx0/preview',
    parentIds: ['setup-lingkungan-kerja', 'prompt-engineering-dasar'],
    orderIndex: 3,
  },
  {
    title: 'Prompt Siap Pakai: Setup Plugin & MCP',
    slug: 'setup-plugin-mcp',
    description: 'Prompt copy-paste siap pakai — tempel ke Claude Code untuk download plugin & MCP yang sama seperti mentor.',
    youtubeUrl: null,
    gammaUrl: null,
    promptText: SETUP_PLUGIN_PROMPT,
    parentIds: ['web-app-pertama'],
    orderIndex: 4,
  },
  {
    title: 'Penjelasan Semua Plugin & MCP',
    slug: 'penjelasan-plugin',
    description: 'Materi lengkap: apa fungsi tiap plugin & MCP yang baru kamu install, dikelompokkan biar gampang dipahami.',
    youtubeUrl: null,
    gammaUrl: null,
    htmlContent: PLUGIN_DOC_HTML,
    parentIds: ['setup-plugin-mcp'],
    orderIndex: 5,
  },
  {
    title: 'Cara Instal CLI GitHub di Claude Code',
    slug: 'deploy-ke-internet',
    description: 'Supaya orang lain bisa pakai aplikasimu — deploy ke Vercel.',
    youtubeUrl: 'https://youtu.be/DBsf2SqZIOU',
    gammaUrl: null,
    parentIds: ['penjelasan-plugin'],
    orderIndex: 6,
  },
  {
    title: 'Praktek Git Langsung',
    slug: 'koneksi-database',
    description: 'Simpan data user dengan Supabase — tanpa ribet.',
    youtubeUrl: 'https://youtu.be/mRjnhAYLdKk',
    gammaUrl: 'https://drive.google.com/file/d/1-H3v8K5mq1fQ0TqJuHHUMkyn8MEJfDQy/preview',
    parentIds: ['penjelasan-plugin'],
    orderIndex: 7,
  },
  {
    title: 'Cara Menggunakan Claude Code',
    slug: 'monetisasi-produk-digital',
    description: 'Integrasikan payment gateway dan mulai jual produk.',
    youtubeUrl: null,
    gammaUrl: 'https://drive.google.com/file/d/1DCxpQVbVhh81O9QpacZjr8emyLSq8Sov/preview',
    parentIds: ['deploy-ke-internet', 'koneksi-database'],
    orderIndex: 8,
  },
  {
    title: 'Mengenal API dan Webhook',
    slug: 'mengenal-api-dan-webhook',
    description: 'Cara aplikasimu terhubung ke layanan luar — API dan webhook untuk pemula.',
    youtubeUrl: null,
    gammaUrl: 'https://drive.google.com/file/d/1qk3OJuLB7gc31CkrbZCMuVGgGu_QKOd2/preview',
    parentIds: ['monetisasi-produk-digital'],
    orderIndex: 9,
  },
  {
    title: 'Mengenal Sentry',
    slug: 'mengenal-sentry',
    description: 'Monitor error di aplikasimu secara real-time dengan Sentry.',
    youtubeUrl: null,
    gammaUrl: 'https://drive.google.com/file/d/1oTKDFzM82RqkN8ntAp5mdHQQvMzfSe-V/preview',
    parentIds: ['mengenal-api-dan-webhook'],
    orderIndex: 10,
  },
  {
    title: 'Mengenal PostHog',
    slug: 'mengenal-posthog',
    description: 'Pahami perilaku user di aplikasimu dengan PostHog — analitik, funnel, dan rekaman sesi.',
    youtubeUrl: null,
    gammaUrl: 'https://drive.google.com/file/d/1xkW_gztkENnXiUNRni-BX05OIBwys0rr/preview',
    parentIds: ['mengenal-sentry'],
    orderIndex: 11,
  },
  {
    title: 'Kehebatan Chrome DevTools MCP',
    slug: 'kehebatan-chrome-devtools-mcp',
    description: 'Gunakan Chrome DevTools MCP untuk debug dan inspect aplikasi secara real-time bersama AI.',
    youtubeUrl: null,
    gammaUrl: 'https://drive.google.com/file/d/1z1XKepgL4aHsWdbVI5dtjD5fBewTVUBT/preview',
    parentIds: ['mengenal-posthog'],
    orderIndex: 12,
  },
  {
    title: 'Testing: Si Penjaga Aplikasi',
    slug: 'testing-si-penjaga-aplikasi',
    description: 'Kenali pentingnya testing — cara memastikan aplikasimu tidak rusak saat berkembang.',
    youtubeUrl: null,
    gammaUrl: 'https://drive.google.com/file/d/1rpR4t0LTLrtTJGZ72XvmeXr2ldHtC7hh/preview',
    parentIds: ['kehebatan-chrome-devtools-mcp'],
    orderIndex: 13,
  },
  {
    title: 'CI/CD: Deploy Otomatis',
    slug: 'cicd-deploy-otomatis',
    description: 'Otomatiskan proses deploy supaya setiap perubahan kode langsung tayang ke internet.',
    youtubeUrl: null,
    gammaUrl: 'https://drive.google.com/file/d/1z994y-3Li1P8jkO5TXk5ybkfQwhJJvUg/preview',
    parentIds: ['testing-si-penjaga-aplikasi'],
    orderIndex: 14,
  },
  {
    title: '3 File Ajaib AI Guild',
    slug: 'tiga-file-ajaib',
    description: 'Rahasia di balik Claude Code yang bekerja seperti developer profesional — kenali 3 file yang mengubah cara kamu ngoding.',
    youtubeUrl: null,
    gammaUrl: null,
    // htmlContent diisi seed.js dari lib/card-content/tiga-file-ajaib.html
    parentIds: ['cicd-deploy-otomatis'],
    orderIndex: 15,
  },
  {
    title: 'Template: CLAUDE.md Global',
    slug: 'claude-md-global',
    description: 'Identitas & standar profesionalmu yang dibaca Claude di SEMUA project. Salin, isi bagian pribadi, simpan ke ~/.claude/CLAUDE.md.',
    youtubeUrl: null,
    gammaUrl: null,
    // promptText diisi seed.js dari lib/card-content/claude-md-global.txt (create-only, lalu dikelola admin)
    parentIds: ['tiga-file-ajaib'],
    orderIndex: 16,
  },
  {
    title: 'Magic Prompt — Project Baru',
    slug: 'magic-prompt-init',
    description: 'Prompt siap pakai untuk setup struktur library .claude/ di project baru. Jalankan sekali setelah /init.',
    youtubeUrl: null,
    gammaUrl: null,
    // promptText diisi seed.js dari lib/card-content/magic-prompt-init.txt (create-only, lalu dikelola admin)
    parentIds: ['claude-md-global'],
    orderIndex: 17,
  },
  {
    title: 'Magic Prompt — Project Lama',
    slug: 'magic-prompt-existing',
    description: 'Prompt siap pakai untuk memasang sistem library di project yang sudah berjalan — aman, additive, tanpa merusak yang ada.',
    youtubeUrl: null,
    gammaUrl: null,
    // promptText diisi seed.js dari lib/card-content/magic-prompt-existing.txt (create-only, lalu dikelola admin)
    parentIds: ['magic-prompt-init'],
    orderIndex: 18,
  },
  {
    title: 'Praktek: Membuat Aplikasi GAS',
    slug: 'praktek-gas',
    description: 'Bangun aplikasi otomasi nyata dengan Google Apps Script — dari nol sampai jalan.',
    youtubeUrl: null,
    gammaUrl: null,
    parentIds: ['magic-prompt-existing'],
    orderIndex: 19,
  },
  {
    title: 'Mengenal Google Apps Script',
    slug: 'praktek-gas-intro',
    description: 'Kenalan dengan Google Apps Script — apa itu dan kenapa berguna untuk otomasi.',
    youtubeUrl: null,
    gammaUrl: 'https://drive.google.com/file/d/1ShneZ5n-qbL_-AT7e-dU4j83LdanZT4e/preview',
    parentIds: ['praktek-gas'],
    orderIndex: 23,
  },
  {
    title: 'Google Apps Script Lebih Dalam',
    slug: 'praktek-gas-lanjut',
    description: 'Pelajari Google Apps Script lebih dalam — konsep dan teknik lanjutan.',
    youtubeUrl: null,
    gammaUrl: 'https://drive.google.com/file/d/1enzv78SSC-_Tc6mHdRvZ024hPbv3_-SD/preview',
    parentIds: ['praktek-gas-intro'],
    orderIndex: 24,
  },
  {
    title: 'Apa itu clasp',
    slug: 'praktek-gas-clasp',
    description: 'Kenalan dengan clasp — alat untuk ngoding Google Apps Script dari lokal.',
    youtubeUrl: null,
    gammaUrl: 'https://drive.google.com/file/d/1LtF0XiGjddhQLxHY639GDv1Iqnj_FlvZ/preview',
    parentIds: ['praktek-gas-lanjut'],
    orderIndex: 25,
  },
  {
    title: 'Pembuatan Aplikasi GAS Kasir',
    slug: 'praktek-gas-kasir',
    description: 'Praktek langsung bikin aplikasi kasir dengan Google Apps Script.',
    youtubeUrl: 'https://youtu.be/SvQzEeiyGvY',
    gammaUrl: null,
    parentIds: ['praktek-gas-clasp'],
    orderIndex: 26,
  },
  {
    title: '5 Cara Menghasilkan Uang dari Vibe Coding GAS App',
    slug: 'praktek-gas-monetisasi',
    description: 'Lima cara nyata menghasilkan uang dari aplikasi Google Apps Script yang kamu buat.',
    youtubeUrl: null,
    gammaUrl: 'https://drive.google.com/file/d/1vEydQjOefwC5yj5wPRZr5TanFEWJ2ca3/preview',
    parentIds: ['praktek-gas-kasir'],
    orderIndex: 27,
  },
]
