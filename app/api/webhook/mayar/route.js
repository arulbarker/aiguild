import { NextResponse } from 'next/server'
import { createHmac, timingSafeEqual } from 'crypto'
import { prisma } from '@/lib/db'

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

  // Mayar mengirim event "payment.paid"
  if (payload.event !== 'payment.paid') {
    return NextResponse.json({ message: 'Event diabaikan' })
  }

  const email = payload.data?.customer?.email?.toLowerCase().trim()
  const orderId = payload.data?.transaction_id ?? null

  if (!email) {
    return NextResponse.json({ error: 'Email tidak ditemukan di payload' }, { status: 400 })
  }

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email },
  })

  if (orderId) {
    const existing = await prisma.purchase.findFirst({
      where: { orderId, source: 'mayar' },
    })
    if (!existing) {
      await prisma.purchase.create({
        data: { userId: user.id, source: 'mayar', orderId },
      })
    }
  } else {
    await prisma.purchase.create({
      data: { userId: user.id, source: 'mayar' },
    })
  }

  return NextResponse.json({ message: 'OK' })
}
