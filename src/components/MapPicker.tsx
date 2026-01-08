'use client';

import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api';
import { useState } from 'react';
import { MapPin, AlertCircle, RefreshCw } from 'lucide-react';

const containerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '0.5rem',
};

const defaultCenter = {
  lat: 14.5995, // Manila coordinates
  lng: 120.9842,
};

interface MapPickerProps {
  initialLat?: number;
  initialLng?: number;
  onLocationSelect: (lat: number, lng: number) => void;
  readOnly?: boolean;
}

export default function MapPicker({ initialLat, initialLng, onLocationSelect, readOnly = false }: MapPickerProps) {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
  const validKey = apiKey && apiKey !== 'your_google_maps_api_key' ? apiKey : '';
  const [selectedMarker, setSelectedMarker] = useState<{ lat: number; lng: number } | null>(null);

  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: validKey,
  });

  const marker =
    typeof initialLat === 'number' && typeof initialLng === 'number' && !(initialLat === 0 && initialLng === 0)
      ? { lat: initialLat, lng: initialLng }
      : selectedMarker;

  const onClick = (e: google.maps.MapMouseEvent) => {
    if (readOnly) return; // Don't allow clicks in read-only mode
    
    if (e.latLng) {
      const lat = e.latLng.lat();
      const lng = e.latLng.lng();
      setSelectedMarker({ lat, lng });
      onLocationSelect(lat, lng);
    }
  };

  const handleRetry = () => {
    window.location.reload();
  };

  if (loadError) {
    return (
      <div className="h-[400px] w-full bg-red-50 border-2 border-dashed border-red-200 rounded-lg flex flex-col items-center justify-center text-center p-6">
        <div className="bg-red-100 p-3 rounded-full mb-4">
          <AlertCircle className="text-red-600" size={32} />
        </div>
        <h3 className="font-semibold text-red-800 mb-2">Map Failed to Load</h3>
        <p className="text-sm text-red-700 mb-4 max-w-md">
          {loadError.message.includes('API') 
            ? 'Please check your Google Maps API key configuration.'
            : 'Please check your internet connection and try again.'}
        </p>
        <div className="space-y-2">
          <button
            onClick={handleRetry}
            className="btn-secondary flex items-center space-x-2"
          >
            <RefreshCw size={16} />
            <span>Retry</span>
          </button>
          <p className="text-xs text-red-600 max-w-sm">
            Error details: {loadError.message}
          </p>
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="h-[400px] w-full bg-gray-100 rounded-lg flex flex-col items-center justify-center">
        <div className="flex items-center space-x-3 text-gray-600">
          <div className="w-8 h-8 border-3 border-gray-300 border-t-gray-600 rounded-full animate-spin" />
          <div className="text-center">
            <p className="font-medium">Loading Map...</p>
            <p className="text-sm text-gray-500">Please wait while we load Google Maps</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative">
      <GoogleMap
        mapContainerStyle={containerStyle}
        center={marker || defaultCenter}
        zoom={13}
        onClick={onClick}
        options={{
          streetViewControl: false,
          mapTypeControl: false,
          fullscreenControl: false,
          disableDoubleClickZoom: readOnly,
          draggable: !readOnly,
          zoomControl: !readOnly,
          scrollwheel: !readOnly,
          gestureHandling: readOnly ? 'none' : 'auto',
        }}
      >
        {marker && (
          <Marker 
            position={marker} 
            icon={{
              path: 'M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z',
              fillColor: '#000000',
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 2,
              scale: 1.5,
            }}
          />
        )}
      </GoogleMap>
      
      {/* Map Instructions */}
      <div className="absolute top-3 left-3 bg-white bg-opacity-90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-sm border border-gray-200">
        <div className="flex items-center space-x-2 text-sm text-gray-700">
          <MapPin size={16} className="text-gray-500" />
          <span>
            {readOnly 
              ? 'Station location'
              : marker 
                ? 'Location selected' 
                : 'Click on map to select location'
            }
          </span>
        </div>
      </div>

      {/* Coordinates Display */}
      {marker && (
        <div className="absolute bottom-3 left-3 bg-white bg-opacity-90 backdrop-blur-sm rounded-lg px-3 py-2 shadow-sm border border-gray-200">
          <div className="text-xs text-gray-600 font-mono">
            {marker.lat.toFixed(6)}, {marker.lng.toFixed(6)}
          </div>
        </div>
      )}
    </div>
  );
}