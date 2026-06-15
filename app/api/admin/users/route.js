import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { prisma } from '@/lib/db'

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true, email: true, name: true, isAdmin: true,
      membershipExpiredAt: true, createdAt: true,
      purchases: { select: { source: true }, take: 1, orderBy: { purchasedAt: 'desc' } },
      _count: { select: { progress: true } },
    },
  })
  return NextResponse.json({ users })
}

export async function PATCH(request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { userId, isAdmin, membershipExpiredAt } = await request.json()
  if (!userId) return NextResponse.json({ error: 'userId diperlukan' }, { status: 400 })

  const data = {}
  if (typeof isAdmin === 'boolean') data.isAdmin = isAdmin
  if (membershipExpiredAt !== undefined) {
    data.membershipExpiredAt = membershipExpiredAt ? new Date(membershipExpiredAt) : null
    data.reminderSentAt = null
  }

  const user = await prisma.user.update({ where: { id: userId }, data })
  return NextResponse.json({ user })
}
