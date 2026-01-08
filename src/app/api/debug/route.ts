import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    console.log('Debug: Checking token...');
    const token = request.cookies.get('token')?.value;
    console.log('Debug: Token exists:', !!token);
    console.log('Debug: Token value (first 50 chars):', token?.substring(0, 50));
    
    const user = getUserFromRequest(request);
    console.log('Debug: User from token:', user);
    
    return NextResponse.json({
      hasToken: !!token,
      tokenPreview: token?.substring(0, 50),
      user: user,
      headers: Object.fromEntries(request.headers.entries()),
    });
  } catch (error) {
    console.error('Debug error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}