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
  const courses = await prisma.course.findMany({
    orderBy: { orderIndex: 'asc' },
    include: { _count: { select: { modules: true } } },
  })
  return NextResponse.json({ courses })
}

export async function POST(request) {
  if (!await requireAdmin()) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  const body = await request.json()
  const { title, slug, description, price, mayarProductId, isPublished, orderIndex } = body
  if (!title || !slug) {
    return NextResponse.json({ error: 'title dan slug wajib diisi' }, { status: 400 })
  }
  const course = await prisma.course.create({
    data: {
      title,
      slug,
      description: description || null,
      price: Number(price) || 0,
      mayarProductId: mayarProductId || null,
      isPublished: isPublished ?? false,
      orderIndex: Number(orderIndex) || 0,
    },
  })
  return NextResponse.json({ course })
}

export async function PATCH(request) {
  if (!await requireAdmin()) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  const body = await request.json()
  const { id, ...data } = body
  if (!id) return NextResponse.json({ error: 'id wajib' }, { status: 400 })
  if ('price' in data) data.price = Number(data.price) || 0
  if ('orderIndex' in data) data.orderIndex = Number(data.orderIndex) || 0
  if ('mayarProductId' in data) data.mayarProductId = data.mayarProductId || null
  if ('description' in data) data.description = data.description || null
  const course = await prisma.course.update({ where: { id }, data })
  return NextResponse.json({ course })
}

export async function DELETE(request) {
  if (!await requireAdmin()) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  const { id } = await request.json()
  const count = await prisma.module.count({ where: { courseId: id } })
  if (count > 0) {
    return NextResponse.json({ error: `Tidak bisa hapus: kursus masih punya ${count} modul. Pindahkan/hapus modul dulu.` }, { status: 400 })
  }
  await prisma.course.delete({ where: { id } })
  return NextResponse.json({ message: 'Kursus dihapus.' })
}
