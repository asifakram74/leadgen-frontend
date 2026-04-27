// proxy.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip middleware for static files, images, and api routes
  if (
    pathname.startsWith('/_next') || 
    pathname.includes('/api/') || 
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  const token = request.cookies.get('token')?.value || request.headers.get('Authorization')?.replace('Bearer ', '');
  
  const protectedPaths = ['/leads', '/profile', '/users'];
  const isProtectedPath = protectedPaths.some(path => pathname.startsWith(path));

  // If trying to access a protected path without a token
  if (isProtectedPath && !token) {
    console.log(`[Proxy] Redirecting UNAUTHORIZED access to ${pathname} -> /login`);
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // If logged in and trying to access guest paths (login/register)
  const guestPaths = ['/login', '/register'];
  if (guestPaths.some(path => pathname.startsWith(path)) && token) {
    console.log(`[Proxy] Redirecting AUTHENTICATED user from ${pathname} -> /leads`);
    return NextResponse.redirect(new URL('/leads', request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/leads/:path*', '/profile/:path*', '/users/:path*', '/login', '/register'],
};