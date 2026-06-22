import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getOwnedCourseIds, hasCourseAccess } from '@/lib/ownership'

export async function GET(request) {
  const session = await getSession()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(request.url)
  const courseSlug = searchParams.get('course')
  if (!courseSlug) return NextResponse.json({ error: 'course wajib' }, { status: 400 })

  const course = await prisma.course.findUnique({ where: { slug: courseSlug } })
  if (!course) return NextResponse.json({ error: 'Course tidak ditemukan' }, { status: 404 })

  const ownedCourseIds = await getOwnedCourseIds(prisma, session.userId)
  if (!hasCourseAccess({ isAdmin: session.isAdmin, ownedCourseIds }, course.id)) {
    return NextResponse.json({ error: 'not_owned' }, { status: 403 })
  }

  const [modules, progress] = await Promise.all([
    prisma.module.findMany({ where: { courseId: course.id }, orderBy: { orderIndex: 'asc' } }),
    prisma.userProgress.findMany({ where: { userId: session.userId } }),
  ])

  const completedIds = progress.filter((p) => p.completed).map((p) => p.moduleId)
  const viewed = progress.map((p) => ({ moduleId: p.moduleId, lastViewedAt: p.lastViewedAt }))
  return NextResponse.json({ course: { slug: course.slug, title: course.title }, modules, completedIds, viewed })
}
