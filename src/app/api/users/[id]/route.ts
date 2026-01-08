import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import { UserRole } from '@/types/auth';
import bcrypt from 'bcryptjs';
import { getUserFromRequest, canManageUsers, canManageRole } from '@/lib/auth';

export const runtime = 'nodejs';

// GET /api/users/[id] - Get single user
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getUserFromRequest(request);
    if (!user || !canManageUsers(user.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const { id } = await params;

    await dbConnect();

    const targetUser = await User.findById(id).select('-password').lean();
    if (!targetUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(targetUser);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT /api/users/[id] - Update user
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getUserFromRequest(request);
    if (!user || !canManageUsers(user.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const { id } = await params;

    const data = await request.json();
    const { username, email, firstName, lastName, password, role, isActive } = data;

    await dbConnect();

    const targetUser = await User.findById(id);
    if (!targetUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user can manage this role
    if (role && !canManageRole(user.role, role)) {
      return NextResponse.json(
        { error: 'Cannot assign this role level' },
        { status: 403 }
      );
    }

    // Check if user can manage the current role of target user
    if (!canManageRole(user.role, targetUser.role)) {
      return NextResponse.json(
        { error: 'Cannot modify user with this role level' },
        { status: 403 }
      );
    }

    // Validate role if provided
    if (role && !Object.values(UserRole).includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role specified' },
        { status: 400 }
      );
    }

    // Check for duplicate username (excluding current user)
    if (username && username !== targetUser.username) {
      const existingUser = await User.findOne({ username, _id: { $ne: id } });
      if (existingUser) {
        return NextResponse.json(
          { error: 'Username already exists' },
          { status: 409 }
        );
      }
    }

    // Check for duplicate email (excluding current user)
    if (email && email !== targetUser.email) {
      const existingEmail = await User.findOne({ email, _id: { $ne: id } });
      if (existingEmail) {
        return NextResponse.json(
          { error: 'Email already exists' },
          { status: 409 }
        );
      }
    }

    // Build update object
    const updateData: any = {};
    if (username !== undefined) updateData.username = username;
    if (email !== undefined) updateData.email = email || undefined;
    if (firstName !== undefined) updateData.firstName = firstName || undefined;
    if (lastName !== undefined) updateData.lastName = lastName || undefined;
    if (role !== undefined) updateData.role = role;
    if (isActive !== undefined) updateData.isActive = isActive;

    // Hash password if provided
    if (password) {
      updateData.password = await bcrypt.hash(password, 12);
    }

    const updatedUser = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    return NextResponse.json(updatedUser);
  } catch (error: any) {
    console.error('Error updating user:', error);

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

// DELETE /api/users/[id] - Delete user
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = getUserFromRequest(request);
    if (!user || !canManageUsers(user.role)) {
      return NextResponse.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    const { id } = await params;

    await dbConnect();

    const targetUser = await User.findById(id);
    if (!targetUser) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Check if user can manage this role
    if (!canManageRole(user.role, targetUser.role)) {
      return NextResponse.json(
        { error: 'Cannot delete user with this role level' },
        { status: 403 }
      );
    }

    // Prevent users from deleting themselves
    if (id === user.userId) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 409 }
      );
    }

    await User.findByIdAndDelete(id);

    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}