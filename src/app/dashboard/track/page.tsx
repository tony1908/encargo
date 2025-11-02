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
    setTrackingData(mockTrackingData);
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-medium text-gray-900">Track Container</h1>
        <p className="text-sm text-gray-500 mt-1">Real-time cargo location</p>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg border border-gray-100 p-4 mb-6">
        <form onSubmit={handleTrack} className="flex gap-3">
          <div className="flex-1 relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="w-4 h-4 text-gray-400" />
            </div>
            <input
              type="text"
              value={containerNumber}
              onChange={(e) => setContainerNumber(e.target.value)}
              placeholder="Enter container number (e.g., MSCU1234567)"
              className="w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg focus:border-gray-900 outline-none transition text-sm"
              required
            />
          </div>
          <button
            type="submit"
            className="px-6 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
          >
            Track
          </button>
        </form>
      </div>

      {trackingData && (
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Map */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-lg border border-gray-100 overflow-hidden">
              <div className="p-3 border-b border-gray-100">
                <div className="flex items-center justify-between">
                  <h2 className="text-sm font-medium text-gray-900">Location</h2>
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-1.5 h-1.5 bg-gray-900 rounded-full animate-pulse"></div>
                    <span className="text-gray-600">Live</span>
                  </div>
                </div>
              </div>
              <div className="h-[400px] relative">
                <Map
                  defaultCenter={[trackingData.currentLocation.lat, trackingData.currentLocation.lng]}
                  defaultZoom={4}
                >
                  {/* Origin */}
                  <Marker
                    width={30}
                    anchor={[trackingData.origin.lat, trackingData.origin.lng]}
                    color="#9ca3af"
                  />
                  {/* Current */}
                  <Marker
                    width={40}
                    anchor={[trackingData.currentLocation.lat, trackingData.currentLocation.lng]}
                    color="#111827"
                  />
                  {/* Destination */}
                  <Marker
                    width={30}
                    anchor={[trackingData.destination.lat, trackingData.destination.lng]}
                    color="#d1d5db"
                  />
                </Map>
              </div>
              <div className="p-3 bg-gray-50 border-t border-gray-100">
                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 bg-gray-400 rounded-full"></div>
                    <span className="text-gray-600">Origin</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 bg-gray-900 rounded-full"></div>
                    <span className="text-gray-600">Current</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-2.5 h-2.5 bg-gray-300 rounded-full"></div>
                    <span className="text-gray-600">Destination</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-lg border border-gray-100 p-6">
              <h2 className="text-sm font-medium text-gray-900 mb-4">Timeline</h2>
              <div className="space-y-4">
                {trackingData.timeline.map((event: any, index: number) => (
                  <div key={index} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center ${
                          event.completed
                            ? 'bg-gray-900'
                            : index === 2
                            ? 'bg-gray-600'
                            : 'bg-gray-200'
                        }`}
                      >
                        {event.completed ? (
                          <CheckCircleIcon className="w-4 h-4 text-white" />
                        ) : index === 2 ? (
                          <TruckIcon className="w-4 h-4 text-white" />
                        ) : (
                          <MapPinIcon className="w-4 h-4 text-gray-500" />
                        )}
                      </div>
                      {index < trackingData.timeline.length - 1 && (
                        <div
                          className={`w-0.5 h-10 ${
                            event.completed ? 'bg-gray-900' : 'bg-gray-200'
                          }`}
                        ></div>
                      )}
                    </div>
                    <div className="flex-1 pb-4">
                      <div className="flex items-center justify-between mb-0.5">
                        <h3 className="text-sm font-medium text-gray-900">{event.location}</h3>
                        <span className="text-xs text-gray-500">{event.date}</span>
                      </div>
                      <p className={`text-xs ${
                        event.completed
                          ? 'text-gray-600'
                          : index === 2
                          ? 'text-gray-900'
                          : 'text-gray-500'
                      }`}>
                        {event.status}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Info Panel */}
          <div className="space-y-4">
            {/* Container Info */}
            <div className="bg-white rounded-lg border border-gray-100 p-4">
              <h2 className="text-sm font-medium text-gray-900 mb-3">Container</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500">Number</p>
                  <p className="font-mono text-sm text-gray-900 mt-0.5">
                    {trackingData.containerNumber}
                  </p>
                </div>
                <div className="pt-2 border-t border-gray-50">
                  <p className="text-xs text-gray-500">Status</p>
                  <div className="flex items-center gap-1.5 mt-1">
                    <div className="w-1.5 h-1.5 bg-gray-900 rounded-full"></div>
                    <p className="text-sm text-gray-900">{trackingData.status}</p>
                  </div>
                </div>
                <div className="pt-2 border-t border-gray-50">
                  <p className="text-xs text-gray-500">Location</p>
                  <p className="text-sm text-gray-900 mt-0.5">
                    {trackingData.currentLocation.name}
                  </p>
                </div>
              </div>
            </div>

            {/* Delivery Info */}
            <div className="bg-white rounded-lg border border-gray-100 p-4">
              <h2 className="text-sm font-medium text-gray-900 mb-3">Delivery</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500">Origin</p>
                  <p className="text-sm text-gray-900 mt-0.5">{trackingData.origin.name}</p>
                </div>
                <div className="pt-2 border-t border-gray-50">
                  <p className="text-xs text-gray-500">Destination</p>
                  <p className="text-sm text-gray-900 mt-0.5">{trackingData.destination.name}</p>
                </div>
                <div className="pt-2 border-t border-gray-50">
                  <p className="text-xs text-gray-500">Expected</p>
                  <p className="text-sm text-gray-900 mt-0.5">{trackingData.expectedArrival}</p>
                </div>
                <div className="pt-2 border-t border-gray-50">
                  <p className="text-xs text-gray-500">Estimated</p>
                  <p className="text-sm text-gray-900 mt-0.5">{trackingData.estimatedArrival}</p>
                </div>
              </div>
            </div>

            {/* Status */}
            <div className="bg-gray-900 text-white rounded-lg p-4">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircleIcon className="w-4 h-4" />
                <h3 className="text-sm font-medium">On Schedule</h3>
              </div>
              <p className="text-xs text-gray-300">
                Container tracking on time for delivery
              </p>
            </div>
          </div>
        </div>
      )}

      {!trackingData && (
        <div className="bg-white rounded-lg border border-gray-100 p-12 text-center">
          <MapPinIcon className="w-8 h-8 text-gray-300 mx-auto mb-3" />
          <h3 className="text-sm font-medium text-gray-900 mb-1">Track Your Container</h3>
          <p className="text-xs text-gray-500">
            Enter tracking number to view real-time location
          </p>
        </div>
      )}
    </div>
  );
}