import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Trip from '@/models/Trip';
import User from '@/models/User';
import { verifyToken } from '@/lib/auth';

export const runtime = 'nodejs';

/**
 * Mobile API endpoint for passenger trip history
 * Requires JWT token in Authorization header (for mobile clients)
 */
export async function GET(request: NextRequest) {
  try {
    // Get token from Authorization header (mobile clients don't have cookies)
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

    // Get passenger's trips
    const trips = await Trip.find({ passengerId: decoded.userId })
      .populate('startStation', 'name code')
      .populate('endStation', 'name code')
      .sort({ tapInTime: -1 })
      .limit(20);

    return NextResponse.json({
      success: true,
      trips: trips.map(trip => ({
        id: trip._id,
        startStation: {
          id: trip.startStation?._id,
          name: trip.startStation?.name,
          code: trip.startStation?.code
        },
        endStation: trip.endStation ? {
          id: trip.endStation._id,
          name: trip.endStation.name,
          code: trip.endStation.code
        } : null,
        tapInTime: trip.tapInTime,
        tapOutTime: trip.tapOutTime,
        status: trip.status,
        fare: trip.fare,
        travelTime: trip.tapOutTime && trip.tapInTime 
          ? Math.floor((trip.tapOutTime.getTime() - trip.tapInTime.getTime()) / (1000 * 60))
          : null
      }))
    });
  } catch (error) {
    console.error('Error fetching passenger trips:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
