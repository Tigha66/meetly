import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Proxy (formerly middleware) to protect dashboard routes.
 * Unauthenticated users are redirected to /login.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const sessionToken = request.cookies.get('sb-access-token')?.value;

  const isProtected = pathname.startsWith('/dashboard');
  const isAuthPage = pathname.startsWith('/login') || pathname.startsWith('/signup');
  const isApi = pathname.startsWith('/api');

  // Always allow API routes and public pages
  if (isApi) {
    return NextResponse.next();
  }

  // If accessing a dashboard page without a session token, redirect to login
  if (isProtected && !sessionToken) {
    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // If accessing login/signup with a session, redirect to dashboard
  if (isAuthPage && sessionToken) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/login',
    '/signup',
    '/((?!_next/static|_next/image|favicon.ico|api/|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)',
  ],
};
