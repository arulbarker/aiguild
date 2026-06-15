import { NextResponse } from 'next/server'
import { createHmac, timingSafeEqual } from 'crypto'
import { prisma } from '@/lib/db'
import { computeNewExpiry } from '@/lib/membership'
import { isAiGuildProduct, extractEmail, extractOrderId, extractAmount } from '@/lib/mayar-webhook'

function verifySignature(payload, signature) {
  const expected = createHmac('sha256', process.env.MAYAR_WEBHOOK_SECRET)
    .update(payload)
    .digest('hex')
  try {
    return timingSafeEqual(Buffer.from(signature), Buffer.from(expected))
  } catch {
    return false
  }
}

export async function POST(request) {
  const rawBody = await request.text()
  const signature = request.headers.get('x-mayar-signature') ?? ''

  if (!verifySignature(rawBody, signature)) {
    return NextResponse.json({ error: 'Signature tidak valid' }, { status: 401 })
  }

  let payload
  try {
    payload = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Payload tidak valid' }, { status: 400 })
  }

  if (payload.event !== 'payment.received') {
    return NextResponse.json({ message: 'Event diabaikan' })
  }

  // Gerbang produk: cocokkan productId (utama) / productName (fallback) dari env.
  // Fail-closed — kalau env produk belum diset, webhook ditolak.
  const productMatch = isAiGuildProduct(payload, {
    productId: process.env.MAYAR_PRODUCT_ID,
    productName: process.env.MAYAR_PRODUCT_NAME,
  })
  if (!productMatch) {
    console.log('Webhook: produk bukan AI Guild, diabaikan', payload.data?.productId, payload.data?.productName)
    return NextResponse.json({ message: 'Produk lain diabaikan' })
  }

  const email = extractEmail(payload)
  const orderId = extractOrderId(payload)
  const amount = extractAmount(payload)

  if (!email) {
    return NextResponse.json({ error: 'Email tidak ditemukan di payload' }, { status: 400 })
  }

  // Lantai nominal opsional (default mati) — diskon voucher boleh bayar kurang.
  // Gerbang utama adalah kecocokan produk di atas, bukan nominal.
  const minAmount = Number(process.env.MAYAR_MIN_AMOUNT) || 0
  if (minAmount > 0 && amount != null && amount < minAmount) {
    console.warn('Webhook: nominal di bawah lantai', amount, '<', minAmount, 'order', orderId)
    return NextResponse.json({ error: 'Nominal pembayaran kurang' }, { status: 402 })
  }

  if (orderId) {
    const existing = await prisma.purchase.findFirst({ where: { orderId, source: 'mayar' } })
    if (existing) {
      return NextResponse.json({ message: 'Sudah diproses' })
    }
  }

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email },
  })

  const newExpiry = computeNewExpiry(user.membershipExpiredAt, new Date())

  await prisma.user.update({
    where: { id: user.id },
    data: { membershipExpiredAt: newExpiry, reminderSentAt: null },
  })

  await prisma.purchase.create({
    data: { userId: user.id, source: 'mayar', orderId },
  })

  return NextResponse.json({ message: 'OK' })
}
