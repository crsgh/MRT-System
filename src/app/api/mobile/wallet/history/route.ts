import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest, verifyToken } from '@/lib/auth';
import dbConnect from '@/lib/db';
import WalletTransaction from '@/models/WalletTransaction';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    let requestUser = getUserFromRequest(request);

    if (!requestUser) {
      const authHeader = request.headers.get('authorization');
      if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        requestUser = verifyToken(token);
      }
    }

    if (!requestUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const transactions = await WalletTransaction.find({ userId: requestUser.userId })
      .sort({ createdAt: -1 })
      .limit(20)
      .lean();

    const mapped = transactions.map((txn) => ({
      id: txn._id.toString(),
      amount: txn.amount,
      method: txn.method,
      status: txn.status,
      createdAt: txn.createdAt,
      paymentId: txn.paymentId,
      sourceId: txn.sourceId,
    }));

    return NextResponse.json({ success: true, transactions: mapped });
  } catch (error) {
    console.error('Wallet history error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
