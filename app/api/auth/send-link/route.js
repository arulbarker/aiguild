import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { generateToken, hashToken } from '@/lib/tokens'
import { sendMagicLink } from '@/lib/email'

export async function POST(request) {
  try {
    const { email } = await request.json()

    if (!email || !email.includes('@')) {
      return NextResponse.json({ error: 'Email tidak valid' }, { status: 400 })
    }

    const normalizedEmail = email.toLowerCase().trim()

    const user = await prisma.user.findUnique({ where: { email: normalizedEmail } })
    if (!user) {
      return NextResponse.json(
        { error: 'Email belum terdaftar. Silakan beli akses terlebih dahulu.' },
        { status: 403 }
      )
    }

    // Hapus token lama yang belum expired untuk email ini
    await prisma.magicToken.deleteMany({
      where: { email: normalizedEmail, used: false },
    })

    const rawToken = generateToken()
    const hashedToken = hashToken(rawToken)
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 menit

    await prisma.magicToken.create({
      data: { email: normalizedEmail, token: hashedToken, expiresAt },
    })

    // Di dev mode, kembalikan URL langsung ke browser — tidak perlu email
    if (process.env.NODE_ENV === 'development') {
      const devUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/verify?token=${rawToken}`
      console.log('\n🔗 DEV MAGIC LINK:', devUrl, '\n')
      return NextResponse.json({ message: 'Link masuk sudah dikirim ke email kamu.', devUrl })
    }

    await sendMagicLink(normalizedEmail, rawToken)

    return NextResponse.json({ message: 'Link masuk sudah dikirim ke email kamu.' })
  } catch (error) {
    console.error('send-link error:', error)
    return NextResponse.json({ error: 'Terjadi kesalahan. Coba lagi.' }, { status: 500 })
  }
}
