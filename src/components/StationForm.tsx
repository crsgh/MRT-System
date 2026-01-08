'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, RefreshCw, AlertCircle } from 'lucide-react';
import MapPicker from './MapPicker';

interface StationFormData {
  name: string;
  code: string;
  latitude: number;
  longitude: number;
  description?: string;
  order?: number;
}

interface StationFormProps {
  initialData?: StationFormData & { _id?: string };
  isEditing?: boolean;
  readOnly?: boolean;
}

export default function StationForm({ initialData, isEditing = false, readOnly = false }: StationFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState<StationFormData>({
    name: '',
    code: '',
    latitude: 0,
    longitude: 0,
    description: '',
    order: 1,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        code: initialData.code,
        latitude: initialData.latitude,
        longitude: initialData.longitude,
        description: initialData.description || '',
        order: (initialData as any).order || 1,
      });
    }
  }, [initialData]);

  const normalizeStationCode = (value: string) => {
    return value
      .toUpperCase()
      .trim()
      .replace(/[^A-Z0-9_]+/g, '_')
      .replace(/_+/g, '_')
      .replace(/^_+|_+$/g, '')
      .slice(0, 32);
  };

  const generateStationCode = (stationName: string) => {
    const base = normalizeStationCode(stationName).slice(0, 18) || 'STATION';
    const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
    return `MRT_${base}_${suffix}`;
  };

  const handleGenerateCode = () => {
    setFormData((prev) => ({ ...prev, code: generateStationCode(prev.name) }));
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    if (name === 'code') {
      setFormData((prev) => ({ ...prev, code: normalizeStationCode(value) }));
      return;
    }
    if (name === 'name') {
      setFormData((prev) => {
        const nextName = value;
        if (!isEditing && !prev.code) {
          const suggested = normalizeStationCode(nextName);
          return { ...prev, name: nextName, code: suggested ? `MRT_${suggested}`.slice(0, 32) : '' };
        }
        return { ...prev, name: nextName };
      });
      return;
    }
    setFormData((prev) => ({ ...prev, [name]: value } as StationFormData));
  };

  const handleLocationSelect = (lat: number, lng: number) => {
    setFormData((prev) => ({ ...prev, latitude: lat, longitude: lng }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (formData.latitude === 0 && formData.longitude === 0) {
      setError('Please select a location on the map');
      setLoading(false);
      return;
    }

    try {
      const url = isEditing && initialData?._id 
        ? `/api/stations/${initialData._id}` 
        : '/api/stations';
      
      const method = isEditing ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ...formData, code: normalizeStationCode(formData.code) }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong');
      }

      router.push('/admin/stations');
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          {isEditing ? 'Edit Station' : 'Create New Station'}
        </h1>
        <p className="text-gray-600">
          {isEditing ? 'Update station information and location' : 'Add a new station to the MRT system'}
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Error Alert */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
            <AlertCircle className="text-red-500 mt-0.5" size={20} />
            <div>
              <h4 className="text-red-800 font-medium">Error</h4>
              <p className="text-red-700 text-sm mt-1">{error}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Form Fields */}
          <div className="space-y-6">
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-semibold text-gray-900">Station Information</h3>
              </div>
              <div className="card-body space-y-6">
                {/* Station Name */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                    Station Name *
                  </label>
                  <input
                    id="name"
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`input-field ${readOnly ? 'bg-gray-50 text-gray-600' : ''}`}
                    placeholder="GlobalTek Station"
                    required
                    readOnly={readOnly}
                  />
                </div>

                {/* Station Code */}
                <div>
                  <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
                    Station Code *
                  </label>
                  <div className="flex gap-3">
                    <input
                      id="code"
                      type="text"
                      name="code"
                      value={formData.code}
                      onChange={handleChange}
                      className={`input-field font-mono ${readOnly ? 'bg-gray-50 text-gray-600' : ''}`}
                      placeholder="MRT_GLOBALTEK_XXXX"
                      required
                      disabled={isEditing || readOnly}
                    />
                    {!isEditing && !readOnly && (
                      <button
                        type="button"
                        onClick={handleGenerateCode}
                        className="btn-secondary px-4 py-2 min-w-fit flex items-center space-x-2"
                        title="Generate random code"
                      >
                        <RefreshCw size={16} />
                        <span>Generate</span>
                      </button>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Unique identifier for the station (auto-generated from name)
                  </p>
                </div>

                {/* Description */}
                <div>
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    className={`input-field resize-none ${readOnly ? 'bg-gray-50 text-gray-600' : ''}`}
                    placeholder="Description kung saan malapit"
                    readOnly={readOnly}
                  />
                </div>

                {/* Station Order */}
                <div>
                  <label htmlFor="order" className="block text-sm font-medium text-gray-700 mb-2">
                    Station Order *
                  </label>
                  <input
                    id="order"
                    type="number"
                    name="order"
                    value={formData.order}
                    onChange={handleChange}
                    min="1"
                    className={`input-field ${readOnly ? 'bg-gray-50 text-gray-600' : ''}`}
                    placeholder="1"
                    required
                    readOnly={readOnly}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Order position along the MRT line (used for fare calculation)
                  </p>
                </div>

                {/* Coordinates */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Latitude
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={formData.latitude || ''}
                      readOnly
                      className="input-field bg-gray-50 text-gray-600 font-mono"
                      placeholder="0.000000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Longitude
                    </label>
                    <input
                      type="number"
                      step="any"
                      value={formData.longitude || ''}
                      readOnly
                      className="input-field bg-gray-50 text-gray-600 font-mono"
                      placeholder="0.000000"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Map */}
          <div className="space-y-6">
            <div className="card">
              <div className="card-header">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center space-x-2">
                  <MapPin size={20} />
                  <span>Location</span>
                </h3>
              </div>
              <div className="card-body">
                <div className="rounded-lg overflow-hidden border border-gray-200">
                  <MapPicker
                    initialLat={formData.latitude || undefined}
                    initialLng={formData.longitude || undefined}
                    onLocationSelect={handleLocationSelect}
                    readOnly={readOnly}
                  />
                </div>
                <p className="text-sm text-gray-500 mt-3 flex items-start space-x-2">
                  <MapPin size={16} className="mt-0.5 text-gray-400" />
                  <span>
                    {readOnly 
                      ? 'Current station location on the map'
                      : 'Click on the map to set the exact station location'
                    }
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Form Actions */}
        <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
          <button
            type="button"
            onClick={() => router.back()}
            className="btn-secondary px-6 py-3"
          >
            {readOnly ? 'Back' : 'Cancel'}
          </button>
          {!readOnly && (
            <button
              type="submit"
              disabled={loading}
              className="btn-primary px-8 py-3 flex items-center space-x-2"
            >
              {loading && <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />}
              <span>{loading ? 'Saving...' : isEditing ? 'Update Station' : 'Create Station'}</span>
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
