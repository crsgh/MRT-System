import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Trip from '@/models/Trip';
import User from '@/models/User';
import Station from '@/models/Station';
import { getUserFromRequest, canManageUsers } from '@/lib/auth';

export const runtime = 'nodejs';

// Philippine MRT fare calculation using database stations with order
async function calculateDistanceFare(startStationId: string, endStationId: string, discountType: string = 'none'): Promise<number> {
  try {
    await dbConnect();
    
    // Get both stations from database
    const [startStation, endStation] = await Promise.all([
      Station.findById(startStationId),
      Station.findById(endStationId)
    ]);
    
    if (!startStation || !endStation) {
      return 13; // Default minimum fare if stations not found
    }
    
    // Calculate number of stations between start and end
    const stationsDistance = Math.abs(endStation.order - startStation.order);
    
    // MRT Line 3 fare structure based on distance (regular fare)
    let regularFare: number;
    if (stationsDistance === 0) regularFare = 13;  // Same station
    else if (stationsDistance <= 3) regularFare = 13;   // Short distance (₱13)
    else if (stationsDistance <= 5) regularFare = 16;   // Medium-short distance (₱16) 
    else if (stationsDistance <= 8) regularFare = 20;   // Medium distance (₱20)
    else regularFare = 24;                              // Long distance (₱24)
    
    // Apply discount for Senior/PWD/Student (50% discount)
    if (discountType === 'senior' || discountType === 'pwd' || discountType === 'student') {
      return Math.ceil(regularFare * 0.5); // 50% discount, rounded up
    }
    
    return regularFare;
  } catch (error) {
    console.error('Error calculating fare:', error);
    return 13; // Default to minimum fare on error
  }
}

import { verifyToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // 1. Get user from Cookie OR Header
    let requestUser = getUserFromRequest(request);
    
    if (!requestUser) {
      const authHeader = request.headers.get('authorization');
      if (authHeader?.startsWith('Bearer ')) {
        const token = authHeader.substring(7);
        requestUser = verifyToken(token);
      }
    }

    if (!requestUser) {
       return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { action, passengerCode, stationId } = await request.json();

    if (!action || !passengerCode || !stationId) {
      return NextResponse.json(
        { error: 'Missing required fields: action, passengerCode, stationId' },
        { status: 400 }
      );
    }

    // 2. Check Permissions (Admin OR Self)
    const isAdmin = canManageUsers(requestUser.role);
    const isSelf = requestUser.username === passengerCode;

    if (!isAdmin && !isSelf) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    await dbConnect();

    const passenger = await User.findOne({ username: passengerCode });
    if (!passenger) {
      return NextResponse.json(
        { error: 'Passenger not found' },
        { status: 404 }
      );
    }

    const station = await Station.findById(stationId);
    if (!station) {
      return NextResponse.json(
        { error: 'Station not found' },
        { status: 404 }
      );
    }

    if (action === 'tap_in') {
      const activeTrip = await Trip.findOne({
        passengerId: passenger._id,
        status: 'active'
      });

      if (activeTrip) {
        return NextResponse.json(
          { error: 'Passenger already has an active trip' },
          { status: 400 }
        );
      }

      // Check for minimum balance (e.g., max fare which is 24)
      // Initialize balance if undefined
      const currentBalance = passenger.balance !== undefined ? passenger.balance : 0;
      const MINIMUM_BALANCE = 13; // Minimum fare

      if (currentBalance < MINIMUM_BALANCE) {
          return NextResponse.json(
              { error: `Insufficient balance. Minimum ₱${MINIMUM_BALANCE} required. Current: ₱${currentBalance}` },
              { status: 400 }
          );
      }

      const newTrip = new Trip({
        passengerId: passenger._id,
        passengerCode,
        startStation: stationId,
        tapInTime: new Date()
      });

      await newTrip.save();

      return NextResponse.json({
        success: true,
        message: 'Tap in successful',
        trip: {
          id: newTrip._id,
          passengerCode,
          startStation: station.name,
          tapInTime: newTrip.tapInTime,
          status: newTrip.status,
          balance: currentBalance
        }
      });

    } else if (action === 'tap_out') {
      const activeTrip = await Trip.findOne({
        passengerId: passenger._id,
        status: 'active'
      }).populate('startStation');

      if (!activeTrip) {
        return NextResponse.json(
          { error: 'No active trip found for this passenger' },
          { status: 404 }
        );
      }

      activeTrip.endStation = stationId;
      activeTrip.tapOutTime = new Date();
      activeTrip.status = 'completed';
      
      // Calculate fare based on distance (Philippine MRT system)
      const startStationId = activeTrip.startStation?._id || activeTrip.startStation;
      const fare = await calculateDistanceFare(startStationId, stationId, passenger.discountType || 'none');
      activeTrip.fare = fare;

      // Deduct fare from balance
      // Initialize balance if undefined
      if (passenger.balance === undefined) passenger.balance = 0;
      
      passenger.balance -= fare;
      
      // Explicitly mark balance as modified because Mongoose might not detect it if it was undefined
      passenger.markModified('balance');
      
      // Save both trip and user
      // Ideally this should be a transaction, but for now separate saves are okay for MVP
      await Promise.all([
          activeTrip.save(),
          passenger.save()
      ]);

      return NextResponse.json({
        success: true,
        message: 'Tap out successful',
        trip: {
          id: activeTrip._id,
          passengerCode,
          startStation: activeTrip.startStation?.name || 'Unknown Station',
          endStation: station.name,
          tapInTime: activeTrip.tapInTime,
          tapOutTime: activeTrip.tapOutTime,
          travelTime: `${Math.floor((activeTrip.tapOutTime.getTime() - activeTrip.tapInTime.getTime()) / (1000 * 60))} minutes`,
          fare: `₱${activeTrip.fare.toFixed(0)}`,
          status: activeTrip.status,
          remainingBalance: passenger.balance
        }
      });
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Must be "tap_in" or "tap_out"' },
        { status: 400 }
      );
    }

  } catch (error) {
    console.error('Error processing tap:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user || !canManageUsers(user.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    await dbConnect();

    const { searchParams } = new URL(request.url);
    const passengerCode = searchParams.get('passengerCode');
    
    if (passengerCode) {
      const passenger = await User.findOne({ username: passengerCode });
      if (!passenger) {
        return NextResponse.json(
          { error: 'Passenger not found' },
          { status: 404 }
        );
      }

      const activeTrip = await Trip.findOne({
        passengerId: passenger._id,
        status: 'active'
      }).populate('startStation');

      return NextResponse.json({
        passenger: {
          id: passenger._id,
          username: passenger.username,
          firstName: passenger.firstName,
          lastName: passenger.lastName,
          discountType: passenger.discountType || 'none'
        },
        activeTrip: activeTrip ? {
          id: activeTrip._id,
          startStation: activeTrip.startStation?.name || 'Unknown Station',
          tapInTime: activeTrip.tapInTime,
          status: activeTrip.status
        } : null
      });
    }

    const recentTrips = await Trip.find()
      .populate('passengerId', 'username firstName lastName')
      .populate('startStation', 'name')
      .populate('endStation', 'name')
      .sort({ createdAt: -1 })
      .limit(10);

    return NextResponse.json({
      trips: recentTrips.map(trip => ({
        id: trip._id,
        passengerName: `${trip.passengerId.firstName} ${trip.passengerId.lastName}`,
        passengerCode: trip.passengerId.username,
        startStation: trip.startStation?.name,
        endStation: trip.endStation?.name,
        tapInTime: trip.tapInTime,
        tapOutTime: trip.tapOutTime,
        status: trip.status,
        fare: trip.fare
      }))
    });

  } catch (error) {
    console.error('Error fetching trip data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}