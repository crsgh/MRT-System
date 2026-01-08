import { NextResponse, NextRequest } from 'next/server';
import dbConnect from '@/lib/db';
import Station from '@/models/Station';
import { requireRole } from '@/lib/auth';

export const runtime = 'nodejs';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await dbConnect();
    const { id } = await params;
    const station = await Station.findById(id);
    if (!station) {
      return NextResponse.json({ error: 'Station not found' }, { status: 404 });
    }
    return NextResponse.json({ station });
  } catch {
    return NextResponse.json({ error: 'Failed to fetch station' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Only super_admin can update stations
    const authResult = await requireRole(req, ['super_admin']);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    await dbConnect();
    const { id } = await params;
    const body = await req.json();

    const station = await Station.findByIdAndUpdate(id, body, {
      new: true,
      runValidators: true,
    });

    if (!station) {
      return NextResponse.json({ error: 'Station not found' }, { status: 404 });
    }

    return NextResponse.json({ station });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update station';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    // Only super_admin can delete stations
    const authResult = await requireRole(req, ['super_admin']);
    if (!authResult.success) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    await dbConnect();
    const { id } = await params;
    const station = await Station.findByIdAndDelete(id);

    if (!station) {
      return NextResponse.json({ error: 'Station not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Station deleted successfully' });
  } catch {
    return NextResponse.json({ error: 'Failed to delete station' }, { status: 500 });
  }
}
