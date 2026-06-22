import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { getOwnedCourseIds, hasCourseAccess } from '@/lib/ownership'
import LearnClient from './LearnClient'

export default async function BelajarPage({ params }) {
  const { courseSlug } = await params
  const session = await getSession()
  if (!session) redirect('/login')

  const course = await prisma.course.findUnique({ where: { slug: courseSlug } })
  if (!course) redirect('/dashboard')

  const ownedCourseIds = await getOwnedCourseIds(prisma, session.userId)
  if (!hasCourseAccess({ isAdmin: session.isAdmin, ownedCourseIds }, course.id)) {
    redirect(`/kursus/${courseSlug}`)
  }

  return <LearnClient courseSlug={courseSlug} courseTitle={course.title} />
}
