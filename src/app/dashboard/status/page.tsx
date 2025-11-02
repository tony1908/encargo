'use client';

import { CheckCircleIcon, ClockIcon, XCircleIcon, TruckIcon } from '@heroicons/react/24/outline';

export default function DeliveryStatusPage() {
  // Mock data for active shipments
  const shipments = [
    {
      id: 1,
      containerNumber: 'MSCU1234567',
      origin: 'Shanghai, China',
      destination: 'Los Angeles, USA',
      merchandiseValue: 50000,
      expectedArrival: '2024-12-15',
      estimatedArrival: '2024-12-15',
      status: 'on-time',
      daysUntilArrival: 14,
      insurancePremium: 1000,
      currentLocation: 'Port of Singapore',
    },
    {
      id: 2,
      containerNumber: 'HLCU987654',
      origin: 'Rotterdam, Netherlands',
      destination: 'New York, USA',
      merchandiseValue: 75000,
      expectedArrival: '2024-11-25',
      estimatedArrival: '2024-11-25',
      status: 'on-time',
      daysUntilArrival: 7,
      insurancePremium: 1500,
      currentLocation: 'Atlantic Ocean',
    },
    {
      id: 3,
      containerNumber: 'TCLU456789',
      origin: 'Tokyo, Japan',
      destination: 'Seattle, USA',
      merchandiseValue: 100000,
      expectedArrival: '2024-11-20',
      estimatedArrival: '2024-11-28',
      status: 'delayed',
      daysDelayed: 8,
      insurancePremium: 2000,
      currentLocation: 'Pacific Ocean',
    },
    {
      id: 4,
      containerNumber: 'MSCU789012',
      origin: 'Hamburg, Germany',
      destination: 'Miami, USA',
      merchandiseValue: 60000,
      expectedArrival: '2024-11-15',
      estimatedArrival: '2024-11-15',
      status: 'delivered',
      deliveryDate: '2024-11-15',
      insurancePremium: 1200,
      currentLocation: 'Miami Port',
    },
  ];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'on-time':
        return <CheckCircleIcon className="w-6 h-6 text-green-500" />;
      case 'delayed':
        return <ClockIcon className="w-6 h-6 text-orange-500" />;
      case 'delivered':
        return <CheckCircleIcon className="w-6 h-6 text-blue-500" />;
      default:
        return <TruckIcon className="w-6 h-6 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'on-time':
        return (
          <span className="px-3 py-1 bg-green-100 text-green-700 text-xs font-semibold rounded-full">
            On Time
          </span>
        );
      case 'delayed':
        return (
          <span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full">
            Delayed
          </span>
        );
      case 'delivered':
        return (
          <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
            Delivered
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 bg-gray-100 text-gray-700 text-xs font-semibold rounded-full">
            Unknown
          </span>
        );
    }
  };

  const stats = {
    total: shipments.length,
    onTime: shipments.filter((s) => s.status === 'on-time').length,
    delayed: shipments.filter((s) => s.status === 'delayed').length,
    delivered: shipments.filter((s) => s.status === 'delivered').length,
  };

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Delivery Status</h1>
        <p className="text-gray-600">Monitor all your insured shipments</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="text-2xl font-bold text-gray-900 mb-1">{stats.total}</div>
          <div className="text-sm text-gray-600">Total Shipments</div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="text-2xl font-bold text-green-600 mb-1">{stats.onTime}</div>
          <div className="text-sm text-gray-600">On Time</div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="text-2xl font-bold text-orange-600 mb-1">{stats.delayed}</div>
          <div className="text-sm text-gray-600">Delayed</div>
        </div>
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
          <div className="text-2xl font-bold text-blue-600 mb-1">{stats.delivered}</div>
          <div className="text-sm text-gray-600">Delivered</div>
        </div>
      </div>

      {/* Shipments List */}
      <div className="space-y-4">
        {shipments.map((shipment) => (
          <div
            key={shipment.id}
            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow"
          >
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-4">
                  <div className="mt-1">{getStatusIcon(shipment.status)}</div>
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-mono font-semibold text-gray-900">
                        {shipment.containerNumber}
                      </h3>
                      {getStatusBadge(shipment.status)}
                    </div>
                    <p className="text-sm text-gray-600">
                      {shipment.origin} → {shipment.destination}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 pt-4 border-t border-gray-100">
                <div>
                  <p className="text-xs text-gray-600 mb-1">Merchandise Value</p>
                  <p className="font-semibold text-gray-900">
                    ${shipment.merchandiseValue.toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Expected Arrival</p>
                  <p className="font-semibold text-gray-900">{shipment.expectedArrival}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">
                    {shipment.status === 'delivered' ? 'Delivered' : 'Estimated Arrival'}
                  </p>
                  <p
                    className={`font-semibold ${
                      shipment.status === 'delayed'
                        ? 'text-orange-600'
                        : shipment.status === 'delivered'
                        ? 'text-blue-600'
                        : 'text-green-600'
                    }`}
                  >
                    {shipment.status === 'delivered'
                      ? shipment.deliveryDate
                      : shipment.estimatedArrival}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">Current Location</p>
                  <p className="font-semibold text-gray-900">{shipment.currentLocation}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-600 mb-1">
                    {shipment.status === 'on-time'
                      ? 'Days Until Arrival'
                      : shipment.status === 'delayed'
                      ? 'Days Delayed'
                      : 'Status'}
                  </p>
                  <p
                    className={`font-semibold ${
                      shipment.status === 'delayed'
                        ? 'text-orange-600'
                        : shipment.status === 'delivered'
                        ? 'text-blue-600'
                        : 'text-green-600'
                    }`}
                  >
                    {shipment.status === 'on-time'
                      ? `${shipment.daysUntilArrival} days`
                      : shipment.status === 'delayed'
                      ? `${shipment.daysDelayed} days`
                      : 'Complete'}
                  </p>
                </div>
              </div>

              {shipment.status === 'delayed' && (
                <div className="mt-4 p-4 bg-orange-50 border border-orange-100 rounded-lg">
                  <div className="flex items-start gap-3">
                    <ClockIcon className="w-5 h-5 text-orange-600 mt-0.5" />
                    <div className="flex-1">
                      <p className="text-sm font-semibold text-orange-900 mb-1">
                        Delay Detected - Claim Available
                      </p>
                      <p className="text-sm text-orange-700 mb-3">
                        This shipment is {shipment.daysDelayed} days delayed. You can file a claim to
                        receive ${(shipment.merchandiseValue * 0.01 * shipment.daysDelayed!).toLocaleString()} in
                        compensation.
                      </p>
                      <button className="px-4 py-2 bg-orange-600 text-white text-sm font-semibold rounded-lg hover:bg-orange-700 transition-colors">
                        File Claim
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {shipment.status === 'on-time' && (
                <div className="mt-4 p-4 bg-green-50 border border-green-100 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircleIcon className="w-5 h-5 text-green-600" />
                    <p className="text-sm text-green-700">
                      This shipment is on schedule for on-time delivery
                    </p>
                  </div>
                </div>
              )}

              {shipment.status === 'delivered' && (
                <div className="mt-4 p-4 bg-blue-50 border border-blue-100 rounded-lg">
                  <div className="flex items-center gap-3">
                    <CheckCircleIcon className="w-5 h-5 text-blue-600" />
                    <p className="text-sm text-blue-700">
                      Successfully delivered on time - No claim needed
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
