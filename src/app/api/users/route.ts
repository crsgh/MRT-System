import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { UserRole } from '@/types/auth';
import bcrypt from 'bcryptjs';
import { getUserFromRequest, canManageUsers, canManageRole, isAdmin } from '@/lib/auth';

export const runtime = 'nodejs';

// GET /api/users - List all users
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
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const role = searchParams.get('role') || '';

    let query: any = {};
    
    if (search) {
      query.$or = [
        { username: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
      ];
    }

    if (role && Object.values(UserRole).includes(role as UserRole)) {
      query.role = role;
    }

    const skip = (page - 1) * limit;

    const users = await User.find(query)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const total = await User.countDocuments(query);

    return NextResponse.json({
      users,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/users - Create new user
export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    const data = await request.json();
    const { username, email, firstName, lastName, password, role, isActive = true } = data;

    // Allow ADMIN and SUPER_ADMIN to create PASSENGER accounts.
    // Creating ADMIN or SUPER_ADMIN still requires SUPER_ADMIN privileges (canManageUsers).
    if (role === UserRole.PASSENGER) {
      if (!isAdmin(user.role)) {
        return NextResponse.json({ error: 'Insufficient permissions to create passenger' }, { status: 403 });
      }
    } else {
      if (!canManageUsers(user.role)) {
        return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
      }
    }

    // Validation
    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    if (!Object.values(UserRole).includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role specified' },
        { status: 400 }
      );
    }

    // Check if user can manage this role
    if (!canManageRole(user.role, role)) {
      return NextResponse.json(
        { error: 'Cannot create user with this role level' },
        { status: 403 }
      );
    }

    await dbConnect();

    // Check if username already exists
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return NextResponse.json(
        { error: 'Username already exists' },
        { status: 409 }
      );
    }

    // Check if email already exists (if provided)
    if (email) {
      const existingEmail = await User.findOne({ email });
      if (existingEmail) {
        return NextResponse.json(
          { error: 'Email already exists' },
          { status: 409 }
        );
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    const newUser = new User({
      username,
      email: email || undefined,
      firstName: firstName || undefined,
      lastName: lastName || undefined,
      password: hashedPassword,
      role,
      isActive,
    });

    await newUser.save();

    // Return user without password
    const { password: _, ...userResponse } = newUser.toObject();
    return NextResponse.json(userResponse, { status: 201 });
  } catch (error: any) {
    console.error('Error creating user:', error);
    
    if (error.code === 11000) {
      return NextResponse.json(
        { error: 'Username or email already exists' },
        { status: 409 }
      );
    }

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err: any) => err.message);
      return NextResponse.json(
        { error: messages.join(', ') },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}