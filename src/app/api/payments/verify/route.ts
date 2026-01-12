import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest, verifyToken } from '@/lib/auth';
import { retrieveSource, createPayment } from '@/lib/paymongo';
import dbConnect from '@/lib/db';
import User from '@/models/User';

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
    const { sourceId } = await request.json();

    if (!sourceId) {
      return NextResponse.json(
        { error: 'Source ID is required' },
        { status: 400 }
      );
    }

    // 3. Retrieve Source
    const source = await retrieveSource(sourceId);
    const sourceData = source.data;

    if (sourceData.attributes.status === 'chargeable') {
        // 4. Create Payment (Charge)
        const amount = sourceData.attributes.amount / 100; // Convert cents back to main unit
        const payment = await createPayment(amount, sourceId, `Top-up for ${requestUser.username}`);
        
        if (payment.data.attributes.status === 'paid') {
            // 5. Update User Balance
            await dbConnect();
            const user = await User.findById(requestUser.userId);
            
            if (!user) {
                return NextResponse.json({ error: 'User not found' }, { status: 404 });
            }

            if (user.balance === undefined) user.balance = 0;
            user.balance += amount;
            await user.save();

            return NextResponse.json({
                success: true,
                message: 'Payment successful',
                balance: user.balance,
                status: 'paid'
            });
        } else {
             return NextResponse.json({
                success: false,
                message: 'Payment failed',
                status: payment.data.attributes.status
            });
        }
    } else if (sourceData.attributes.status === 'consumed' || sourceData.attributes.status === 'paid') {
         return NextResponse.json({
            success: false, // Already processed, but effectively "success" for the user history maybe?
            // For now, treat as "nothing to do"
            message: 'Payment already processed',
            status: sourceData.attributes.status
        });
    } else {
         return NextResponse.json({
            success: false,
            message: `Source status is ${sourceData.attributes.status}`,
            status: sourceData.attributes.status
        });
    }

  } catch (error: any) {
    console.error('Payment verification error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
