'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import StationForm from '@/components/StationForm';
import { Shield, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

interface User {
  role: string;
}

export default function NewStationPage() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        
        // Check permissions
        if (data.user.role !== 'super_admin') {
          router.push('/admin/stations');
        }
      } else {
        router.push('/admin/stations');
      }
    } catch (error) {
      console.error('Error fetching user:', error);
      router.push('/admin/stations');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="flex items-center space-x-3 text-gray-600">
          <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'super_admin') {
    return (
      <div className="card">
        <div className="card-body text-center py-12">
          <Shield className="mx-auto mb-4 text-red-400" size={48} />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Access Denied</h3>
          <p className="text-gray-600 mb-6">You do not have permission to create stations.</p>
          <Link
            href="/admin/stations"
            className="btn-primary inline-flex items-center space-x-2"
          >
            <ArrowLeft size={16} />
            <span>Back to Stations</span>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">New Station</h1>
          <p className="text-gray-600">Create a new MRT station with location details</p>
        </div>
        <Link
          href="/admin/stations"
          className="btn-secondary flex items-center space-x-2"
        >
          <ArrowLeft size={16} />
          <span>Back to Stations</span>
        </Link>
      </div>

      {/* Form */}
      <div className="card">
        <div className="card-body">
          <StationForm />
        </div>
      </div>
    </div>
  );
}
