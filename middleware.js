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

  // Sudah login & buka halaman login → arahkan ke dashboard.
  // Catatan: "/" (etalase) TIDAK diredirect — user yang login tetap boleh
  // menjelajah katalog untuk beli kursus lain.
  if (pathname === '/login' && session) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  // Proteksi route yang butuh login (gerbang kepemilikan kursus ada di page).
  if (
    pathname.startsWith('/dashboard') ||
    pathname.startsWith('/modul') ||
    pathname.startsWith('/belajar')
  ) {
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
  matcher: ['/login', '/dashboard/:path*', '/modul/:path*', '/belajar/:path*', '/admin/:path*'],
}
