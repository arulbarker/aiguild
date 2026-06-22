import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// Baca DB live → jangan di-prerender statis saat build.
export const dynamic = 'force-dynamic'

export async function GET() {
  const courses = await prisma.course.findMany({
    where: { isPublished: true },
    orderBy: { orderIndex: 'asc' },
    select: { slug: true, title: true, description: true, price: true, coverImage: true },
  })
  return NextResponse.json({ courses })
}
