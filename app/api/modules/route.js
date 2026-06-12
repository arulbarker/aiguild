import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET() {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const [modules, progress] = await Promise.all([
    prisma.module.findMany({ orderBy: { orderIndex: 'asc' } }),
    prisma.userProgress.findMany({ where: { userId: session.userId } }),
  ])

  const completedIds = progress.map((p) => p.moduleId)

  return NextResponse.json({ modules, completedIds })
}
