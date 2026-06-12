import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis

function createPrismaClient() {
  return new PrismaClient()
}

// Lazy proxy: PrismaClient tidak dibuat saat module diimport,
// tapi saat pertama kali properti diakses (misalnya prisma.user.findMany)
function getLazyClient() {
  if (!globalForPrisma._prisma) {
    globalForPrisma._prisma = createPrismaClient()
  }
  return globalForPrisma._prisma
}

export const prisma = new Proxy(
  {},
  {
    get(_, prop) {
      return getLazyClient()[prop]
    },
  }
)
