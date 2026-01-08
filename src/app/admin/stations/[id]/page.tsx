'use client';

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import StationForm from '@/components/StationForm';
import { Shield, ArrowLeft, Eye } from 'lucide-react';
import Link from 'next/link';

interface Station {
  _id: string;
  name: string;
  code: string;
  latitude: number;
  longitude: number;
  description?: string;
  order?: number;
  createdAt?: string;
  updatedAt?: string;
}

interface User {
  role: string;
}

export default function StationPage() {
  const [station, setStation] = useState<Station | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const params = useParams();

  useEffect(() => {
    fetchCurrentUser();
    fetchStation();
  }, [params.id]);

  const fetchCurrentUser = async () => {
    try {
      const res = await fetch('/api/auth/me');
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      }
    } catch (error) {
      console.error('Error fetching user:', error);
    }
  };

  const fetchStation = async () => {
    try {
      const res = await fetch(`/api/stations/${params.id}`);
      if (res.ok) {
        const data = await res.json();
        setStation(data.station);
      } else {
        router.push('/admin/stations');
      }
    } catch (error) {
      console.error('Error fetching station:', error);
      router.push('/admin/stations');
    } finally {
      setLoading(false);
    }
  };

  const canEdit = user?.role === 'super_admin';

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="flex items-center space-x-3 text-gray-600">
          <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
          <span>Loading station...</span>
        </div>
      </div>
    );
  }

  if (!station) {
    return (
      <div className="card">
        <div className="card-body text-center py-12">
          <Shield className="mx-auto mb-4 text-gray-400" size={48} />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Station Not Found</h3>
          <p className="text-gray-600 mb-6">The requested station could not be found.</p>
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
          <div className="flex items-center space-x-2 mb-2">
            <h1 className="text-3xl font-bold text-gray-900">
              {canEdit ? 'Edit Station' : 'View Station'}
            </h1>
            {!canEdit && (
              <div className="flex items-center text-amber-600 text-sm bg-amber-50 px-3 py-1 rounded-full">
                <Eye size={14} className="mr-1" />
                <span>View Only</span>
              </div>
            )}
          </div>
          <p className="text-gray-600">
            {canEdit 
              ? `Update details for ${station.name}` 
              : `Station details for ${station.name}`
            }
          </p>
        </div>
        <Link
          href="/admin/stations"
          className="btn-secondary flex items-center space-x-2"
        >
          <ArrowLeft size={16} />
          <span>Back to Stations</span>
        </Link>
      </div>

      {/* Station Details Card */}
      <div className="card">
        <div className="card-body">
          {!canEdit && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="flex items-center text-blue-800 text-sm">
                <Eye size={16} className="mr-2" />
                <span>You have read-only access to station information. Contact a Super Admin to make changes.</span>
              </div>
            </div>
          )}
          <StationForm 
            initialData={station} 
            isEditing={true}
            readOnly={!canEdit}
          />
        </div>
      </div>
    </div>
  );
}
