import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest, verifyToken } from '@/lib/auth';
import { retrieveSource, createPayment } from '@/lib/paymongo';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import WalletTransaction from '@/models/WalletTransaction';

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
        const paymentStatus = payment.data.attributes.status;
        
        if (paymentStatus === 'paid') {
            // 5. Update User Balance
            await dbConnect();
            const user = await User.findById(requestUser.userId);
            
            if (!user) {
              return NextResponse.json({ error: 'User not found' }, { status: 404 });
            }

            if (user.balance === undefined) user.balance = 0;
            user.balance += amount;
            await user.save();

            await WalletTransaction.findOneAndUpdate(
              { paymentId: payment.data.id },
              {
                userId: user._id,
                amount,
                method: sourceData.attributes.type || 'unknown',
                status: paymentStatus,
                paymentId: payment.data.id,
                sourceId,
              },
              { upsert: true, new: true, setDefaultsOnInsert: true }
            );

            return NextResponse.json({
                success: true,
                message: 'Payment successful',
                balance: user.balance,
                status: 'paid',
                paymentId: payment.data.id
            });
        } else if (paymentStatus === 'pending') {
            // Payment is still pending - return pending status
            return NextResponse.json({
                success: false,
                message: 'Payment is still pending',
                status: 'pending'
            });
        } else {
            // Payment failed
            return NextResponse.json({
                success: false,
                message: `Payment failed with status: ${paymentStatus}`,
                status: paymentStatus
            });
        }
    } else if (sourceData.attributes.status === 'consumed') {
      await dbConnect();
      await WalletTransaction.findOneAndUpdate(
        { sourceId },
        {
          userId: requestUser.userId,
          amount: sourceData.attributes.amount / 100,
          method: sourceData.attributes.type || 'unknown',
          status: 'paid',
          sourceId,
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );

      return NextResponse.json({
        success: true,
        message: 'Payment already processed',
        status: 'consumed'
      });
    } else if (sourceData.attributes.status === 'expired' || sourceData.attributes.status === 'failed') {
        // Payment method expired or failed
        return NextResponse.json({
            success: false,
            message: `Source status is ${sourceData.attributes.status}`,
            status: sourceData.attributes.status
        });
    } else {
        // Pending status - not yet chargeable
        return NextResponse.json({
            success: false,
            message: `Source status is ${sourceData.attributes.status}. Please complete authorization.`,
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
