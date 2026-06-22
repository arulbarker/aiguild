import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'
import { notifyModule } from '@/lib/telegram'

const CONTENT_FIELDS = ['youtubeUrl', 'gammaUrl', 'promptText', 'htmlContent']

async function requireAdmin() {
  const session = await getSession()
  if (!session?.isAdmin) return null
  return session
}

export async function GET() {
  if (!await requireAdmin()) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const modules = await prisma.module.findMany({
    orderBy: { orderIndex: 'asc' },
    include: { course: { select: { slug: true, title: true } } },
  })
  return NextResponse.json({ modules })
}

export async function POST(request) {
  if (!await requireAdmin()) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json()
  const { title, slug, description, youtubeUrl, gammaUrl, promptText, htmlContent, parentIds, orderIndex, courseId } = body

  if (!title || !slug) {
    return NextResponse.json({ error: 'title dan slug wajib diisi' }, { status: 400 })
  }
  if (!courseId) {
    return NextResponse.json({ error: 'courseId wajib diisi (pilih kursus)' }, { status: 400 })
  }

  const mod = await prisma.module.create({
    data: { title, slug, description, youtubeUrl, gammaUrl, promptText, htmlContent, courseId, parentIds: parentIds ?? [], orderIndex: orderIndex ?? 0 },
  })

  // Notif modul baru (jangan gagalkan request kalau Telegram error).
  await notifyModule({ title: mod.title, slug: mod.slug, kind: 'baru' })

  return NextResponse.json({ module: mod })
}

export async function PATCH(request) {
  if (!await requireAdmin()) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json()
  const { id, ...data } = body

  // Kalau materi/video diubah: catat waktunya (untuk badge UPDATE) lalu notif.
  const contentChanged = CONTENT_FIELDS.some((f) => f in data)
  if (contentChanged) data.contentUpdatedAt = new Date()

  const mod = await prisma.module.update({ where: { id }, data })

  if (contentChanged) {
    await notifyModule({ title: mod.title, slug: mod.slug, kind: 'update' })
  }

  return NextResponse.json({ module: mod })
}

export async function DELETE(request) {
  if (!await requireAdmin()) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const { id } = await request.json()
  await prisma.module.delete({ where: { id } })
  return NextResponse.json({ message: 'Modul dihapus.' })
}
