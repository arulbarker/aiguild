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
STEP 4 — VERIFIKASI SELESAI
===============================================================
Ketik ke Claude setelah restart:
"Cek semua plugin yang sudah aktif dan beritahu aku hasilnya"

Kalau ada yang belum aktif, Claude akan bantu debug satu per satu.

---------------------------------------------------------------
Dibuat oleh: Arul (AI Guild)
Komunitas vibe coding untuk non-IT
---------------------------------------------------------------`

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
    title: 'Cara Instal CLI GitHub di Claude Code',
    slug: 'deploy-ke-internet',
    description: 'Supaya orang lain bisa pakai aplikasimu — deploy ke Vercel.',
    youtubeUrl: 'https://youtu.be/DBsf2SqZIOU',
    gammaUrl: null,
    parentIds: ['setup-plugin-mcp'],
    orderIndex: 5,
  },
  {
    title: 'Praktek Git Langsung',
    slug: 'koneksi-database',
    description: 'Simpan data user dengan Supabase — tanpa ribet.',
    youtubeUrl: 'https://youtu.be/mRjnhAYLdKk',
    gammaUrl: 'https://drive.google.com/file/d/1-H3v8K5mq1fQ0TqJuHHUMkyn8MEJfDQy/preview',
    parentIds: ['setup-plugin-mcp'],
    orderIndex: 6,
  },
  {
    title: 'Cara Menggunakan Claude Code',
    slug: 'monetisasi-produk-digital',
    description: 'Integrasikan payment gateway dan mulai jual produk.',
    youtubeUrl: null,
    gammaUrl: 'https://drive.google.com/file/d/1DCxpQVbVhh81O9QpacZjr8emyLSq8Sov/preview',
    parentIds: ['deploy-ke-internet', 'koneksi-database'],
    orderIndex: 7,
  },
  {
    title: 'Mengenal API dan Webhook',
    slug: 'mengenal-api-dan-webhook',
    description: 'Cara aplikasimu terhubung ke layanan luar — API dan webhook untuk pemula.',
    youtubeUrl: null,
    gammaUrl: 'https://drive.google.com/file/d/1qk3OJuLB7gc31CkrbZCMuVGgGu_QKOd2/preview',
    parentIds: ['monetisasi-produk-digital'],
    orderIndex: 8,
  },
  {
    title: 'Mengenal Sentry',
    slug: 'mengenal-sentry',
    description: 'Monitor error di aplikasimu secara real-time dengan Sentry.',
    youtubeUrl: null,
    gammaUrl: 'https://drive.google.com/file/d/1oTKDFzM82RqkN8ntAp5mdHQQvMzfSe-V/preview',
    parentIds: ['mengenal-api-dan-webhook'],
    orderIndex: 9,
  },
  {
    title: 'Kehebatan Chrome DevTools MCP',
    slug: 'kehebatan-chrome-devtools-mcp',
    description: 'Gunakan Chrome DevTools MCP untuk debug dan inspect aplikasi secara real-time bersama AI.',
    youtubeUrl: null,
    gammaUrl: 'https://drive.google.com/file/d/1z1XKepgL4aHsWdbVI5dtjD5fBewTVUBT/preview',
    parentIds: ['mengenal-sentry'],
    orderIndex: 10,
  },
  {
    title: 'Testing: Si Penjaga Aplikasi',
    slug: 'testing-si-penjaga-aplikasi',
    description: 'Kenali pentingnya testing — cara memastikan aplikasimu tidak rusak saat berkembang.',
    youtubeUrl: null,
    gammaUrl: 'https://drive.google.com/file/d/1rpR4t0LTLrtTJGZ72XvmeXr2ldHtC7hh/preview',
    parentIds: ['kehebatan-chrome-devtools-mcp'],
    orderIndex: 11,
  },
  {
    title: 'CI/CD: Deploy Otomatis',
    slug: 'cicd-deploy-otomatis',
    description: 'Otomatiskan proses deploy supaya setiap perubahan kode langsung tayang ke internet.',
    youtubeUrl: null,
    gammaUrl: 'https://drive.google.com/file/d/1z994y-3Li1P8jkO5TXk5ybkfQwhJJvUg/preview',
    parentIds: ['testing-si-penjaga-aplikasi'],
    orderIndex: 12,
  },
  {
    title: 'Praktek: Membuat Aplikasi GAS',
    slug: 'praktek-gas',
    description: 'Bangun aplikasi otomasi nyata dengan Google Apps Script — dari nol sampai jalan.',
    youtubeUrl: null,
    gammaUrl: null,
    parentIds: ['cicd-deploy-otomatis'],
    orderIndex: 13,
  },
  {
    title: 'Praktek: Membuat Aplikasi Web App',
    slug: 'praktek-webapp',
    description: 'Bangun web app full-stack dengan Next.js — dari desain sampai deploy.',
    youtubeUrl: null,
    gammaUrl: null,
    parentIds: ['cicd-deploy-otomatis'],
    orderIndex: 14,
  },
  {
    title: 'Praktek: Membuat Desktop App',
    slug: 'praktek-desktop',
    description: 'Buat aplikasi desktop yang bisa diinstal di Windows/Mac dengan Electron atau PyQt6.',
    youtubeUrl: null,
    gammaUrl: null,
    parentIds: ['cicd-deploy-otomatis'],
    orderIndex: 15,
  },
  {
    title: 'Praktek: Membuat APK Android',
    slug: 'praktek-apk-android',
    description: 'Jadikan web app-mu aplikasi Android yang bisa diinstall di HP.',
    youtubeUrl: null,
    gammaUrl: null,
    parentIds: ['cicd-deploy-otomatis'],
    orderIndex: 16,
  },
  {
    title: 'Mengenal Google Apps Script',
    slug: 'praktek-gas-intro',
    description: 'Kenalan dengan Google Apps Script — apa itu dan kenapa berguna untuk otomasi.',
    youtubeUrl: null,
    gammaUrl: 'https://drive.google.com/file/d/1ShneZ5n-qbL_-AT7e-dU4j83LdanZT4e/preview',
    parentIds: ['praktek-gas'],
    orderIndex: 17,
  },
  {
    title: 'Google Apps Script Lebih Dalam',
    slug: 'praktek-gas-lanjut',
    description: 'Pelajari Google Apps Script lebih dalam — konsep dan teknik lanjutan.',
    youtubeUrl: null,
    gammaUrl: 'https://drive.google.com/file/d/1enzv78SSC-_Tc6mHdRvZ024hPbv3_-SD/preview',
    parentIds: ['praktek-gas-intro'],
    orderIndex: 18,
  },
  {
    title: 'Apa itu clasp',
    slug: 'praktek-gas-clasp',
    description: 'Kenalan dengan clasp — alat untuk ngoding Google Apps Script dari lokal.',
    youtubeUrl: null,
    gammaUrl: 'https://drive.google.com/file/d/1LtF0XiGjddhQLxHY639GDv1Iqnj_FlvZ/preview',
    parentIds: ['praktek-gas-lanjut'],
    orderIndex: 19,
  },
  {
    title: 'Pembuatan Aplikasi GAS Kasir',
    slug: 'praktek-gas-kasir',
    description: 'Praktek langsung bikin aplikasi kasir dengan Google Apps Script.',
    youtubeUrl: 'https://youtu.be/SvQzEeiyGvY',
    gammaUrl: null,
    parentIds: ['praktek-gas-clasp'],
    orderIndex: 20,
  },
  {
    title: '5 Cara Menghasilkan Uang dari Vibe Coding GAS App',
    slug: 'praktek-gas-monetisasi',
    description: 'Lima cara nyata menghasilkan uang dari aplikasi Google Apps Script yang kamu buat.',
    youtubeUrl: null,
    gammaUrl: 'https://drive.google.com/file/d/1vEydQjOefwC5yj5wPRZr5TanFEWJ2ca3/preview',
    parentIds: ['praktek-gas-kasir'],
    orderIndex: 21,
  },
]
