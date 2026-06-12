import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'
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

  // Tandai progress
  await prisma.userProgress.upsert({
    where: { userId_moduleId: { userId: session.userId, moduleId: mod.id } },
    update: { lastViewedAt: new Date() },
    create: { userId: session.userId, moduleId: mod.id },
  })

  const allModules = await prisma.module.findMany({ orderBy: { orderIndex: 'asc' } })
  const progress = await prisma.userProgress.findMany({ where: { userId: session.userId } })
  const completedIds = progress.map((p) => p.moduleId)

  return (
    <ModuleViewerWrapper
      module={mod}
      modules={allModules}
      completedIds={completedIds}
    />
  )
}
