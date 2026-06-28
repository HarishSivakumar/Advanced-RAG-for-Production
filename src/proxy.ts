import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export default function proxy(request: NextRequest) {
  // Protect admin dashboard route
  if (request.nextUrl.pathname.startsWith('/admin/dashboard')) {
    const adminToken = request.cookies.get('admin_token');
    if (!adminToken?.value) {
      return NextResponse.redirect(new URL('/admin', request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/dashboard/:path*'],
};
