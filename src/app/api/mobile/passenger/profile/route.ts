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
      profilePicture: 1,
      isActive: 1,
      createdAt: 1,
      balance: 1
    });

    console.log('Fetched passenger profile:', {
      userId: decoded.userId,
      hasPicture: !!passenger?.profilePicture,
      pictureLength: passenger?.profilePicture?.length || 0
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
        profilePicture: passenger.profilePicture,
        isActive: passenger.isActive,
        joinedDate: passenger.createdAt,
        balance: passenger.balance || 0
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

export async function PUT(request: NextRequest) {
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

    const { discountType } = await request.json();

    // Validate discount type
    const validDiscountTypes = ['none', 'senior', 'pwd', 'student'];
    if (!validDiscountTypes.includes(discountType)) {
      return NextResponse.json(
        { error: 'Invalid discount type' },
        { status: 400 }
      );
    }

    await dbConnect();

    // Update passenger discount type
    const passenger = await User.findByIdAndUpdate(
      decoded.userId,
      { discountType },
      { new: true, runValidators: true }
    );

    if (!passenger) {
      return NextResponse.json(
        { error: 'Passenger not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Discount type updated successfully',
      passenger: {
        id: passenger._id,
        username: passenger.username,
        firstName: passenger.firstName,
        lastName: passenger.lastName,
        email: passenger.email,
        role: passenger.role,
        discountType: passenger.discountType,
        profilePicture: passenger.profilePicture,
        isActive: passenger.isActive,
        joinedDate: passenger.createdAt,
        balance: passenger.balance || 0
      }
    });
  } catch (error) {
    console.error('Error updating discount type:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
