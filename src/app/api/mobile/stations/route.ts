import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Station from '@/models/Station';

export const runtime = 'nodejs';

/**
 * Mobile API endpoint for stations
 * Returns stations with stationId (for QR scanning)
 * No authentication required - public information
 */
export async function GET() {
  try {
    await dbConnect();
    const stations = await Station.find({}).sort({ order: 1 });
    
    return NextResponse.json({ 
      stations: stations.map(station => ({
        id: station._id,           // stationId for QR code
        name: station.name,
        code: station.code,
        latitude: station.latitude,
        longitude: station.longitude,
        order: station.order,
        description: station.description
      }))
    });
  } catch (error) {
    console.error('Error fetching stations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stations' }, 
      { status: 500 }
    );
  }
}
