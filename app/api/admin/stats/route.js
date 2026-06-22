import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { prisma } from '@/lib/db'

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const [users, courses, modules, purchases, vouchers] = await Promise.all([
    prisma.user.count(),
    prisma.course.count(),
    prisma.module.count(),
    prisma.purchase.count({ where: { courseId: { not: null } } }),
    prisma.voucher.count(),
  ])
  return NextResponse.json({ users, courses, modules, purchases, vouchers })
}
