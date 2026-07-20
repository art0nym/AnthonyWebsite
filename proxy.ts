import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { ADMIN_SESSION_COOKIE, ADMIN_SESSION_TOKEN } from '@/lib/admin-auth';

const PUBLIC_FILE = /\.(.*)$/;

function isStaticRequest(pathname: string) {
  return (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/images') ||
    pathname === '/favicon.ico' ||
    PUBLIC_FILE.test(pathname)
  );
}

function externalAdminPath(pathname: string, adminHost: boolean) {
  if (!adminHost) {
    return pathname;
  }

  const stripped = pathname.replace(/^\/admin/, '');
  return stripped === '' ? '/' : stripped;
}

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const host = request.headers.get('host') ?? '';
  const isAdminHost = host.startsWith('admin.');

  if (isStaticRequest(pathname) || pathname.startsWith('/api')) {
    return NextResponse.next();
  }

  const internalPath = isAdminHost && !pathname.startsWith('/admin')
    ? `/admin${pathname === '/' ? '' : pathname}`
    : pathname;

  if (internalPath.startsWith('/admin')) {
    const isLoginRoute = internalPath === '/admin/login';
    const isAuthed = request.cookies.get(ADMIN_SESSION_COOKIE)?.value === ADMIN_SESSION_TOKEN;

    if (!isAuthed && !isLoginRoute) {
      const loginPath = isAdminHost ? '/login' : '/admin/login';
      const requestedPath = externalAdminPath(internalPath, isAdminHost);
      const redirectUrl = new URL(loginPath, request.url);
      if (requestedPath !== '/') {
        redirectUrl.searchParams.set('next', `${requestedPath}${search}`);
      }
      return NextResponse.redirect(redirectUrl);
    }

    if (isAuthed && isLoginRoute) {
      const destination = new URL(isAdminHost ? '/' : '/admin', request.url);
      return NextResponse.redirect(destination);
    }
  }

  if (internalPath !== pathname) {
    const rewriteUrl = request.nextUrl.clone();
    rewriteUrl.pathname = internalPath;
    return NextResponse.rewrite(rewriteUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)'],
};