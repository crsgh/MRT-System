import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { verifyToken } from '@/lib/auth';

export const runtime = 'nodejs';

/**
 * Mobile API endpoint for uploading profile picture
 * Requires JWT token in Authorization header
 * Accepts JSON with base64 encoded image
 */
export async function POST(request: NextRequest) {
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

    // Get JSON body
    const body = await request.json();
    const { profilePicture } = body;

    if (!profilePicture) {
      return NextResponse.json(
        { error: 'No profile picture provided' },
        { status: 400 }
      );
    }

    // Validate base64 format and size
    if (typeof profilePicture !== 'string' || !profilePicture.startsWith('data:image')) {
      return NextResponse.json(
        { error: 'Invalid image format' },
        { status: 400 }
      );
    }

    // Validate size (max 2MB)
    if (profilePicture.length > 2 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'Image size must be less than 2MB' },
        { status: 400 }
      );
    }

    console.log('Uploading image for user:', decoded.userId, 'Size:', profilePicture.length);

    await dbConnect();

    // Update passenger profile picture
    const passenger = await User.findByIdAndUpdate(
      decoded.userId,
      { profilePicture },
      { new: true, runValidators: true }
    );

    if (!passenger) {
      return NextResponse.json(
        { error: 'Passenger not found' },
        { status: 404 }
      );
    }

    console.log('Image saved successfully. Passenger profilePicture length:', passenger.profilePicture?.length || 0);
    console.log('Passenger data after save:', {
      userId: passenger._id,
      hasPicture: !!passenger.profilePicture,
      pictureLength: passenger.profilePicture?.length || 0,
      pictureStart: passenger.profilePicture?.substring(0, 50) || 'null'
    });

    return NextResponse.json({
      success: true,
      message: 'Profile picture updated successfully',
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
    console.error('Error uploading profile picture:', error);
    return NextResponse.json(
      { error: `Internal server error: ${error instanceof Error ? error.message : 'Unknown error'}` },
      { status: 500 }
    );
  }
}
