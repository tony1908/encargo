'use client';

import { useState, useEffect } from 'react';
import { Map, Marker } from 'pigeon-maps';
import { MagnifyingGlassIcon, MapPinIcon, TruckIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { useAccount, usePublicClient } from 'wagmi';
import { INSURANCE_CONTRACT_ADDRESS, INSURANCE_CONTRACT_ABI } from '@/contracts/InsuranceContract';
import { arbitrumSepolia } from 'viem/chains';

interface PolicyTrackingData {
  policyId: number;
  containerNumber: string;
  status: string;
  currentLocation: {
    name: string;
    lat: number;
    lng: number;
  };
  origin: {
    name: string;
    lat: number;
    lng: number;
  };
  destination: {
    name: string;
    lat: number;
    lng: number;
  };
  expectedArrival: string;
  estimatedArrival: string;
  active: boolean;
  delayed: boolean;
  delivered: boolean;
  timeline: any[];
}

export default function TrackContainerPage() {
  const { address } = useAccount();
  const publicClient = usePublicClient({ chainId: arbitrumSepolia.id });
  const [containerNumber, setContainerNumber] = useState('');
  const [trackingData, setTrackingData] = useState<PolicyTrackingData | null>(null);
  const [availablePolicies, setAvailablePolicies] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Fetch user's policies on mount
  useEffect(() => {
    const fetchUserPolicies = async () => {
      if (!publicClient || !address) return;

      try {
        const policyIds = await publicClient.readContract({
          address: INSURANCE_CONTRACT_ADDRESS,
          abi: INSURANCE_CONTRACT_ABI,
          functionName: 'getPoliciesByUser',
          args: [address as `0x${string}`],
        }) as bigint[];

        const policies = [];
        for (const policyId of policyIds) {
          const policy = await publicClient.readContract({
            address: INSURANCE_CONTRACT_ADDRESS,
            abi: INSURANCE_CONTRACT_ABI,
            functionName: 'getPolicy',
            args: [policyId],
          }) as any;

          if (policy[3]) { // Only active policies
            policies.push({
              policyId: Number(policyId),
              containerNumber: policy[1],
              expectedArrival: new Date(Number(policy[2]) * 1000),
              active: policy[3],
              delayed: policy[4],
              delivered: policy[5],
            });
          }
        }

        setAvailablePolicies(policies);
      } catch (error) {
        console.error('Error fetching policies:', error);
      }
    };

    fetchUserPolicies();
  }, [publicClient, address]);

  const handleTrack = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // Find matching policy from user's policies
      const matchingPolicy = availablePolicies.find(
        p => p.containerNumber.toLowerCase() === containerNumber.toLowerCase()
      );

      if (!matchingPolicy) {
        setError('Container not found. Please check the container number or ensure you have an active policy.');
        setTrackingData(null);
        setLoading(false);
        return;
      }

      // Define waypoints for trans-Pacific shipping route
      const waypoints = [
        { lat: 31.2304, lng: 121.4737, name: 'Shanghai, China' },        // Origin
        { lat: 20.0, lng: 140.0, name: 'Philippine Sea' },               // Philippine Sea
        { lat: 25.0, lng: 160.0, name: 'Mid-Pacific' },                  // Mid-Pacific
        { lat: 30.0, lng: -170.0, name: 'North Pacific' },               // North Pacific
        { lat: 32.0, lng: -140.0, name: 'Eastern Pacific' },             // Eastern Pacific
        { lat: 33.7701, lng: -118.1937, name: 'Los Angeles, USA' },      // Destination
      ];

      // Calculate current position based on time elapsed
      const now = Date.now();
      const expectedArrivalTime = matchingPolicy.expectedArrival.getTime();
      const startDate = new Date(expectedArrivalTime - 25 * 24 * 60 * 60 * 1000); // 25 days before arrival
      const totalJourney = expectedArrivalTime - startDate.getTime();
      const elapsed = now - startDate.getTime();

      // Calculate progress with bounds
      let progress = Math.min(Math.max(elapsed / totalJourney, 0), 1);

      // If delivered, ship is at destination
      if (matchingPolicy.delivered) {
        progress = 1;
      }
      // If the expected arrival is far in the future or past, place ship in mid-ocean
      else if (progress < 0.1 || expectedArrivalTime < now - 30 * 24 * 60 * 60 * 1000) {
        // Place at mid-ocean point for visibility
        progress = 0.5;
      }

      // Calculate current position along waypoints
      const segmentCount = waypoints.length - 1;
      const segmentProgress = progress * segmentCount;
      const currentSegment = Math.min(Math.floor(segmentProgress), segmentCount - 1);
      const segmentFraction = segmentProgress - currentSegment;

      const startPoint = waypoints[currentSegment];
      const endPoint = waypoints[currentSegment + 1];

      const currentLat = startPoint.lat + (endPoint.lat - startPoint.lat) * segmentFraction;
      const currentLng = startPoint.lng + (endPoint.lng - startPoint.lng) * segmentFraction;

      // Determine location name based on current segment
      let locationName = endPoint.name;
      if (progress < 0.2) locationName = 'East China Sea';
      else if (progress < 0.4) locationName = 'Philippine Sea';
      else if (progress < 0.6) locationName = 'Mid-Pacific Ocean';
      else if (progress < 0.8) locationName = 'North Pacific Ocean';
      else if (progress < 0.95) locationName = 'Eastern Pacific';
      else if (progress >= 1) locationName = 'Los Angeles Port';

      // Generate timeline based on waypoints
      const timeline = [];
      const journeyStages = [
        { progress: 0, location: 'Shanghai, China', status: 'Departed' },
        { progress: 0.2, location: 'Philippine Sea', status: 'At Sea' },
        { progress: 0.4, location: 'Mid-Pacific Ocean', status: 'Transit' },
        { progress: 0.6, location: 'North Pacific', status: 'At Sea' },
        { progress: 0.8, location: 'Eastern Pacific', status: 'Approaching USA' },
        { progress: 1, location: 'Los Angeles, USA', status: matchingPolicy.delivered ? 'Delivered' : 'Expected Arrival' },
      ];

      journeyStages.forEach((stage, index) => {
        const stageTime = startDate.getTime() + (totalJourney * stage.progress);
        const isCompleted = progress >= stage.progress;
        const isCurrent = index === journeyStages.findIndex(s => s.progress > progress) - 1 ||
                         (progress >= 1 && index === journeyStages.length - 1);

        timeline.push({
          location: stage.location,
          date: new Date(stageTime).toLocaleDateString(),
          status: stage.status,
          completed: isCompleted,
          current: isCurrent && !matchingPolicy.delivered,
        });
      });

      const trackingInfo: PolicyTrackingData = {
        policyId: matchingPolicy.policyId,
        containerNumber: matchingPolicy.containerNumber,
        status: matchingPolicy.delivered ? 'Delivered' :
                matchingPolicy.delayed ? 'Delayed' :
                'In Transit',
        currentLocation: {
          name: matchingPolicy.delivered ? 'Los Angeles Port' : locationName,
          lat: matchingPolicy.delivered ? waypoints[waypoints.length - 1].lat : currentLat,
          lng: matchingPolicy.delivered ? waypoints[waypoints.length - 1].lng : currentLng,
        },
        origin: {
          name: waypoints[0].name,
          lat: waypoints[0].lat,
          lng: waypoints[0].lng,
        },
        destination: {
          name: waypoints[waypoints.length - 1].name,
          lat: waypoints[waypoints.length - 1].lat,
          lng: waypoints[waypoints.length - 1].lng,
        },
        expectedArrival: matchingPolicy.expectedArrival.toLocaleDateString(),
        estimatedArrival: matchingPolicy.delayed ?
          new Date(matchingPolicy.expectedArrival.getTime() + 7 * 24 * 60 * 60 * 1000).toLocaleDateString() :
          matchingPolicy.expectedArrival.toLocaleDateString(),
        active: matchingPolicy.active,
        delayed: matchingPolicy.delayed,
        delivered: matchingPolicy.delivered,
        timeline,
      };

      setTrackingData(trackingInfo);
    } catch (error) {
      console.error('Error tracking container:', error);
      setError('Error fetching tracking information. Please try again.');
    } finally {
      setLoading(false);
    }
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
              disabled={loading}
            />
          </div>
          <button
            type="submit"
            disabled={loading || !address}
            className="px-6 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors disabled:bg-gray-400"
          >
            {loading ? 'Tracking...' : 'Track'}
          </button>
        </form>

        {/* Quick select from active policies */}
        {availablePolicies.length > 0 && (
          <div className="mt-3 flex items-center gap-2 flex-wrap">
            <span className="text-xs text-gray-500">Quick select:</span>
            {availablePolicies.map((policy) => (
              <button
                key={policy.policyId}
                onClick={() => setContainerNumber(policy.containerNumber)}
                className="px-2 py-0.5 text-xs bg-gray-100 text-gray-700 rounded hover:bg-gray-200 transition-colors"
              >
                {policy.containerNumber}
              </button>
            ))}
          </div>
        )}

        {error && (
          <div className="mt-3 text-sm text-red-600">{error}</div>
        )}

        {!address && (
          <div className="mt-3 text-sm text-gray-500">
            Please connect your wallet to track containers
          </div>
        )}
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
                    {!trackingData.delivered && (
                      <>
                        <div className="w-1.5 h-1.5 bg-gray-900 rounded-full animate-pulse"></div>
                        <span className="text-gray-600">Live</span>
                      </>
                    )}
                    {trackingData.delayed && (
                      <span className="px-2 py-0.5 bg-gray-900 text-white text-xs font-medium rounded">
                        Delayed
                      </span>
                    )}
                    {trackingData.delivered && (
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-medium rounded">
                        Delivered
                      </span>
                    )}
                  </div>
                </div>
              </div>
              <div className="h-[400px] relative">
                <Map
                  center={[trackingData.currentLocation.lat, trackingData.currentLocation.lng]}
                  zoom={2.5}
                >
                  {/* Origin Port */}
                  <Marker
                    width={30}
                    anchor={[trackingData.origin.lat, trackingData.origin.lng]}
                    color="#9ca3af"
                  />

                  {/* Current Location - Ship - Always show */}
                  <Marker
                    width={50}
                    anchor={[trackingData.currentLocation.lat, trackingData.currentLocation.lng]}
                  >
                    <div className="relative">
                      {/* Ship icon using SVG */}
                      <svg
                        width="40"
                        height="40"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="transform -translate-x-1/2 -translate-y-1/2"
                      >
                        <circle cx="12" cy="12" r="11" fill="white" stroke="#111827" strokeWidth="1"/>
                        {/* Ship icon */}
                        <path
                          d="M12 6v7l-5 3v2a1 1 0 001 1h8a1 1 0 001-1v-2l-5-3V6m0 0L9 8m3-2l3 2"
                          stroke="#111827"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      {/* Pulse animation - only if not delivered */}
                      {!trackingData.delivered && (
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2">
                          <div className="w-10 h-10 bg-gray-900 rounded-full opacity-20 animate-ping"></div>
                        </div>
                      )}
                    </div>
                  </Marker>

                  {/* Destination Port */}
                  <Marker
                    width={30}
                    anchor={[trackingData.destination.lat, trackingData.destination.lng]}
                    color={trackingData.delivered ? "#111827" : "#9ca3af"}
                  />
                </Map>
              </div>
            </div>
          </div>

          {/* Info Panel */}
          <div className="space-y-4">
            {/* Container Details */}
            <div className="bg-white rounded-lg border border-gray-100 p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Container Details</h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500">Container Number</p>
                  <p className="text-sm font-mono font-medium text-gray-900">{trackingData.containerNumber}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Policy ID</p>
                  <p className="text-sm font-medium text-gray-900">#{trackingData.policyId}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Status</p>
                  <p className="text-sm font-medium text-gray-900">{trackingData.status}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Current Location</p>
                  <p className="text-sm font-medium text-gray-900">{trackingData.currentLocation.name}</p>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-500">Origin</p>
                    <p className="text-sm font-medium text-gray-900">{trackingData.origin.name}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Destination</p>
                    <p className="text-sm font-medium text-gray-900">{trackingData.destination.name}</p>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <p className="text-xs text-gray-500">Expected</p>
                    <p className="text-sm font-medium text-gray-900">{trackingData.expectedArrival}</p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Estimated</p>
                    <p className={`text-sm font-medium ${
                      trackingData.delayed ? 'text-gray-900' : 'text-gray-900'
                    }`}>
                      {trackingData.estimatedArrival}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-lg border border-gray-100 p-4">
              <h3 className="text-sm font-medium text-gray-900 mb-3">Journey Timeline</h3>
              <div className="relative">
                <div className="absolute left-2 top-3 bottom-3 w-0.5 bg-gray-200"></div>
                <div className="space-y-3">
                  {trackingData.timeline.map((event, index) => (
                    <div key={index} className="flex gap-3">
                      <div className="relative z-10">
                        <div
                          className={`w-4 h-4 rounded-full border-2 ${
                            event.completed
                              ? 'bg-gray-900 border-gray-900'
                              : event.current
                              ? 'bg-white border-gray-900'
                              : 'bg-white border-gray-300'
                          }`}
                        >
                          {event.current && (
                            <div className="absolute inset-0 rounded-full bg-gray-900 animate-ping"></div>
                          )}
                        </div>
                      </div>
                      <div className="flex-1 -mt-0.5">
                        <p className={`text-sm ${
                          event.completed || event.current ? 'text-gray-900' : 'text-gray-500'
                        }`}>
                          {event.location}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {event.date} • {event.status}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}