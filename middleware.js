import { NextResponse } from 'next/server'

export function middleware(request) {
  const ageVerified = request.cookies.get('age_verified')
  const pathname = request.nextUrl.pathname

  // Skip middleware for static files, API routes, admin routes, and public assets
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/manifest') ||
    pathname.startsWith('/robots') ||
    pathname.startsWith('/sitemap') ||
    pathname.match(/\.(ico|png|jpg|jpeg|svg|webp|gif|woff|woff2|ttf|eot)$/)
  ) {
    return NextResponse.next()
  }

  // If not verified and not on age gate page, redirect to age gate
  if (!ageVerified && pathname !== '/age-gate') {
    return NextResponse.redirect(new URL('/age-gate', request.url))
  }

  // If verified and on age gate page, redirect to home
  if (ageVerified && pathname === '/age-gate') {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|images|manifest.json|robots.txt|sitemap.xml).*)',
  ],
}
