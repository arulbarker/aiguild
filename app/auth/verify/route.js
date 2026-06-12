import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { hashToken } from '@/lib/tokens'
import { createSession } from '@/lib/auth'

export async function GET(request) {
  const { searchParams } = new URL(request.url)
  const rawToken = searchParams.get('token')

  if (!rawToken) {
    return NextResponse.redirect(new URL('/login?error=invalid', request.url))
  }

  const hashedToken = hashToken(rawToken)

  const record = await prisma.magicToken.findUnique({ where: { token: hashedToken } })

  if (!record || record.used || record.expiresAt < new Date()) {
    return NextResponse.redirect(new URL('/login?error=expired', request.url))
  }

  // Tandai token sebagai sudah dipakai
  await prisma.magicToken.update({
    where: { id: record.id },
    data: { used: true },
  })

  const user = await prisma.user.findUnique({ where: { email: record.email } })
  if (!user) {
    return NextResponse.redirect(new URL('/login?error=invalid', request.url))
  }

  await createSession(user.id, user.isAdmin)

  return NextResponse.redirect(new URL('/dashboard', request.url))
}
