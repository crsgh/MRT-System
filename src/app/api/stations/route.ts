import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import Station from '@/models/Station';
import { getUserFromRequest, requireRole } from '@/lib/auth';

export const runtime = 'nodejs';

export async function GET() {
  try {
    await dbConnect();
    const stations = await Station.find({}).sort({ name: 1 });
    return NextResponse.json({ stations });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch stations' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    // Only super_admin can create stations
    const authResult = await requireRole(req, ['super_admin']);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    await dbConnect();
    const body = await req.json();
    
    // Check if code exists
    const existing = await Station.findOne({ code: body.code });
    if (existing) {
      return NextResponse.json({ error: 'Station code already exists' }, { status: 400 });
    }

    const station = await Station.create(body);
    return NextResponse.json({ station }, { status: 201 });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create station';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
