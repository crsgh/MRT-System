import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { getUserFromRequest, canManageUsers } from '@/lib/auth';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    const adminUser = getUserFromRequest(request);
    if (!adminUser || !canManageUsers(adminUser.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    await dbConnect();

    const passengers = await User.find({ role: 'passenger' }, {
      username: 1,
      firstName: 1,
      lastName: 1,
      email: 1,
      isActive: 1
    }).sort({ firstName: 1, lastName: 1 });

    return NextResponse.json({
      passengers: passengers.map(p => ({
        id: p._id,
        username: p.username,
        firstName: p.firstName,
        lastName: p.lastName,
        email: p.email,
        isActive: p.isActive
      }))
    });

  } catch (error) {
    console.error('Error fetching passengers:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}