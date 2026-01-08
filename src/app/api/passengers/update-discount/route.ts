import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { getUserFromRequest } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user || (user.role !== 'admin' && user.role !== 'super_admin')) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const { passengerCode, discountType } = await request.json();

    if (!passengerCode || !discountType) {
      return NextResponse.json(
        { error: 'Missing required fields: passengerCode, discountType' },
        { status: 400 }
      );
    }

    if (!['none', 'senior', 'pwd', 'student'].includes(discountType)) {
      return NextResponse.json(
        { error: 'Invalid discount type. Must be one of: none, senior, pwd, student' },
        { status: 400 }
      );
    }

    await dbConnect();

    const passenger = await User.findOneAndUpdate(
      { username: passengerCode, role: 'passenger' },
      { $set: { discountType } },
      { new: true }
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
        discountType: passenger.discountType
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