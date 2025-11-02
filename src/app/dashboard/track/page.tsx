'use client';

import { useState } from 'react';
import { Map, Marker } from 'pigeon-maps';
import { MagnifyingGlassIcon, MapPinIcon, TruckIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

export default function TrackContainerPage() {
  const [containerNumber, setContainerNumber] = useState('');
  const [trackingData, setTrackingData] = useState<any>(null);

  // Mock tracking data
  const mockTrackingData = {
    containerNumber: 'MSCU1234567',
    status: 'In Transit',
    currentLocation: {
      name: 'Port of Singapore',
      lat: 1.2644,
      lng: 103.8228,
    },
    origin: {
      name: 'Shanghai, China',
      lat: 31.2304,
      lng: 121.4737,
    },
    destination: {
      name: 'Los Angeles, USA',
      lat: 33.7701,
      lng: -118.1937,
    },
    expectedArrival: '2024-12-15',
    estimatedArrival: '2024-12-15',
    timeline: [
      {
        location: 'Shanghai, China',
        date: '2024-11-20',
        status: 'Departed',
        completed: true,
      },
      {
        location: 'Port of Singapore',
        date: '2024-11-28',
        status: 'Arrived',
        completed: true,
      },
      {
        location: 'Singapore',
        date: '2024-11-30',
        status: 'In Transit',
        completed: false,
      },
      {
        location: 'Los Angeles, USA',
        date: '2024-12-15',
        status: 'Expected',
        completed: false,
      },
    ],
  };

  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    // Simulate API call
    setTrackingData(mockTrackingData);
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Track Container</h1>
        <p className="text-gray-600">Real-time location tracking of your cargo</p>
      </div>

      {/* Search Section */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <form onSubmit={handleTrack} className="flex gap-3">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="w-5 h-5 text-gray-400" />
            </div>
            <input
              type="text"
              value={containerNumber}
              onChange={(e) => setContainerNumber(e.target.value)}
              placeholder="Enter container tracking number (e.g., MSCU1234567)"
              className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition"
              required
            />
          </div>
          <button
            type="submit"
            className="px-8 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Track
          </button>
        </form>
      </div>

      {trackingData && (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Map Section */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="p-4 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-gray-900">Current Location</h2>
                  <div className="flex items-center gap-2 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-gray-600">Live</span>
                  </div>
                </div>
              </div>
              <div className="h-[400px] relative">
                <Map
                  defaultCenter={[trackingData.currentLocation.lat, trackingData.currentLocation.lng]}
                  defaultZoom={4}
                >
                  {/* Origin Marker */}
                  <Marker
                    width={40}
                    anchor={[trackingData.origin.lat, trackingData.origin.lng]}
                    color="#6366f1"
                  />
                  {/* Current Location Marker */}
                  <Marker
                    width={50}
                    anchor={[trackingData.currentLocation.lat, trackingData.currentLocation.lng]}
                    color="#10b981"
                  />
                  {/* Destination Marker */}
                  <Marker
                    width={40}
                    anchor={[trackingData.destination.lat, trackingData.destination.lng]}
                    color="#f59e0b"
                  />
                </Map>
              </div>
              <div className="p-4 bg-gray-50 border-t border-gray-100">
                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
                    <span className="text-gray-600">Origin</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span className="text-gray-600">Current</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-amber-500 rounded-full"></div>
                    <span className="text-gray-600">Destination</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-semibold text-gray-900 mb-6">Shipment Timeline</h2>
              <div className="space-y-6">
                {trackingData.timeline.map((event: any, index: number) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          event.completed
                            ? 'bg-green-500'
                            : index === 2
                            ? 'bg-blue-500'
                            : 'bg-gray-300'
                        }`}
                      >
                        {event.completed ? (
                          <CheckCircleIcon className="w-6 h-6 text-white" />
                        ) : index === 2 ? (
                          <TruckIcon className="w-6 h-6 text-white" />
                        ) : (
                          <MapPinIcon className="w-6 h-6 text-white" />
                        )}
                      </div>
                      {index < trackingData.timeline.length - 1 && (
                        <div
                          className={`w-0.5 h-12 ${
                            event.completed ? 'bg-green-500' : 'bg-gray-300'
                          }`}
                        ></div>
                      )}
                    </div>
                    <div className="flex-1 pb-6">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-medium text-gray-900">{event.location}</h3>
                        <span className="text-sm text-gray-500">{event.date}</span>
                      </div>
                      <p
                        className={`text-sm ${
                          event.completed
                            ? 'text-green-600'
                            : index === 2
                            ? 'text-blue-600'
                            : 'text-gray-600'
                        }`}
                      >
                        {event.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Info Panel */}
          <div className="space-y-6">
            {/* Container Info */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Container Information</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Container Number</p>
                  <p className="font-mono font-semibold text-gray-900">
                    {trackingData.containerNumber}
                  </p>
                </div>
                <div className="pt-3 border-t border-gray-100">
                  <p className="text-sm text-gray-600 mb-1">Status</p>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <p className="font-semibold text-blue-600">{trackingData.status}</p>
                  </div>
                </div>
                <div className="pt-3 border-t border-gray-100">
                  <p className="text-sm text-gray-600 mb-1">Current Location</p>
                  <p className="font-semibold text-gray-900">
                    {trackingData.currentLocation.name}
                  </p>
                </div>
              </div>
            </div>

            {/* Delivery Info */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="font-semibold text-gray-900 mb-4">Delivery Information</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-sm text-gray-600 mb-1">Origin</p>
                  <p className="font-semibold text-gray-900">{trackingData.origin.name}</p>
                </div>
                <div className="pt-3 border-t border-gray-100">
                  <p className="text-sm text-gray-600 mb-1">Destination</p>
                  <p className="font-semibold text-gray-900">{trackingData.destination.name}</p>
                </div>
                <div className="pt-3 border-t border-gray-100">
                  <p className="text-sm text-gray-600 mb-1">Expected Arrival</p>
                  <p className="font-semibold text-gray-900">{trackingData.expectedArrival}</p>
                </div>
                <div className="pt-3 border-t border-gray-100">
                  <p className="text-sm text-gray-600 mb-1">Estimated Arrival</p>
                  <p className="font-semibold text-green-600">{trackingData.estimatedArrival}</p>
                </div>
              </div>
            </div>

            {/* Status Badge */}
            <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl p-6 text-white">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircleIcon className="w-6 h-6" />
                <h3 className="font-semibold">On Schedule</h3>
              </div>
              <p className="text-sm text-green-100">
                Your container is on track for on-time delivery
              </p>
            </div>
          </div>
        </div>
      )}

      {!trackingData && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MapPinIcon className="w-8 h-8 text-indigo-600" />
          </div>
          <h3 className="font-semibold text-gray-900 mb-2">Track Your Container</h3>
          <p className="text-sm text-gray-600 max-w-md mx-auto">
            Enter your container tracking number above to view real-time location and shipment status
          </p>
        </div>
      )}
    </div>
  );
}
