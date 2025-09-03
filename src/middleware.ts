import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import * as jose from 'jose';

const protectedRoutes = ['/', '/dashboard', '/projects', '/tasks', '/team', '/clients', '/settings', '/workspaces', '/opportunities'];
const publicRoutes = ['/login'];

async function verifyToken(token: string, secret: Uint8Array) {
  try {
    await jose.jwtVerify(token, secret);
    return true;
  } catch (err) {
    return false;
  }
}

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname;
  const isProtectedRoute = protectedRoutes.includes(path) || path.startsWith('/project/') || path.startsWith('/workspace/');
  const isPublicRoute = publicRoutes.includes(path);

  const token = request.cookies.get('auth_token')?.value;
  const secret = new TextEncoder().encode(process.env.JWT_SECRET!);

  let isTokenValid = false;
  if (token) {
    isTokenValid = await verifyToken(token, secret);
  }

  if (isProtectedRoute && !isTokenValid) {
    // Redirect to login and clear the invalid cookie if it exists
    const response = NextResponse.redirect(new URL('/login', request.url));
    if(token) response.cookies.delete('auth_token');
    return response;
  }

  if (isPublicRoute && isTokenValid) {
    // If user is logged in and tries to access login page, redirect to dashboard
    return NextResponse.redirect(new URL('/', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // Match all request paths except for the ones starting with:
    // - api (API routes)
    // - _next/static (static files)
    // - _next/image (image optimization files)
    // - favicon.ico (favicon file)
    '/((?!api|_next/static|_next/image|favicon.ico|avatars).*)',
  ],
};
