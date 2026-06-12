import { NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { prisma } from '@/lib/db'

async function requireAdmin() {
  const session = await getSession()
  if (!session?.isAdmin) return null
  return session
}

export async function GET() {
  if (!await requireAdmin()) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const modules = await prisma.module.findMany({ orderBy: { orderIndex: 'asc' } })
  return NextResponse.json({ modules })
}

export async function POST(request) {
  if (!await requireAdmin()) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json()
  const { title, slug, description, youtubeUrl, gammaUrl, parentIds, orderIndex } = body

  if (!title || !slug) {
    return NextResponse.json({ error: 'title dan slug wajib diisi' }, { status: 400 })
  }

  const mod = await prisma.module.create({
    data: { title, slug, description, youtubeUrl, gammaUrl, parentIds: parentIds ?? [], orderIndex: orderIndex ?? 0 },
  })

  return NextResponse.json({ module: mod })
}

export async function PATCH(request) {
  if (!await requireAdmin()) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const body = await request.json()
  const { id, ...data } = body

  const mod = await prisma.module.update({ where: { id }, data })
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
