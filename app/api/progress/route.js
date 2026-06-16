import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { isMembershipActive } from '@/lib/membership'

export async function POST(request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const user = await prisma.user.findUnique({ where: { id: session.userId } })
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  if (!session.isAdmin && !isMembershipActive(user.membershipExpiredAt, new Date())) {
    return NextResponse.json({ error: 'membership_expired' }, { status: 403 })
  }

  const { moduleId, completed } = await request.json()
  if (!moduleId) return NextResponse.json({ error: 'moduleId diperlukan' }, { status: 400 })

  // Buka modul = catat view (hapus badge). Tandai Selesai = set completed=true.
  // lastViewedAt selalu ikut diperbarui (kolom @updatedAt).
  await prisma.userProgress.upsert({
    where: { userId_moduleId: { userId: session.userId, moduleId } },
    update: completed === true ? { completed: true, lastViewedAt: new Date() } : { lastViewedAt: new Date() },
    create: { userId: session.userId, moduleId, completed: completed === true },
  })

  return NextResponse.json({ message: 'OK' })
}
