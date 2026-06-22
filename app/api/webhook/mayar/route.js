import { NextResponse } from 'next/server'
import { createHash } from 'crypto'
import { prisma } from '@/lib/db'
import { matchCourseByProduct, extractEmail, extractOrderId, isValidMayarToken } from '@/lib/mayar-webhook'

export async function POST(request) {
  const rawBody = await request.text()

  const expectedToken = process.env.MAYAR_WEBHOOK_TOKEN
  if (!expectedToken) {
    console.error('Webhook Mayar: MAYAR_WEBHOOK_TOKEN belum diset — webhook ditolak')
    return NextResponse.json({ error: 'Webhook belum dikonfigurasi' }, { status: 500 })
  }
  const headers = {
    authorization: request.headers.get('authorization'),
    'x-webhook-token': request.headers.get('x-webhook-token'),
    'x-callback-token': request.headers.get('x-callback-token'),
    'x-gateway-token': request.headers.get('x-gateway-token'),
  }
  if (!isValidMayarToken(headers, expectedToken)) {
    return NextResponse.json({ error: 'Token webhook tidak valid' }, { status: 401 })
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

  // Gerbang produk via DB: productId → course. Fail-closed.
  // Tambah kursus baru = isi mayarProductId di admin, nol perubahan kode.
  const courses = await prisma.course.findMany({
    where: { mayarProductId: { not: null } },
    select: { id: true, slug: true, mayarProductId: true },
  })
  const course = matchCourseByProduct(courses, payload)
  if (!course) {
    console.log('Webhook: produk tak terpetakan ke course, diabaikan', payload.data?.productId)
    return NextResponse.json({ message: 'Produk tidak dikenal' })
  }

  const email = extractEmail(payload)
  const orderId = extractOrderId(payload)
  if (!email) {
    return NextResponse.json({ error: 'Email tidak ditemukan di payload' }, { status: 400 })
  }

  // Idempotency: orderId, atau hash body bila id tak ada. Per course (cegah dobel grant).
  const dedupKey = orderId || `body:${createHash('sha256').update(rawBody).digest('hex').slice(0, 32)}`
  const existing = await prisma.purchase.findFirst({
    where: { orderId: dedupKey, source: 'mayar', courseId: course.id },
  })
  if (existing) {
    return NextResponse.json({ message: 'Sudah diproses' })
  }

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email },
  })

  await prisma.purchase.create({
    data: { userId: user.id, courseId: course.id, source: 'mayar', orderId: dedupKey },
  })

  return NextResponse.json({ message: 'OK', course: course.slug })
}
