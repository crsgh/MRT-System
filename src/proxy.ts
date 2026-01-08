import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get token from cookies
  const token = request.cookies.get('token')?.value;

  // Protect admin routes (only admins can access the web interface)
  if (pathname.startsWith('/admin')) {
    if (!token) {
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }

    // Role checking is done in the actual pages/API routes
  }

  // Redirect authenticated admin users away from login
  if (pathname === '/login' && token) {
    const adminUrl = new URL('/admin', request.url);
    return NextResponse.redirect(adminUrl);
  }

  // Redirect root to admin (this is an admin-only interface)
  if (pathname === '/') {
    if (token) {
      const adminUrl = new URL('/admin', request.url);
      return NextResponse.redirect(adminUrl);
    } else {
      const loginUrl = new URL('/login', request.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/login'],
};