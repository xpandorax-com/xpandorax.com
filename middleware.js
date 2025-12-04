import { NextResponse } from 'next/server'

export function middleware(request) {
  const { pathname } = request.nextUrl
  
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/admin') ||
    pathname.includes('.')
  ) {
    return NextResponse.next()
  }

  const ageVerified = request.cookies.get('age_verified')?.value
  
  if (!ageVerified && pathname !== '/age-verification') {
    return NextResponse.redirect(new URL('/age-verification', request.url))
  }

  if (ageVerified && pathname === '/age-verification') {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\..*|api|admin).*)',
  ],
}
