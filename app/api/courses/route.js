import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

export async function GET() {
  const courses = await prisma.course.findMany({
    where: { isPublished: true },
    orderBy: { orderIndex: 'asc' },
    select: { slug: true, title: true, description: true, price: true, coverImage: true },
  })
  return NextResponse.json({ courses })
}
