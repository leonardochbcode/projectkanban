import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  // `withAuth` augments your `Request` with the user's token.
  function middleware(req) {
    const token = req.nextauth.token;
    const url = req.nextUrl;

    // If the user is a "Convidado" (Guest)
    if (token?.userType === 'Convidado') {
      // And they are trying to access any page that does not start with /workspaces
      if (!url.pathname.startsWith('/workspaces')) {
        // Redirect them to the /workspaces page
        return NextResponse.redirect(new URL('/workspaces', req.url));
      }
    }
  },
  {
    callbacks: {
      // This is required for the middleware function to be invoked.
      authorized: ({ token }) => !!token,
    },
  }
);

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - login (the login page)
     * - any other file with a dot (e.g. .png)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|login|.*\\..*).*)',
  ],
};