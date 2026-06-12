import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function POST(request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { moduleId } = await request.json()
  if (!moduleId) return NextResponse.json({ error: 'moduleId diperlukan' }, { status: 400 })

  await prisma.userProgress.upsert({
    where: { userId_moduleId: { userId: session.userId, moduleId } },
    update: { lastViewedAt: new Date() },
    create: { userId: session.userId, moduleId },
  })

  return NextResponse.json({ message: 'OK' })
}
