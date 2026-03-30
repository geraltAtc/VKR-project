import { NextResponse } from 'next/server'; 
import { ADMIN_SESSION_COOKIE, getConfiguredAdminToken, isValidAdminToken } from '@/lib/adminAuth'; 
 
interface LoginBody { 
  token: string; 
} 
 
export async function POST(request: Request) { 
  const configuredToken = getConfiguredAdminToken(); 
  if (!configuredToken) { 
    return NextResponse.json( 
      { message: 'ADMIN_DASHBOARD_TOKEN is not configured on server environment.' }, 
      { status: 500 }, 
    ); 
  } 
 
  const body = (await request.json()) as Partial<LoginBody>; 
  const providedToken = (body.token ?? '').trim(); 
 
  if (!isValidAdminToken(providedToken)) { 
    return NextResponse.json( 
      { message: 'Invalid admin token.' }, 
      { status: 401 }, 
    ); 
  } 
 
  const response = NextResponse.json({ message: 'Logged in.' }); 
  response.cookies.set({ 
    name: ADMIN_SESSION_COOKIE, 
    value: providedToken, 
    httpOnly: true, 
    sameSite: 'strict', 
    secure: process.env.NODE_ENV === 'production', 
    path: '/', 
  }); 
  response.headers.set('Cache-Control', 'no-store'); 
 
  return response; 
}
