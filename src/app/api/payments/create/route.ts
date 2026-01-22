import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest, verifyToken } from '@/lib/auth';
import { createSource } from '@/lib/paymongo';

export const runtime = 'nodejs';

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate
    let requestUser = getUserFromRequest(request);
    
    if (!requestUser) {
      const authHeader = request.headers.get('authorization');
      if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        requestUser = verifyToken(token);
      }
    }

    if (!requestUser) {
       return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 2. Parse request
    const { amount, type } = await request.json();

    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount' },
        { status: 400 }
      );
    }

    // 3. Create Source
    // We'll use a generic success/failed URL for now.
    // In a real app, this should be a deep link or a page that handles the post-payment logic.
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://172.20.10.2:3000';
    
    const result = await createSource(amount, type || 'gcash', {
      success: `${baseUrl}/payment/success`,
      failed: `${baseUrl}/payment/failed`
    });

    return NextResponse.json({
      success: true,
      data: result.data
    });

  } catch (error: any) {
    console.error('Payment creation error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
