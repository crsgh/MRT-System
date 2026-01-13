import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import WalletTransaction from '@/models/WalletTransaction';
import { getUserFromRequest, verifyToken } from '@/lib/auth';

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
    const { amount, userId } = await request.json();

    // 3. Validation
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Invalid amount. Must be greater than 0' },
        { status: 400 }
      );
    }

    // If userId is provided, ensure requestUser is admin or self
    // If not provided, assume self (requestUser.id)
    const targetUserId = userId || requestUser.userId;

    if (userId && userId !== requestUser.userId && requestUser.role !== 'admin' && requestUser.role !== 'super_admin') {
         return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    await dbConnect();

    // 4. Update Balance
    // We can use $inc for atomic update or find+save
    // If we use findById, we can get the updated doc easily
    const user = await User.findById(targetUserId);
    
    if (!user) {
        return NextResponse.json(
            { error: 'User not found' },
            { status: 404 }
        );
    }

    // Initialize balance if it doesn't exist (migration)
    if (user.balance === undefined) {
        user.balance = 0;
    }

    const numericAmount = Number(amount);
    user.balance += numericAmount;
    await user.save();

    await WalletTransaction.create({
      userId: user._id,
      amount: numericAmount,
      method: 'manual',
      status: 'paid'
    });

    return NextResponse.json({
      success: true,
      message: 'Deposit successful',
      balance: user.balance,
      user: {
          username: user.username,
          balance: user.balance
      }
    });

  } catch (error) {
    console.error('Deposit error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
