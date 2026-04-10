import { NextResponse, type NextRequest } from 'next/server';

import { getSafeNextPath, isAllowedEmail } from '@/lib/auth';
import { createSupabaseProxyClient } from '@/lib/supabase-proxy';

const PUBLIC_PATHS = ['/login', '/auth/callback', '/auth/signout'];

export async function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const isPublicPath = PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(`${path}/`));
  const isApiRoute = pathname.startsWith('/api/');
  const { supabase, getResponse } = createSupabaseProxyClient(request);
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const response = getResponse();
  const hasValidSupabaseUser = isAllowedEmail(user?.email);

  if (user && !isAllowedEmail(user.email)) {
    await supabase.auth.signOut();

    if (isApiRoute) {
      return withResponseCookies(response, NextResponse.json({ error: 'Unauthorized' }, { status: 401 }));
    }

    return withResponseCookies(
      response,
      NextResponse.redirect(new URL('/login?error=unauthorized', request.url))
    );
  }

  if (isPublicPath) {
    if (pathname === '/login' && hasValidSupabaseUser) {
      const nextPath = getSafeNextPath(request.nextUrl.searchParams.get('next'));
      return NextResponse.redirect(new URL(nextPath, request.url));
    }

    return response;
  }

  if (!hasValidSupabaseUser) {
    if (isApiRoute) {
      return withResponseCookies(response, NextResponse.json({ error: 'Unauthorized' }, { status: 401 }));
    }

    const loginUrl = new URL('/login', request.url);
    loginUrl.searchParams.set('next', `${pathname}${search}`);
    return withResponseCookies(response, NextResponse.redirect(loginUrl));
  }

  return response;
}

function withResponseCookies(source: NextResponse, target: NextResponse) {
  source.cookies.getAll().forEach((cookie) => {
    target.cookies.set(cookie);
  });

  return target;
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico|txt|xml)$).*)',
  ],
};
