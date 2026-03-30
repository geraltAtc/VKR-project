import { NextResponse } from 'next/server'; 
import { ADMIN_SESSION_COOKIE, isValidAdminToken } from '@/lib/adminAuth'; 
 
interface LoginBody { 
  token: string; 
} 
 
export async function POST(request: Request) { 
  const body = (await request.json()) as Partial<LoginBody>; 
  if (!isValidAdminToken(body.token)) { 
    return NextResponse.json( 
      { message: 'Invalid admin token.' }, 
      { status: 401 }, 
    ); 
  } 
 
  const response = NextResponse.json({ message: 'Logged in.' }); 
  response.cookies.set({ 
    name: ADMIN_SESSION_COOKIE, 
    value: body.token as string, 
    httpOnly: true, 
    sameSite: 'strict', 
    secure: process.env.NODE_ENV === 'production', 
    path: '/', 
  }); 
  response.headers.set('Cache-Control', 'no-store'); 
 
  return response; 
}
