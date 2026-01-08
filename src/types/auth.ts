// Shared types that can be safely imported in both client and server code
export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ADMIN = 'admin',
  PASSENGER = 'passenger',
}

export interface UserPayload {
  userId: string;
  username: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

export interface User {
  _id: string;
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
  updatedAt?: string;
}