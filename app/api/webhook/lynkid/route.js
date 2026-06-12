import { NextResponse } from 'next/server'
import { createHmac, timingSafeEqual } from 'crypto'
import { prisma } from '@/lib/db'

function verifySignature(payload, signature) {
  const expected = createHmac('sha256', process.env.LYNKID_WEBHOOK_SECRET)
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
  const signature = request.headers.get('x-lynkid-signature') ?? ''

  if (!verifySignature(rawBody, signature)) {
    return NextResponse.json({ error: 'Signature tidak valid' }, { status: 401 })
  }

  let payload
  try {
    payload = JSON.parse(rawBody)
  } catch {
    return NextResponse.json({ error: 'Payload tidak valid' }, { status: 400 })
  }

  // Lynk.id mengirim event "payment.success" dengan customer_email
  if (payload.event !== 'payment.success') {
    return NextResponse.json({ message: 'Event diabaikan' })
  }

  const email = payload.data?.customer_email?.toLowerCase().trim()
  const orderId = payload.data?.order_id ?? null

  if (!email) {
    return NextResponse.json({ error: 'Email tidak ditemukan di payload' }, { status: 400 })
  }

  // Upsert user — buat jika belum ada
  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email },
  })

  // Catat pembelian (idempoten — skip jika orderId sudah ada)
  if (orderId) {
    const existing = await prisma.purchase.findFirst({
      where: { orderId, source: 'lynkid' },
    })
    if (!existing) {
      await prisma.purchase.create({
        data: { userId: user.id, source: 'lynkid', orderId },
      })
    }
  } else {
    await prisma.purchase.create({
      data: { userId: user.id, source: 'lynkid' },
    })
  }

  return NextResponse.json({ message: 'OK' })
}
