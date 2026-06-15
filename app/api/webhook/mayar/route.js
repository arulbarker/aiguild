import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { computeNewExpiry } from '@/lib/membership'
import { isAiGuildProduct, extractEmail, extractOrderId, extractAmount, isValidMayarToken } from '@/lib/mayar-webhook'

export async function POST(request) {
  const rawBody = await request.text()

  // Mayar mengautentikasi webhook dengan token statis di header Authorization: Bearer <token>.
  // Diperiksa hanya kalau MAYAR_WEBHOOK_TOKEN diset — supaya tidak getas bila Mayar
  // ternyata tak mengirim token. Gerbang utama lain: filter produk di bawah.
  const expectedToken = process.env.MAYAR_WEBHOOK_TOKEN
  if (expectedToken) {
    const headers = {
      authorization: request.headers.get('authorization'),
      'x-webhook-token': request.headers.get('x-webhook-token'),
      'x-callback-token': request.headers.get('x-callback-token'),
    }
    if (!isValidMayarToken(headers, expectedToken)) {
      return NextResponse.json({ error: 'Token webhook tidak valid' }, { status: 401 })
    }
  } else {
    console.warn('Webhook Mayar: MAYAR_WEBHOOK_TOKEN belum diset — proteksi token dilewati, andalkan filter produk')
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
