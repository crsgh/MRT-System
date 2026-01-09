'use client';

import { useState, useEffect } from 'react';
import { QrCode, MapPin, Clock, User, CheckCircle, XCircle } from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';

interface Station {
  _id: string;
  name: string;
}

interface Passenger {
  id: string;
  username: string;
  firstName: string;
  lastName: string;
}

interface ActiveTrip {
  id: string;
  startStation: string;
  tapInTime: string;
  status: string;
}

interface Trip {
  id: string;
  passengerName: string;
  passengerCode: string;
  startStation: string;
  endStation: string;
  tapInTime: string;
  tapOutTime: string;
  status: string;
  fare: number;
}

export default function QRTestingPage() {
  const [stations, setStations] = useState<Station[]>([]);
  const [passengers, setPassengers] = useState<Passenger[]>([]);
  const [selectedPassengerCode, setSelectedPassengerCode] = useState('');
  const [selectedStationId, setSelectedStationId] = useState('');
  const [action, setAction] = useState<'tap_in' | 'tap_out'>('tap_in');
  const [selectedDiscountType, setSelectedDiscountType] = useState<'none' | 'senior' | 'pwd' | 'student'>('none');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState<'success' | 'error'>('success');
  const [passengerInfo, setPassengerInfo] = useState<{passenger: Passenger, activeTrip: ActiveTrip | null} | null>(null);
  const [recentTrips, setRecentTrips] = useState<Trip[]>([]);

  useEffect(() => {
    fetchStations();
    fetchPassengers();
    fetchRecentTrips();
  }, []);

  const fetchPassengers = async () => {
    try {
      const res = await fetch('/api/passengers');
      if (res.ok) {
        const data = await res.json();
        setPassengers(data.passengers);
      }
    } catch (error) {
      console.error('Error fetching passengers:', error);
    }
  };

  const fetchStations = async () => {
    try {
      const res = await fetch('/api/stations');
      if (res.ok) {
        const data = await res.json();
        setStations(data.stations);
      }
    } catch (error) {
      console.error('Error fetching stations:', error);
    }
  };

  const fetchRecentTrips = async () => {
    try {
      const res = await fetch('/api/trips');
      if (res.ok) {
        const data = await res.json();
        setRecentTrips(data.trips);
      }
    } catch (error) {
      console.error('Error fetching trips:', error);
    }
  };

  const lookupPassenger = async (passengerCode: string) => {
    if (!passengerCode) return;
    try {
      const res = await fetch(`/api/trips?passengerCode=${passengerCode}`);
      if (res.ok) {
        const data = await res.json();
        setPassengerInfo(data);
        // Only set discount type if this is a new passenger selection
        setSelectedDiscountType(data.passenger && data.passenger.discountType ? data.passenger.discountType : 'none');
        if (data.activeTrip) {
          setAction('tap_out');
        } else {
          setAction('tap_in');
        }
      } else {
        setPassengerInfo(null);
        setMessage('Passenger not found');
        setMessageType('error');
      }
    } catch (error) {
      console.error('Error looking up passenger:', error);
      setMessage('Error looking up passenger');
      setMessageType('error');
    }
  };

  const handlePassengerChange = (passengerCode: string) => {
    setSelectedPassengerCode(passengerCode);
    setMessage('');
    if (passengerCode) {
      lookupPassenger(passengerCode);
    } else {
      setPassengerInfo(null);
      setSelectedDiscountType('none');
      setAction('tap_in');
    }
  };

  const updateDiscountType = async (newDiscountType: 'none' | 'senior' | 'pwd' | 'student') => {

    if (!selectedPassengerCode) {
      setMessage('Please select a passenger first');
      setMessageType('error');
      return;
    }

    const prev = selectedDiscountType;
    // Optimistically update UI so the dropdown appears responsive
    setSelectedDiscountType(newDiscountType);

    try {
      const res = await fetch('/api/passengers/update-discount', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          passengerCode: selectedPassengerCode,
          discountType: newDiscountType
        })
      });

      if (res.ok) {
        setMessage(`Discount type updated to ${newDiscountType === 'none' ? 'Regular' : newDiscountType.toUpperCase()}`);
        setMessageType('success');
        // Refresh passenger info to reflect the updated discount type
        lookupPassenger(selectedPassengerCode);
      } else {
        setSelectedDiscountType(prev);
        const text = await res.text().catch(() => 'Failed to update discount type');
        setMessage(text || 'Failed to update discount type');
        setMessageType('error');
      }
    } catch (error) {
      console.error('Error updating discount type:', error);
      setSelectedDiscountType(prev);
      setMessage('Error updating discount type');
      setMessageType('error');
    }
  };

  const simulateTap = async () => {
    if (!selectedPassengerCode || !selectedStationId) {
      setMessage('Please select passenger and station');
      setMessageType('error');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const res = await fetch('/api/trips', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action,
          passengerCode: selectedPassengerCode,
          stationId: selectedStationId
        })
      });

      const data = await res.json();

      if (res.ok) {
        setMessage(data.message);
        setMessageType('success');
        
        lookupPassenger(selectedPassengerCode);
        fetchRecentTrips();
        
        if (action === 'tap_in') {
          setAction('tap_out');
        } else {
          setAction('tap_in');
          setSelectedPassengerCode('');
          setPassengerInfo(null);
        }
      } else {
        setMessage(data.error);
        setMessageType('error');
      }
    } catch (error) {
      console.error('Error simulating tap:', error);
      setMessage('Error processing tap');
      setMessageType('error');
    } finally {
      setLoading(false);
    }
  };

  // For display purposes - creates QR code data that mobile apps can scan
  // Mobile app will display this QR or scan station QRs for tap in/out
  const getQRCodeData = (passengerCode: string): string => {
    return JSON.stringify({
      type: 'mrt_passenger',
      passengerCode: passengerCode,
      timestamp: Date.now()
    });
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center space-x-3 mb-6">
        <QrCode className="text-gray-700" size={24} />
        <h1 className="text-2xl font-bold text-black">QR Code Testing Interface</h1>
      </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6 mb-6">
        <h2 className="text-lg font-semibold text-black mb-4">Quick Start Guide</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-black mb-2">Available Passengers:</h3>
            {passengers.length > 0 ? (
              <ul className="text-sm space-y-1 text-gray-600">
                {passengers.slice(0, 5).map(p => (
                  <li key={p.username}>
                    <code className="bg-gray-100 px-2 py-1 rounded">{p.username}</code> - {p.firstName} {p.lastName}
                  </li>
                ))}
                {passengers.length > 5 && <li className="text-gray-500">...and {passengers.length - 5} more</li>}
              </ul>
            ) : (
              <p className="text-sm text-gray-500">Loading passengers...</p>
            )}
          </div>
          <div>
            <h3 className="font-medium text-black mb-2">How to Test:</h3>
            <ol className="text-sm space-y-1 text-gray-600 list-decimal list-inside">
              <li>Select a passenger from the dropdown</li>
              <li>Select a station for tap in</li>
              <li>Click "Simulate Tap In"</li>
              <li>Change station and click "Simulate Tap Out"</li>
              <li>View the completed trip in the activity table</li>
            </ol>
            <p className="text-xs text-gray-500 mt-2">
              * Passengers are loaded from the database with "passenger" role
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-black mb-4">Simulate Tap In/Out</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Select Passenger
              </label>
              <select
                value={selectedPassengerCode}
                onChange={(e) => handlePassengerChange(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-black focus:border-black focus:ring-1 focus:ring-black"
              >
                <option value="">Choose a passenger</option>
                {passengers.map((passenger) => (
                  <option key={passenger.username} value={passenger.username}>
                    {passenger.firstName} {passenger.lastName} ({passenger.username})
                  </option>
                ))}
              </select>
            </div>

            {passengerInfo && (
              <div className={`p-4 rounded-lg border ${
                passengerInfo.activeTrip 
                  ? 'bg-amber-50 border-amber-200' 
                  : 'bg-blue-50 border-blue-200'
              }`}>
                <div className="flex items-center space-x-2 mb-2">
                  <User className="text-gray-600" size={16} />
                  <span className="font-medium text-black">
                    {passengerInfo.passenger.firstName} {passengerInfo.passenger.lastName}
                  </span>
                  {(passengerInfo.passenger as any).discountType && (passengerInfo.passenger as any).discountType !== 'none' && (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                      {((passengerInfo.passenger as any).discountType as string).toUpperCase()} - 50% OFF
                    </span>
                  )}
                </div>
                {passengerInfo.activeTrip ? (
                  <div className="mt-2">
                    <div className="flex items-center text-amber-700 text-sm font-medium mb-1">
                      <span className="w-2 h-2 bg-amber-500 rounded-full mr-2"></span>
                      Journey in progress - Ready to tap out
                    </div>
                    <div className="text-sm text-gray-600">
                      Started from: <strong>{passengerInfo.activeTrip.startStation}</strong><br />
                      Time: {new Date(passengerInfo.activeTrip.tapInTime).toLocaleString()}
                    </div>
                  </div>
                ) : (
                  <div className="mt-2">
                    <div className="flex items-center text-blue-700 text-sm font-medium">
                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-2"></span>
                      Ready to start new journey
                    </div>
                  </div>
                )}
              </div>
            )}

            {passengerInfo && (
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Discount Type (Testing)
                </label>
                <select
                  value={selectedDiscountType}
                  onChange={(e) => updateDiscountType(e.target.value as 'none' | 'senior' | 'pwd' | 'student')}
                  className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-black focus:border-black focus:ring-1 focus:ring-black"
                >
                  <option value="none">Regular Passenger (Full Fare)</option>
                  <option value="senior">Senior Citizen (50% Discount)</option>
                  <option value="pwd">Person with Disability (50% Discount)</option>
                  <option value="student">Student (50% Discount)</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Change discount type for testing. Expected discount: {selectedDiscountType === 'none' ? 'None' : '50% off regular fare'}
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Station
              </label>
              <select
                value={selectedStationId}
                onChange={(e) => setSelectedStationId(e.target.value)}
                className="w-full px-3 py-2 bg-white border border-gray-300 rounded-md text-black focus:border-black focus:ring-1 focus:ring-black"
              >
                <option value="">Select a station</option>
                {stations
                  .sort((a, b) => {
                    // Sort by order field, with stations without order at the end
                    const orderA = (a as any).order || 999;
                    const orderB = (b as any).order || 999;
                    return orderA - orderB;
                  })
                  .map((station) => (
                    <option key={station._id} value={station._id}>
                      {(station as any).order ? `#${(station as any).order} - ` : ''}{station.name}
                    </option>
                  ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Action
              </label>
              <div className="flex space-x-4">
                <label className={`flex items-center ${
                  passengerInfo?.activeTrip ? 'opacity-50 cursor-not-allowed' : ''
                }`}>
                  <input
                    type="radio"
                    value="tap_in"
                    checked={action === 'tap_in'}
                    onChange={(e) => setAction(e.target.value as 'tap_in' | 'tap_out')}
                    className="mr-2"
                    disabled={!!passengerInfo?.activeTrip}
                  />
                  <span className="text-black">Tap In</span>
                  {!passengerInfo?.activeTrip && (
                    <span className="text-xs text-gray-500 ml-1">(Start journey)</span>
                  )}
                </label>
                <label className={`flex items-center ${
                  !passengerInfo?.activeTrip ? 'opacity-50 cursor-not-allowed' : ''
                }`}>
                  <input
                    type="radio"
                    value="tap_out"
                    checked={action === 'tap_out'}
                    onChange={(e) => setAction(e.target.value as 'tap_in' | 'tap_out')}
                    className="mr-2"
                    disabled={!passengerInfo?.activeTrip}
                  />
                  <span className="text-black">Tap Out</span>
                  {passengerInfo?.activeTrip && (
                    <span className="text-xs text-gray-500 ml-1">(End journey & pay fare)</span>
                  )}
                </label>
              </div>
            </div>

            <button
              onClick={simulateTap}
              disabled={loading}
              className="w-full px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {loading ? 'Processing...' : `Simulate ${action === 'tap_in' ? 'Tap In' : 'Tap Out'}`}
            </button>

            {message && (
              <div className={`p-3 rounded-md flex items-center space-x-2 ${
                messageType === 'success' 
                  ? 'bg-gray-100 text-black border border-gray-300' 
                  : 'bg-gray-100 text-black border border-gray-400'
              }`}>
                {messageType === 'success' ? (
                  <CheckCircle className="text-gray-600" size={16} />
                ) : (
                  <XCircle className="text-gray-600" size={16} />
                )}
                <span>{message}</span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-6">
          <h2 className="text-lg font-semibold text-black mb-4">QR Code Generator (Mobile Ready)</h2>
          
          {selectedPassengerCode && (
            <div className="text-center">
              <div className="mb-4 bg-gray-50 p-6 rounded-lg inline-block">
                <QRCodeCanvas
                  value={getQRCodeData(selectedPassengerCode)}
                  size={200}
                  level="H"
                  includeMargin={true}
                />
              </div>
              <p className="text-sm text-gray-600">
                QR Code for passenger: <strong className="text-black">{selectedPassengerCode}</strong>
              </p>
              <p className="text-xs text-gray-500 mt-2">
                This QR code can be scanned by station staff or displayed on passenger's mobile phone
              </p>
            </div>
          )}
          
          {!selectedPassengerCode && (
            <div className="text-center py-8 text-gray-500">
              <QrCode className="mx-auto mb-3 text-gray-400" size={48} />
              <p>Select a passenger to generate QR code</p>
            </div>
          )}
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-black flex items-center space-x-2">
            <Clock className="text-gray-600" size={20} />
            <span>Recent Trip Activity</span>
          </h2>
        </div>
        <div className="p-6">
          {recentTrips.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <MapPin className="mx-auto mb-3 text-gray-400" size={48} />
              <h3 className="font-medium text-black mb-1">No trips yet</h3>
              <p className="text-sm">Trip activity will appear here once passengers start using the system</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 text-sm font-medium text-gray-600">Passenger</th>
                    <th className="text-left py-2 text-sm font-medium text-gray-600">Route</th>
                    <th className="text-left py-2 text-sm font-medium text-gray-600">Time</th>
                    <th className="text-left py-2 text-sm font-medium text-gray-600">Fare</th>
                    <th className="text-left py-2 text-sm font-medium text-gray-600">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {recentTrips.map((trip) => (
                    <tr key={trip.id} className="border-b border-gray-100">
                      <td className="py-3">
                        <div className="text-sm font-medium text-black">{trip.passengerName}</div>
                        <div className="text-xs text-gray-500">{trip.passengerCode}</div>
                      </td>
                      <td className="py-3 text-sm text-gray-700">
                        {trip.startStation} → {trip.endStation || '...'}
                      </td>
                      <td className="py-3 text-xs text-gray-500">
                        <div>In: {new Date(trip.tapInTime).toLocaleString()}</div>
                        {trip.tapOutTime && (
                          <div>Out: {new Date(trip.tapOutTime).toLocaleString()}</div>
                        )}
                      </td>
                      <td className="py-3 text-sm font-medium text-black">
                        {trip.fare ? `₱${trip.fare.toFixed(0)}` : '-'}
                      </td>
                      <td className="py-3">
                        <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                          trip.status === 'completed' 
                            ? 'bg-gray-100 text-gray-800 border border-gray-200' 
                            : trip.status === 'active'
                            ? 'bg-black text-white'
                            : 'bg-gray-100 text-gray-600 border border-gray-200'
                        }`}>
                          {trip.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}