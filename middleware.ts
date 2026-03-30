import { NextRequest, NextResponse } from 'next/server'; 
import { ADMIN_SESSION_COOKIE, isValidAdminToken } from './src/lib/adminAuth'; 
 
const isBypassedPath = (pathname: string): boolean =>  
  pathname === '/admin/login' || 
  pathname === '/api/admin/login' || 
  pathname === '/api/admin/logout'; 
 
const setNoStoreHeaders = (response: NextResponse) => { 
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate'); 
  response.headers.set('Pragma', 'no-cache'); 
  response.headers.set('Expires', '0'); 
  return response; 
}; 
 
export function middleware(request: NextRequest) { 
  const { pathname } = request.nextUrl; 
  if (isBypassedPath(pathname)) { 
    return setNoStoreHeaders(NextResponse.next()); 
  } 
 
  const sessionToken = request.cookies.get(ADMIN_SESSION_COOKIE)?.value; 
  const authorized = isValidAdminToken(sessionToken); 
  if (authorized) { 
    return setNoStoreHeaders(NextResponse.next()); 
  } 
 
  if (pathname.startsWith('/api/admin/')) { 
    return setNoStoreHeaders( 
      NextResponse.json({ message: 'Unauthorized.' }, { status: 401 }), 
    ); 
  } 
 
  const loginUrl = new URL('/admin/login', request.url); 
  loginUrl.searchParams.set('next', pathname); 
  return setNoStoreHeaders(NextResponse.redirect(loginUrl)); 
} 
 
export const config = { 
  matcher: ['/admin/:path*', '/api/admin/:path*'], 
};
