import { createServerClient } from '@supabase/ssr';
import { NextResponse, type NextRequest } from 'next/server';

const APP_ROUTES = ['/dashboard', '/analytics', '/transactions', '/categories', '/settings'];

export async function middleware(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabaseUrl = process.env['NEXT_PUBLIC_SUPABASE_URL'];
  const supabaseAnonKey = process.env['NEXT_PUBLIC_SUPABASE_ANON_KEY'];

  // If Supabase isn't configured yet, allow requests through (we still let the
  // client/server pages render; protected pages should handle their own state).
  if (!supabaseUrl || !supabaseAnonKey) {
    return supabaseResponse;
  }

  const supabase = createServerClient(supabaseUrl, supabaseAnonKey, {
    cookies: {
      getAll: () => request.cookies.getAll(),
      setAll: (cookiesToSet) => {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
        supabaseResponse = NextResponse.next({ request });
        cookiesToSet.forEach(({ name, value, options }) =>
          supabaseResponse.cookies.set(name, value, options),
        );
      },
    },
  });

  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { pathname } = request.nextUrl;

  const isAppRoute = APP_ROUTES.some((p) => pathname === p || pathname.startsWith(`${p}/`));
  const isAuthRoute = pathname.startsWith('/auth/');

  if (isAppRoute && !user) {
    return NextResponse.redirect(new URL('/auth/login', request.url));
  }

  if (
    isAuthRoute &&
    user &&
    !pathname.startsWith('/auth/callback') &&
    !pathname.startsWith('/auth/confirm') &&
    !pathname.startsWith('/auth/reset-password')
  ) {
    return NextResponse.redirect(new URL('/dashboard', request.url));
  }

  return supabaseResponse;
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
