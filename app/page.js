import { prisma } from '@/lib/db'
import LandingClient from '@/components/LandingClient'

// Render saat request (bukan prerender statis saat build) — halaman baca DB live.
export const dynamic = 'force-dynamic'

export default async function Home() {
  const payUrl = process.env.MAYAR_PAYMENT_URL || '#'

  const courses = await prisma.course.findMany({
    where: { isPublished: true },
    orderBy: { orderIndex: 'asc' },
    select: { slug: true, title: true, description: true, price: true, coverImage: true },
  })

  const flagship = courses[0] ?? null
  const flagshipModules = flagship
    ? await prisma.module.findMany({
        where: { course: { slug: flagship.slug } },
        orderBy: { orderIndex: 'asc' },
        select: { slug: true, title: true },
      })
    : []

  return (
    <LandingClient
      payUrl={payUrl}
      courses={courses}
      flagship={flagship}
      flagshipModules={flagshipModules}
    />
  )
}
