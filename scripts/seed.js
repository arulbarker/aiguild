import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import { readFileSync } from 'node:fs'
import { MODULES_SEED, COURSES_SEED, DEFAULT_COURSE_SLUG } from '../lib/modules-seed.js'
import dotenv from 'dotenv'
import { resolve } from 'path'

dotenv.config({ path: resolve(process.cwd(), '.env.local') })

// Konten berat (HTML materi + teks prompt) disimpan sebagai file aset terpisah,
// dibaca saat seed (Node, fs aman) — supaya modules-seed.js tetap ringan dan
// tidak ikut membengkakkan bundle browser (LandingClient mengimpornya).
const readContent = (f) => readFileSync(resolve(process.cwd(), 'lib/card-content', f), 'utf8')
const CARD_CONTENT = {
  'tiga-file-ajaib': { htmlContent: readContent('tiga-file-ajaib.html') },
  'claude-md-global': { promptText: readContent('claude-md-global.txt') },
  'magic-prompt-init': { promptText: readContent('magic-prompt-init.txt') },
  'magic-prompt-existing': { promptText: readContent('magic-prompt-existing.txt') },
}

const { Pool } = pg
const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const adapter = new PrismaPg(pool)
const prisma = new PrismaClient({ adapter })

// Reset total HANYA kalau diminta eksplisit (SEED_RESET=true) — untuk dev.
// Default: mode aman, progress user TIDAK PERNAH disentuh.
const RESET = process.env.SEED_RESET === 'true'

async function main() {
  if (RESET) {
    console.log('⚠️  SEED_RESET=true — menghapus SEMUA modul & progress (mode dev)...')
    await prisma.userProgress.deleteMany()
    await prisma.module.deleteMany()
  } else {
    console.log('Mode aman: progress user dipertahankan.')
  }

  console.log('Sinkronisasi course...')
  const courseSlugToId = {}
  for (const c of COURSES_SEED) {
    const { slug, ...rest } = c
    const upserted = await prisma.course.upsert({
      where: { slug },
      // price & mayarProductId CREATE-ONLY (jadi milik admin setelah dibuat)
      update: { title: rest.title, description: rest.description, isPublished: rest.isPublished, orderIndex: rest.orderIndex },
      create: { slug, ...rest },
    })
    courseSlugToId[slug] = upserted.id
  }

  console.log('Sinkronisasi modul...')

  const slugToId = {}

  // 1. Upsert tiap modul. Slug yang sudah ada → update (ID dipertahankan,
  //    jadi userProgress tetap nyambung). Slug baru → create.
  //
  //    promptText = CREATE-ONLY: diisi sekali saat kartu dibuat, lalu jadi
  //    milik admin panel. update TIDAK menyertakan promptText agar editan
  //    admin tidak pernah ketimpa saat seed diulang. htmlContent tetap ikut
  //    update (sumber kebenaran = kode/IDE, menyebar saat npm run seed).
  for (const rawMod of MODULES_SEED) {
    const mod = { ...rawMod, ...(CARD_CONTENT[rawMod.slug] ?? {}) }
    const { parentIds: _slugParentIds, promptText, courseSlug, ...rest } = mod
    const courseId = courseSlugToId[courseSlug ?? DEFAULT_COURSE_SLUG]
    if (!courseId) throw new Error(`Course tidak ditemukan untuk modul ${mod.slug}: ${courseSlug ?? DEFAULT_COURSE_SLUG}`)

    const upserted = await prisma.module.upsert({
      where: { slug: mod.slug },
      update: { ...rest, courseId, parentIds: [] },
      create: { ...rest, courseId, promptText: promptText ?? null, parentIds: [] },
    })

    slugToId[mod.slug] = upserted.id
  }

  // 2. Set parentIds (resolve slug → id) setelah semua modul ada.
  for (const mod of MODULES_SEED) {
    if (mod.parentIds.length === 0) continue

    const parentIds = mod.parentIds.map((s) => {
      if (!slugToId[s]) throw new Error(`Slug parent tidak ditemukan: ${s}`)
      return slugToId[s]
    })

    await prisma.module.update({
      where: { slug: mod.slug },
      data: { parentIds },
    })
  }

  // 3. Bersihkan modul usang (tidak ada di seed) — TAPI hanya yang aman
  //    dihapus (tanpa progress user). Kalau ada progress → skip + peringatan.
  const seedSlugs = new Set(MODULES_SEED.map((m) => m.slug))
  const dbModules = await prisma.module.findMany({ select: { id: true, slug: true } })

  for (const m of dbModules) {
    if (seedSlugs.has(m.slug)) continue

    const progressCount = await prisma.userProgress.count({ where: { moduleId: m.id } })
    if (progressCount === 0) {
      await prisma.module.delete({ where: { id: m.id } })
      console.log(`  ↳ hapus modul usang (tanpa progress): ${m.slug}`)
    } else {
      console.log(`  ↳ SKIP hapus "${m.slug}" — masih ada ${progressCount} progress user`)
    }
  }

  console.log(`Selesai: ${MODULES_SEED.length} modul tersinkron.`)

  // Backfill satu kali (idempoten): sebelum fitur 'completed', setiap baris progress
  // berarti "selesai". Tandai true untuk progress lama (dibuat sebelum 16 Jun 2026)
  // agar progress user prod tidak hilang. Baris baru (view) tetap completed=false.
  const backfill = await prisma.userProgress.updateMany({
    where: { completed: false, lastViewedAt: { lt: new Date('2026-06-16T00:00:00Z') } },
    data: { completed: true },
  })
  if (backfill.count > 0) console.log(`Backfill progress lama → selesai: ${backfill.count} baris.`)

  const adminEmail = process.env.ADMIN_EMAIL
  if (adminEmail) {
    await prisma.user.upsert({
      where: { email: adminEmail },
      update: { isAdmin: true },
      create: { email: adminEmail, isAdmin: true },
    })
    console.log(`Admin user dipastikan: ${adminEmail}`)
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
    await pool.end()
  })
