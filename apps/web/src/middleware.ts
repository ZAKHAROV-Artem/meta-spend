import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const isLoggedIn = !!req.auth;
  const { pathname } = req.nextUrl;

  const isAppRoute =
    pathname.startsWith('/analytics') ||
    pathname.startsWith('/transactions') ||
    pathname.startsWith('/categories') ||
    pathname.startsWith('/settings');

  const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/register');

  if (isAppRoute && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  if (isAuthRoute && isLoggedIn) {
    return NextResponse.redirect(new URL('/transactions', req.url));
  }
});

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
};
