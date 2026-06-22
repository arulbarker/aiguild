import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getOwnedCourseIds, hasCourseAccess } from '@/lib/ownership'
import ModuleViewerWrapper from './ModuleViewerWrapper'

export async function generateMetadata({ params }) {
  const { slug } = await params
  const mod = await prisma.module.findUnique({ where: { slug } })
  return { title: mod ? `${mod.title} — AI Guild` : 'AI Guild' }
}

export default async function ModulPage({ params }) {
  const session = await getSession()
  if (!session) redirect('/login')

  const { slug } = await params
  const mod = await prisma.module.findUnique({ where: { slug } })
  if (!mod) redirect('/dashboard')

  const ownedCourseIds = await getOwnedCourseIds(prisma, session.userId)
  if (!hasCourseAccess({ isAdmin: session.isAdmin, ownedCourseIds }, mod.courseId)) {
    const course = await prisma.course.findUnique({ where: { id: mod.courseId }, select: { slug: true } })
    redirect(course ? `/kursus/${course.slug}` : '/dashboard')
  }

  // Tandai progress (modul dibuka)
  await prisma.userProgress.upsert({
    where: { userId_moduleId: { userId: session.userId, moduleId: mod.id } },
    update: { lastViewedAt: new Date() },
    create: { userId: session.userId, moduleId: mod.id },
  })

  const allModules = await prisma.module.findMany({ where: { courseId: mod.courseId }, orderBy: { orderIndex: 'asc' } })
  const progress = await prisma.userProgress.findMany({ where: { userId: session.userId } })
  const completedIds = progress.filter((p) => p.completed).map((p) => p.moduleId)

  return (
    <ModuleViewerWrapper
      module={mod}
      modules={allModules}
      completedIds={completedIds}
    />
  )
}
