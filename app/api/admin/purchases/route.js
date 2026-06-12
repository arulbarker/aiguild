import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'

export async function GET() {
  const session = await getSession()
  if (!session?.isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const purchases = await prisma.purchase.findMany({
    include: { user: { select: { email: true, name: true } } },
    orderBy: { purchasedAt: 'desc' },
  })

  return NextResponse.json({ purchases })
}
