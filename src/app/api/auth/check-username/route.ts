import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  try {
    await dbConnect();
    const url = new URL(req.url);
    const username = url.searchParams.get('username');

    if (!username) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      );
    }

    const existingUser = await User.findOne({ username });

    return NextResponse.json(
      { available: !existingUser },
      { status: 200 }
    );
  } catch (error) {
    console.error('Check username error:', error);
    return NextResponse.json(
      { error: 'Failed to check username availability' },
      { status: 500 }
    );
  }
}
