import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Allow requests for API, static files, and image optimization
  if (path.startsWith('/api') || path.startsWith('/static') || path.startsWith('/_next') || path.endsWith('.png') || path.endsWith('.ico')) {
    return NextResponse.next()
  }

  // If trying to access the login page, let it through
  if (path === '/login') {
    return NextResponse.next()
  }

  // For all other pages, we'd ideally check for a valid session token (e.g., in a cookie).
  // Since this is a frontend prototype using localStorage, we can't check the auth state here on the server.
  // The client-side logic in AppLayout will handle the redirect if the user is not logged in.
  // In a real app with a backend, you would uncomment and adapt the logic below.

  /*
  const sessionCookie = request.cookies.get('session');
  if (!sessionCookie) {
    return NextResponse.redirect(new URL('/login', request.url))
  }
  */

  return NextResponse.next()
}

export const config = {
  matcher: [
    // Match all request paths except for the ones starting with:
    // - `api` (API routes)
    // - `_next/static` (static files)
    // - `_next/image` (image optimization files)
    // - `favicon.ico` (favicon file)
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
