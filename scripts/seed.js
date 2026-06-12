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

async function main() {
  console.log('Seeding modules...')

  const slugToId = {}

  for (const mod of MODULES_SEED) {
    const { parentIds: slugParentIds, ...rest } = mod

    const upserted = await prisma.module.upsert({
      where: { slug: mod.slug },
      update: { ...rest, parentIds: [] },
      create: { ...rest, parentIds: [] },
    })

    slugToId[mod.slug] = upserted.id
  }

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

  console.log(`Selesai: ${MODULES_SEED.length} modul di-seed.`)

  const adminEmail = process.env.ADMIN_EMAIL
  if (adminEmail) {
    await prisma.user.upsert({
      where: { email: adminEmail },
      update: { isAdmin: true },
      create: { email: adminEmail, isAdmin: true },
    })
    console.log(`Admin user dibuat: ${adminEmail}`)
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
