import { NextResponse } from 'next/server'
import { SignJWT } from 'jose'

export async function GET(request) {
  if (process.env.NODE_ENV !== 'development') {
    return NextResponse.json({ error: 'Tidak tersedia di production' }, { status: 403 })
  }

  const email = process.env.ADMIN_EMAIL
  if (!email) {
    return NextResponse.json({ error: 'ADMIN_EMAIL belum diset di .env.local' }, { status: 500 })
  }

  const secret = new TextEncoder().encode(process.env.JWT_SECRET)
  const token = await new SignJWT({ email, isAdmin: true })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .sign(secret)

  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'
  const res = NextResponse.redirect(new URL('/dashboard', appUrl))
  res.cookies.set('aiguild_session', token, {
    httpOnly: true,
    secure: false,
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })
  return res
}
