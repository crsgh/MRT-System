'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import UserForm from '@/components/UserForm';
import { UserRole } from '@/types/auth';

interface User {
  _id: string;
  username: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  role: UserRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export default function EditUserPage() {
  const params = useParams();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (params.id) {
      fetchUser(params.id as string);
    }
  }, [params.id]);

  const fetchUser = async (id: string) => {
    try {
      const res = await fetch(`/api/users/${id}`);
      if (res.ok) {
        const userData = await res.json();
        setUser(userData);
      } else if (res.status === 404) {
        setError('User not found');
      } else {
        setError('Failed to load user');
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      setError('Failed to load user');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="flex items-center space-x-3 text-gray-600">
          <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
          <span>Loading user...</span>
        </div>
      </div>
    );
  }

  if (error || !user) {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 mb-4">{error || 'User not found'}</div>
        <a href="/admin/users" className="btn-primary">
          Back to Users
        </a>
      </div>
    );
  }

  return <UserForm initialData={user} isEditing />;
}