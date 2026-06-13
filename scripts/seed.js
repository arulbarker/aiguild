import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'
import { MODULES_SEED } from '../lib/modules-seed.js'
import dotenv from 'dotenv'
import { resolve } from 'path'

dotenv.config({ path: resolve(process.cwd(), '.env.local') })

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

  console.log('Sinkronisasi modul...')

  const slugToId = {}

  // 1. Upsert tiap modul. Slug yang sudah ada → update (ID dipertahankan,
  //    jadi userProgress tetap nyambung). Slug baru → create.
  for (const mod of MODULES_SEED) {
    const { parentIds: _slugParentIds, ...rest } = mod

    const upserted = await prisma.module.upsert({
      where: { slug: mod.slug },
      update: { ...rest, parentIds: [] },
      create: { ...rest, parentIds: [] },
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
