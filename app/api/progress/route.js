import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getOwnedCourseIds, hasCourseAccess } from '@/lib/ownership'

export async function POST(request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { moduleId, completed } = await request.json()
  if (!moduleId) return NextResponse.json({ error: 'moduleId diperlukan' }, { status: 400 })

  const mod = await prisma.module.findUnique({ where: { id: moduleId }, select: { courseId: true } })
  if (!mod) return NextResponse.json({ error: 'Modul tidak ditemukan' }, { status: 404 })

  const ownedCourseIds = await getOwnedCourseIds(prisma, session.userId)
  if (!hasCourseAccess({ isAdmin: session.isAdmin, ownedCourseIds }, mod.courseId)) {
    return NextResponse.json({ error: 'not_owned' }, { status: 403 })
  }

  // Buka modul = catat view (hapus badge). Tandai Selesai = set completed=true.
  // lastViewedAt selalu ikut diperbarui (kolom @updatedAt).
  await prisma.userProgress.upsert({
    where: { userId_moduleId: { userId: session.userId, moduleId } },
    update: completed === true ? { completed: true, lastViewedAt: new Date() } : { lastViewedAt: new Date() },
    create: { userId: session.userId, moduleId, completed: completed === true },
  })

  return NextResponse.json({ message: 'OK' })
}
