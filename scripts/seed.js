import { PrismaClient } from '@prisma/client'
import { MODULES_SEED } from '../lib/modules-seed.js'
import dotenv from 'dotenv'
import { resolve } from 'path'

dotenv.config({ path: resolve(process.cwd(), '.env.local') })

const prisma = new PrismaClient()

async function main() {
  console.log('Seeding modules...')

  // Slug-to-ID map untuk resolusi parentIds
  const slugToId = {}

  for (const mod of MODULES_SEED) {
    const { parentIds: slugParentIds, ...rest } = mod

    const upserted = await prisma.module.upsert({
      where: { slug: mod.slug },
      update: { ...rest, parentIds: [] }, // parentIds diupdate pass kedua
      create: { ...rest, parentIds: [] },
    })

    slugToId[mod.slug] = upserted.id
  }

  // Update parentIds setelah semua modul terbuat
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

  // Seed admin user kalau ada ADMIN_EMAIL di env
  const adminEmail = process.env.ADMIN_EMAIL
  if (adminEmail) {
    await prisma.user.upsert({
      where: { email: adminEmail },
      update: { isAdmin: true },
      create: { email: adminEmail, isAdmin: true },
    })
    console.log(`Admin user: ${adminEmail}`)
  }
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
