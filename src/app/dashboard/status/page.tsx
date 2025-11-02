'use client';

import { CheckCircleIcon, ClockIcon, TruckIcon } from '@heroicons/react/24/outline';

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
        return <CheckCircleIcon className="w-5 h-5 text-gray-600" />;
      case 'delayed':
        return <ClockIcon className="w-5 h-5 text-gray-900" />;
      case 'delivered':
        return <CheckCircleIcon className="w-5 h-5 text-gray-400" />;
      default:
        return <TruckIcon className="w-5 h-5 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'on-time':
        return (
          <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-medium rounded">
            On Time
          </span>
        );
      case 'delayed':
        return (
          <span className="px-2 py-0.5 bg-gray-900 text-white text-xs font-medium rounded">
            Delayed
          </span>
        );
      case 'delivered':
        return (
          <span className="px-2 py-0.5 bg-gray-50 text-gray-600 text-xs font-medium rounded">
            Delivered
          </span>
        );
      default:
        return (
          <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-medium rounded">
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
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-medium text-gray-900">Delivery Status</h1>
        <p className="text-sm text-gray-500 mt-1">Monitor your shipments</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-lg border border-gray-100">
          <div className="text-xl font-medium text-gray-900">{stats.total}</div>
          <div className="text-xs text-gray-500 mt-1">Total</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-100">
          <div className="text-xl font-medium text-gray-900">{stats.onTime}</div>
          <div className="text-xs text-gray-500 mt-1">On Time</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-100">
          <div className="text-xl font-medium text-gray-900">{stats.delayed}</div>
          <div className="text-xs text-gray-500 mt-1">Delayed</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-100">
          <div className="text-xl font-medium text-gray-900">{stats.delivered}</div>
          <div className="text-xs text-gray-500 mt-1">Delivered</div>
        </div>
      </div>

      {/* Shipments List */}
      <div className="space-y-3">
        {shipments.map((shipment) => (
          <div
            key={shipment.id}
            className="bg-white rounded-lg border border-gray-100 p-6 hover:border-gray-200 transition-colors"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-3">
                <div className="mt-0.5">{getStatusIcon(shipment.status)}</div>
                <div>
                  <div className="flex items-center gap-3 mb-1">
                    <h3 className="font-mono text-sm font-medium text-gray-900">
                      {shipment.containerNumber}
                    </h3>
                    {getStatusBadge(shipment.status)}
                  </div>
                  <p className="text-xs text-gray-500">
                    {shipment.origin} → {shipment.destination}
                  </p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-5 gap-4 pt-3 border-t border-gray-50">
              <div>
                <p className="text-xs text-gray-500">Value</p>
                <p className="text-sm font-medium text-gray-900 mt-0.5">
                  ${shipment.merchandiseValue.toLocaleString()}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Expected</p>
                <p className="text-sm font-medium text-gray-900 mt-0.5">{shipment.expectedArrival}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">
                  {shipment.status === 'delivered' ? 'Delivered' : 'Estimated'}
                </p>
                <p className={`text-sm font-medium mt-0.5 ${
                  shipment.status === 'delayed' ? 'text-gray-900' : 'text-gray-900'
                }`}>
                  {shipment.status === 'delivered'
                    ? shipment.deliveryDate
                    : shipment.estimatedArrival}
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Location</p>
                <p className="text-sm font-medium text-gray-900 mt-0.5">{shipment.currentLocation}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">
                  {shipment.status === 'on-time'
                    ? 'Days Left'
                    : shipment.status === 'delayed'
                    ? 'Days Delayed'
                    : 'Status'}
                </p>
                <p className={`text-sm font-medium mt-0.5 ${
                  shipment.status === 'delayed' ? 'text-gray-900' : 'text-gray-900'
                }`}>
                  {shipment.status === 'on-time'
                    ? `${shipment.daysUntilArrival}d`
                    : shipment.status === 'delayed'
                    ? `${shipment.daysDelayed}d`
                    : 'Complete'}
                </p>
              </div>
            </div>

            {shipment.status === 'delayed' && (
              <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      Claim Available
                    </p>
                    <p className="text-xs text-gray-600 mt-0.5">
                      ${(shipment.merchandiseValue * 0.01 * shipment.daysDelayed!).toLocaleString()} compensation
                    </p>
                  </div>
                  <button className="px-3 py-1.5 bg-gray-900 text-white text-xs font-medium rounded hover:bg-gray-800 transition-colors">
                    File Claim
                  </button>
                </div>
              </div>
            )}

            {shipment.status === 'on-time' && (
              <div className="mt-4 text-xs text-gray-500">
                On schedule for delivery
              </div>
            )}

            {shipment.status === 'delivered' && (
              <div className="mt-4 text-xs text-gray-500">
                Successfully delivered on time
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}