'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Plus, Search, MapPin, Trash2, Edit, QrCode, Download, X, Eye, Shield } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';

interface Station {
  _id: string;
  name: string;
  code: string;
  latitude: number;
  longitude: number;
  description?: string;
}

interface User {
  username: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
  lastLogin?: string;
  createdAt: string;
}

export default function StationsPage() {
  const [stations, setStations] = useState<Station[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);

  useEffect(() => {
    fetchCurrentUser();
    fetchStations();
  }, []);

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

  const fetchStations = async () => {
    try {
      const res = await fetch('/api/stations');
      const data = await res.json();
      if (data.stations) {
        setStations(data.stations);
      }
    } catch (error) {
      console.error('Error fetching stations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (user?.role !== 'super_admin') {
      alert('You do not have permission to delete stations.');
      return;
    }
    
    if (!confirm('Are you sure you want to delete this station?')) return;
    
    try {
      const res = await fetch(`/api/stations/${id}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        setStations(stations.filter(s => s._id !== id));
      } else {
        alert('Failed to delete station');
      }
    } catch (error) {
      console.error('Error deleting station:', error);
    }
  };

  const canCreateStations = user?.role === 'super_admin';
  const canEditStations = user?.role === 'super_admin';
  const canDeleteStations = user?.role === 'super_admin';

  const downloadQR = () => {
    const canvas = document.getElementById('qr-code-canvas') as HTMLCanvasElement;
    if (canvas) {
      const url = canvas.toDataURL('image/png');
      const a = document.createElement('a');
      a.href = url;
      a.download = `QR_${selectedStation?.name || 'Station'}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const filteredStations = stations.filter(station => 
    station.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    station.code.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => {
    // Sort by order field, with stations without order at the end
    const orderA = (a as any).order || 999;
    const orderB = (b as any).order || 999;
    return orderA - orderB;
  });

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Stations</h1>
          <p className="text-gray-600">
            {canEditStations ? 'Manage MRT system stations and their locations' : 'View MRT system stations and their locations'}
          </p>
          {!canEditStations && (
            <div className="flex items-center text-amber-600 text-sm mt-2 bg-amber-50 px-3 py-2 rounded-lg">
              <Eye size={16} className="mr-2" />
              <span>You have view-only access to stations</span>
            </div>
          )}
        </div>
        {canCreateStations && (
          <Link
            href="/admin/stations/new"
            className="btn-primary flex items-center space-x-2 w-fit"
          >
            <Plus size={20} />
            <span>Add Station</span>
          </Link>
        )}
      </div>

      {/* Search Bar */}
      <div className="card">
        <div className="card-body">
          <div className="relative">
            <input
              type="text"
              placeholder="Search stations by name or code..."
              className="input-field w-full"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          {searchTerm && (
            <p className="text-sm text-gray-600 mt-2">
              {filteredStations.length} of {stations.length} stations match your search
            </p>
          )}
        </div>
      </div>

      {/* Stations Grid */}
      {loading ? (
        <div className="flex justify-center py-12">
          <div className="flex items-center space-x-3 text-gray-600">
            <div className="w-6 h-6 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
            <span>Loading stations...</span>
          </div>
        </div>
      ) : (
        <>
          {filteredStations.length === 0 ? (
            <div className="card">
              <div className="card-body text-center py-12">
                {stations.length === 0 ? (
                  <>
                    <MapPin className="mx-auto mb-4 text-gray-400" size={48} />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No stations created yet</h3>
                    <p className="text-gray-600 mb-6">
                      {canCreateStations 
                        ? 'Get started by creating your first MRT station'
                        : 'No stations have been created yet'
                      }
                    </p>
                    {canCreateStations && (
                      <Link
                        href="/admin/stations/new"
                        className="btn-primary inline-flex items-center space-x-2"
                      >
                        <Plus size={20} />
                        <span>Create First Station</span>
                      </Link>
                    )}
                  </>
                ) : (
                  <>
                    <Search className="mx-auto mb-4 text-gray-400" size={48} />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No stations found</h3>
                    <p className="text-gray-600">Try adjusting your search terms</p>
                  </>
                )}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredStations.map((station) => (
                <div key={station._id} className="card hover:shadow-md transition-shadow duration-200">
                  <div className="card-body">
                    {/* Station Header */}
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="text-lg font-semibold text-gray-900 truncate">{station.name}</h3>
                          {(station as any).order && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                              #{(station as any).order}
                            </span>
                          )}
                        </div>
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                          {station.code}
                        </span>
                      </div>
                      <div className="ml-4 bg-gray-50 p-2 rounded-lg flex-shrink-0">
                        <QRCodeCanvas value={station._id} size={48} level="H" />
                      </div>
                    </div>
                    
                    {/* Location Info */}
                    <div className="flex items-center text-gray-600 text-sm mb-3">
                      <MapPin size={16} className="mr-2 flex-shrink-0" />
                      <span className="truncate">
                        {station.latitude.toFixed(4)}, {station.longitude.toFixed(4)}
                      </span>
                    </div>
                    
                    {/* Description */}
                    {station.description && (
                      <p className="text-gray-600 text-sm line-clamp-2 mb-4">{station.description}</p>
                    )}
                  </div>

                  {/* Card Actions */}
                  <div className="card-footer">
                    <div className="flex items-center justify-between">
                      <div className="flex space-x-1">
                        {canEditStations ? (
                          <Link
                            href={`/admin/stations/${station._id}`}
                            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                            title="Edit station"
                          >
                            <Edit size={16} />
                          </Link>
                        ) : (
                          <Link
                            href={`/admin/stations/${station._id}`}
                            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                            title="View station"
                          >
                            <Eye size={16} />
                          </Link>
                        )}
                        {canDeleteStations && (
                          <button
                            onClick={() => handleDelete(station._id)}
                            className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                            title="Delete station"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                      <button
                        onClick={() => setSelectedStation(station)}
                        className="flex items-center justify-center w-10 h-10 rounded-full text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
                        title="View QR Code"
                      >
                        <QrCode size={20} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* QR Code Modal */}
      {selectedStation && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full mx-4 overflow-hidden">
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{selectedStation.name}</h3>
                  <p className="text-sm text-gray-600 font-mono">{selectedStation.code}</p>
                </div>
                <button 
                  onClick={() => setSelectedStation(null)}
                  className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            
            {/* Modal Body */}
            <div className="px-6 py-6">
              <div className="text-center">
                <div className="bg-white border border-gray-200 rounded-xl p-6 inline-block mb-6 shadow-sm">
                  <QRCodeCanvas 
                    id="qr-code-canvas"
                    value={selectedStation._id} 
                    size={200} 
                    level="H"
                    includeMargin={true}
                  />
                </div>
                
                <p className="text-sm text-gray-600 mb-6">
                  Scan this QR code to access station information
                </p>
              </div>
            </div>
            
            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <div className="flex space-x-3">
                <button
                  onClick={downloadQR}
                  className="btn-primary flex-1 flex items-center justify-center space-x-2"
                >
                  <Download size={16} />
                  <span>Download PNG</span>
                </button>
                <button
                  onClick={() => setSelectedStation(null)}
                  className="btn-secondary flex-1"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
