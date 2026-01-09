import { NextRequest, NextResponse } from 'next/server';
import { getUserFromRequest } from '@/lib/auth';
import dbConnect from '@/lib/db';
import User from '@/models/User';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request);
    console.log('API /me: user from token:', user);

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('API /me: connecting to DB...');
    await dbConnect();
    console.log('API /me: connected to DB');

    const userData = await User.findById(user.userId)
      .select('-password')
      .lean();
    
    console.log('API /me: userData found:', !!userData);

    if (!userData) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      user: {
        username: userData.username,
        email: userData.email,
        firstName: userData.firstName,
        lastName: userData.lastName,
        role: userData.role,
        isActive: userData.isActive,
        lastLogin: userData.lastLogin,
        createdAt: userData.createdAt,
      },
    });
  } catch (error: any) {
    console.error('Error fetching user info:', error);
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
