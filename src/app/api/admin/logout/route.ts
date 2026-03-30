import { NextResponse } from 'next/server'; 
import { ADMIN_SESSION_COOKIE } from '@/lib/adminAuth'; 
 
export async function POST() { 
  const response = NextResponse.json({ message: 'Logged out.' }); 
  response.cookies.set({ 
    name: ADMIN_SESSION_COOKIE, 
    value: '', 
    httpOnly: true, 
    sameSite: 'strict', 
    secure: process.env.NODE_ENV === 'production', 
    path: '/', 
    maxAge: 0, 
  }); 
  response.headers.set('Cache-Control', 'no-store'); 
  return response; 
}
