import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { verifyToken } from '@/lib/auth';

export const runtime = 'nodejs';

/**
 * Mobile API endpoint for passenger profile
 * Requires JWT token in Authorization header
 */
export async function GET(request: NextRequest) {
  try {
    // Get token from Authorization header
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');

    if (!token) {
      return NextResponse.json(
        { error: 'Missing authentication token' },
        { status: 401 }
      );
    }

    // Verify token
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    await dbConnect();

    // Get passenger info
    const passenger = await User.findById(decoded.userId, {
      username: 1,
      firstName: 1,
      lastName: 1,
      email: 1,
      role: 1,
      discountType: 1,
      isActive: 1,
      createdAt: 1
    });

    if (!passenger) {
      return NextResponse.json(
        { error: 'Passenger not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      passenger: {
        id: passenger._id,
        username: passenger.username,
        firstName: passenger.firstName,
        lastName: passenger.lastName,
        email: passenger.email,
        role: passenger.role,
        discountType: passenger.discountType,
        isActive: passenger.isActive,
        joinedDate: passenger.createdAt
      }
    });
  } catch (error) {
    console.error('Error fetching passenger profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
