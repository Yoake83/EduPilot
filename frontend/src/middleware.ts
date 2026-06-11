import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Routes that don't need auth
const PUBLIC_ROUTES = ['/login', '/register'];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Allow public routes through
  if (PUBLIC_ROUTES.some((route) => pathname.startsWith(route))) {
    return NextResponse.next();
  }

  // Check for token in cookies (set by the auth store via js-cookie)
  // We store a simple "has_token" cookie so middleware can read it
  // (localStorage is not accessible in middleware — see authStore for how this is set)
  const hasToken = request.cookies.get('edupilot_auth_token');

  if (!hasToken) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('from', pathname);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  // Run on all routes except Next.js internals and static files
  matcher: ['/((?!_next/static|_next/image|favicon.ico|api).*)'],
};