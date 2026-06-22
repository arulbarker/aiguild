import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { prisma } from '@/lib/db'

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const users = await prisma.user.findMany({
    orderBy: { createdAt: 'desc' },
    select: {
      id: true, email: true, name: true, isAdmin: true, createdAt: true,
      purchases: {
        where: { courseId: { not: null } },
        select: { courseId: true, source: true, course: { select: { slug: true, title: true } } },
      },
      _count: { select: { progress: true } },
    },
  })
  return NextResponse.json({ users })
}

export async function PATCH(request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const { userId, isAdmin, action, courseId } = await request.json()
  if (!userId) return NextResponse.json({ error: 'userId diperlukan' }, { status: 400 })

  // Toggle admin
  if (typeof isAdmin === 'boolean') {
    const user = await prisma.user.update({ where: { id: userId }, data: { isAdmin } })
    return NextResponse.json({ user })
  }

  // Beri / cabut akses kursus
  if (action === 'grant' && courseId) {
    const existing = await prisma.purchase.findFirst({ where: { userId, courseId } })
    if (!existing) {
      await prisma.purchase.create({ data: { userId, courseId, source: 'admin' } })
    }
    return NextResponse.json({ message: 'Akses diberikan' })
  }
  if (action === 'revoke' && courseId) {
    await prisma.purchase.deleteMany({ where: { userId, courseId } })
    return NextResponse.json({ message: 'Akses dicabut' })
  }

  return NextResponse.json({ error: 'Aksi tidak dikenal' }, { status: 400 })
}
