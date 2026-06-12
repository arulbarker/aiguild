import { NextResponse } from 'next/server'
import { jwtVerify } from 'jose'

const COOKIE_NAME = 'aiguild_session'

function getSecret() {
  return new TextEncoder().encode(process.env.JWT_SECRET)
}

export async function middleware(request) {
  const { pathname } = request.nextUrl
  const token = request.cookies.get(COOKIE_NAME)?.value

  let session = null
  if (token) {
    try {
      const { payload } = await jwtVerify(token, getSecret())
      session = payload
    } catch {
      // token invalid atau expired
    }
  }

  // Redirect ke dashboard kalau sudah login dan buka /login
  if (pathname === '/login' && session) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Proteksi route /dashboard dan /modul
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/modul')) {
    if (!session) {
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }

  // Proteksi route /admin
  if (pathname.startsWith('/admin')) {
    if (!session || !session.isAdmin) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/login', '/dashboard/:path*', '/modul/:path*', '/admin/:path*'],
}
