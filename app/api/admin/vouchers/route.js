import { NextResponse } from 'next/server'
import { requireAdmin } from '@/lib/admin'
import { prisma } from '@/lib/db'
import { createMayarCoupon } from '@/lib/mayar-api'

export async function GET() {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const vouchers = await prisma.voucher.findMany({ orderBy: { createdAt: 'desc' } })
  return NextResponse.json({ vouchers })
}

export async function POST(request) {
  if (!(await requireAdmin())) return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  const body = await request.json()
  const { name, code, discountType, value, minimumPurchase, totalCoupons, couponType, expiredAt } = body

  if (!name || !code || !discountType || !value || !totalCoupons || !couponType || !expiredAt) {
    return NextResponse.json({ error: 'Field wajib kurang' }, { status: 400 })
  }
  if (!['monetary', 'percentage'].includes(discountType)) {
    return NextResponse.json({ error: 'discountType tidak valid' }, { status: 400 })
  }

  const existing = await prisma.voucher.findUnique({ where: { code } })
  if (existing) return NextResponse.json({ error: 'Kode voucher sudah dipakai' }, { status: 409 })

  let mayar
  try {
    mayar = await createMayarCoupon({
      name, code, discountType, value: Number(value),
      minimumPurchase: Number(minimumPurchase) || 0,
      totalCoupons: Number(totalCoupons), couponType, expiredAt,
    })
  } catch (e) {
    return NextResponse.json({ error: `Gagal di Mayar: ${e.message}` }, { status: 502 })
  }

  const voucher = await prisma.voucher.create({
    data: {
      code, name, discountType, value: Number(value),
      minimumPurchase: Number(minimumPurchase) || 0,
      totalCoupons: Number(totalCoupons), couponType,
      expiredAt: new Date(expiredAt), mayarId: mayar?.id ?? null,
    },
  })
  return NextResponse.json({ voucher })
}
