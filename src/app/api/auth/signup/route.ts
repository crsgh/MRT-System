import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import { UserRole } from '@/types/auth';

export const runtime = 'nodejs';

export async function POST(req: Request) {
  try {
    await dbConnect();
    const { username, password, email, firstName, lastName } = await req.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: 'Username and password are required' },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await User.findOne({ 
      $or: [
        { username },
        { email: email || '' } // Check email only if provided
      ]
    });

    if (existingUser) {
      if (existingUser.username === username) {
        return NextResponse.json(
          { error: 'Username already taken' },
          { status: 400 }
        );
      }
      if (email && existingUser.email === email) {
        return NextResponse.json(
          { error: 'Email already registered' },
          { status: 400 }
        );
      }
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const newUser = new User({
      username,
      password: hashedPassword,
      email,
      firstName,
      lastName,
      role: UserRole.PASSENGER, // Default to PASSENGER
      balance: 0, // Explicitly set to 0, though default is now 0
      isActive: true,
    });

    await newUser.save();

    return NextResponse.json(
      { 
        message: 'User registered successfully',
        user: {
          username: newUser.username,
          role: newUser.role
        }
      },
      { status: 201 }
    );

  } catch (error) {
    console.error('Signup error:', error);
    // Handle Mongoose validation errors
    if (error instanceof Error && error.name === 'ValidationError') {
       return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
