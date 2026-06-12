import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'

async function requireAdmin() {
  const session = await getSession()
  if (!session?.isAdmin) return null
  return session
}

export async function GET() {
  if (!await requireAdmin()) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const users = await prisma.user.findMany({
    include: {
      purchases: { orderBy: { purchasedAt: 'desc' }, take: 1 },
      _count: { select: { progress: true } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json({ users })
}

export async function PATCH(request) {
  if (!await requireAdmin()) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { userId, isAdmin } = await request.json()
  const updated = await prisma.user.update({
    where: { id: userId },
    data: { isAdmin },
  })

  return NextResponse.json({ user: updated })
}
