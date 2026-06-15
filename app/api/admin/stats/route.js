import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { prisma } from '@/lib/db'
import { summarizeMembers } from '@/lib/admin-stats'

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })

  const [users, modules, purchases, vouchers] = await Promise.all([
    prisma.user.findMany({ select: { membershipExpiredAt: true } }),
    prisma.module.count(),
    prisma.purchase.count(),
    prisma.voucher.count(),
  ])
  const members = summarizeMembers(users)
  return NextResponse.json({ members, modules, purchases, vouchers })
}
