import { NextRequest } from 'next/server';
import { UserRole, UserPayload } from '@/types/auth';

// For Node.js runtime (API routes) - use proper JWT verification
export async function verifyTokenNodeJS(token: string): Promise<UserPayload | null> {
  try {
    const jwt = await import('jsonwebtoken');
    const JWT_SECRET = process.env.JWT_SECRET || 'secret';
    return jwt.verify(token, JWT_SECRET) as UserPayload;
  } catch {
    return null;
  }
}

// For Edge runtime (middleware) - simplified verification
export async function verifyTokenAsync(token: string): Promise<UserPayload | null> {
  try {
    // For edge runtime compatibility, we'll decode the JWT manually
    // This is a simplified version - in production, use proper JWT verification
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = JSON.parse(atob(parts[1]));
    
    // Basic expiration check
    if (payload.exp && payload.exp < Date.now() / 1000) {
      return null;
    }
    
    return payload as UserPayload;
  } catch {
    return null;
  }
}

// Synchronous version for compatibility (uses proper JWT in Node.js)
export function verifyToken(token: string): UserPayload | null {
  try {
    // Check if we're in Node.js environment
    if (typeof process !== 'undefined' && process.versions && process.versions.node) {
      // Use proper JWT verification in Node.js
      const jwt = require('jsonwebtoken');
      const JWT_SECRET = process.env.JWT_SECRET || 'secret';
      return jwt.verify(token, JWT_SECRET) as UserPayload;
    } else {
      // Fallback for edge runtime
      const parts = token.split('.');
      if (parts.length !== 3) return null;
      
      const payload = JSON.parse(atob(parts[1]));
      
      // Basic expiration check
      if (payload.exp && payload.exp < Date.now() / 1000) {
        return null;
      }
      
      return payload as UserPayload;
    }
  } catch {
    return null;
  }
}

export function getUserFromRequest(request: NextRequest): UserPayload | null {
  const token = request.cookies.get('token')?.value;
  if (!token) return null;
  return verifyToken(token);
}

export function hasPermission(userRole: UserRole, requiredRoles: UserRole[]): boolean {
  return requiredRoles.includes(userRole);
}

export function isSuperAdmin(userRole: UserRole): boolean {
  return userRole === UserRole.SUPER_ADMIN;
}

export function isAdmin(userRole: UserRole): boolean {
  return userRole === UserRole.ADMIN || userRole === UserRole.SUPER_ADMIN;
}

export function canManageUsers(userRole: UserRole): boolean {
  return isAdmin(userRole);
}

export function canEditStations(userRole: UserRole): boolean {
  return userRole === UserRole.SUPER_ADMIN;
}

export function canViewStations(userRole: UserRole): boolean {
  return isAdmin(userRole);
}

export const ROLE_HIERARCHY = {
  [UserRole.PASSENGER]: 0,
  [UserRole.ADMIN]: 1,
  [UserRole.SUPER_ADMIN]: 2,
};

export function getRoleLevel(role: UserRole): number {
  return ROLE_HIERARCHY[role] || 0;
}

export function canManageRole(managerRole: UserRole, targetRole: UserRole): boolean {
  return getRoleLevel(managerRole) >= getRoleLevel(targetRole);
}

export async function requireRole(request: NextRequest, allowedRoles: string[]) {
  const user = getUserFromRequest(request);
  if (!user) {
    return { success: false, status: 401, error: 'Unauthorized' };
  }
  
  if (!allowedRoles.includes(user.role)) {
    return { success: false, status: 403, error: 'Insufficient permissions' };
  }
  
  return { success: true, user };
}