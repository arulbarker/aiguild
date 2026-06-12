import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

const globalForPrisma = globalThis

function createPrismaClient() {
  const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL })
  return new PrismaClient({ adapter })
}

export const prisma = new Proxy(
  {},
  {
    get(_, prop) {
      if (!globalForPrisma._prisma) {
        globalForPrisma._prisma = createPrismaClient()
      }
      return globalForPrisma._prisma[prop]
    },
  }
)
