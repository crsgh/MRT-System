import { Schema, model, models } from 'mongoose';
import { UserRole } from '@/types/auth';

export interface IUser {
  _id: string;
  username: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  password: string;
  role: UserRole;
  discountType?: 'none' | 'senior' | 'pwd' | 'student';
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema({
  username: {
    type: String,
    required: [true, 'Please provide a username'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters long'],
    maxlength: [30, 'Username cannot exceed 30 characters'],
  },
  email: {
    type: String,
    trim: true,
    lowercase: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email address'],
    sparse: true, // Allows multiple null values
  },
  firstName: {
    type: String,
    trim: true,
    maxlength: [50, 'First name cannot exceed 50 characters'],
  },
  lastName: {
    type: String,
    trim: true,
    maxlength: [50, 'Last name cannot exceed 50 characters'],
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: [6, 'Password must be at least 6 characters long'],
  },
  role: {
    type: String,
    enum: Object.values(UserRole),
    default: UserRole.PASSENGER,
    required: true,
  },
  discountType: {
    type: String,
    enum: ['none', 'senior', 'pwd', 'student'],
    default: 'none',
  },
  isActive: {
    type: Boolean,
    default: true,
  },
  lastLogin: {
    type: Date,
  },
}, { timestamps: true });

// Index for faster queries
UserSchema.index({ username: 1, email: 1 });
UserSchema.index({ role: 1, isActive: 1 });

const User = models.User || model('User', UserSchema);

export default User;
