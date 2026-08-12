import { withAuth } from 'next-auth/middleware';
import { NextResponse } from 'next/server';

export default withAuth(
  function middleware(req) {
    const token = req.nextauth.token;
    const path = req.nextUrl.pathname;

    console.log('[auth:middleware] path:', path, 'method:', req.method, 'has token:', !!token, 'has id:', token?.id || 'N/A', 'role:', token?.role || 'N/A');

    // Allow POST with server action header only
    if (req.method === 'POST' && req.headers.get('next-action')) {
      return NextResponse.next();
    }

    if (!token) {
      console.log('[auth:middleware] No token, redirecting to / from:', path);
      return NextResponse.redirect(new URL('/', req.url));
    }

    // Superadmin-only routes
    if (path.startsWith('/superadmin')) {
      if (token?.role !== 'superadmin') {
        console.log('[auth:middleware] Non-superadmin blocked on:', path, 'role:', token?.role);
        return NextResponse.redirect(new URL('/', req.url));
      }
    }

    // Admin and Superadmin routes
    if (path.startsWith('/properties/add') || path.startsWith('/admin') || path.match(/\/properties\/[^/]+\/edit/)) {
      if (token?.role !== 'admin' && token?.role !== 'superadmin') {
        console.log('[auth:middleware] Non-admin/superadmin blocked on:', path, 'role:', token?.role);
        return NextResponse.redirect(new URL('/properties', req.url));
      }
    }

    return NextResponse.next();
  },
  {
    callbacks: {
      authorized: ({ req, token }) => {
        if (req.method === 'POST' && req.headers.get('next-action')) return true;
        console.log('[auth:middleware] authorized check, token:', !!token, 'path:', req.nextUrl.pathname);
        return !!token;
      },
    },
  }
);

export const config = {
  matcher: ['/properties/add', '/properties/:id/edit', '/admin/:path*', '/superadmin/:path*'],
};
