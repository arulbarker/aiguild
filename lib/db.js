import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import pg from 'pg'

const { Pool } = pg
const globalForPrisma = globalThis

function createPrismaClient() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL })
  const adapter = new PrismaPg(pool)
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
