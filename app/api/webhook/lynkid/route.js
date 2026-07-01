import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import {
  isValidSharedSecret,
  matchCourseByTitle,
  extractLynkidEmail,
  extractLynkidProductTitle,
} from '@/lib/lynkid-webhook'

export async function POST(request) {
  const expected = process.env.LYNKID_SHARED_SECRET
  if (!expected) {
    console.error('Webhook Lynk.id: LYNKID_SHARED_SECRET belum diset — ditolak')
    return NextResponse.json({ error: 'Webhook belum dikonfigurasi' }, { status: 500 })
  }

  const provided = request.headers.get('x-shared-secret') ?? ''
  if (!isValidSharedSecret(provided, expected)) {
    return NextResponse.json({ error: 'Secret tidak valid' }, { status: 401 })
  }

  let payload
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ error: 'Payload tidak valid' }, { status: 400 })
  }

  if (payload.event !== 'lynkid_purchase') {
    return NextResponse.json({ message: 'Event diabaikan' })
  }

  const email = extractLynkidEmail(payload)
  if (!email) {
    return NextResponse.json({ error: 'Email tidak ditemukan di payload' }, { status: 400 })
  }
  const productTitle = extractLynkidProductTitle(payload)

  // Gerbang produk via DB: judul produk Lynk.id → course. Fail-closed.
  // Tambah kursus baru = isi lynkidProductTitle, nol perubahan kode.
  const courses = await prisma.course.findMany({
    where: { lynkidProductTitle: { not: null } },
    select: { id: true, slug: true, lynkidProductTitle: true },
  })
  const course = matchCourseByTitle(courses, productTitle)
  if (!course) {
    console.log('Webhook Lynk.id: produk tak terpetakan ke course, diabaikan:', productTitle)
    return NextResponse.json({ message: 'Produk tidak dikenal' })
  }

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: { email },
  })

  // Idempoten per (user, course): sekali beli = sekali akses. Kirim ulang → skip.
  const existing = await prisma.purchase.findFirst({
    where: { userId: user.id, courseId: course.id, source: 'lynkid' },
  })
  if (existing) {
    return NextResponse.json({ message: 'Sudah diproses', course: course.slug })
  }

  await prisma.purchase.create({
    data: { userId: user.id, courseId: course.id, source: 'lynkid' },
  })

  return NextResponse.json({ message: 'OK', course: course.slug })
}
