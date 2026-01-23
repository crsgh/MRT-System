import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  try {
    await dbConnect();
    const url = new URL(req.url);
    const email = url.searchParams.get('email');

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const existingUser = await User.findOne({ email });

    return NextResponse.json(
      { available: !existingUser },
      { status: 200 }
    );
  } catch (error) {
    console.error('Check email error:', error);
    return NextResponse.json(
      { error: 'Failed to check email availability' },
      { status: 500 }
    );
  }
}
