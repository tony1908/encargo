'use client';

import { usePrivy } from '@privy-io/react-auth';
import { ShoppingCartIcon, MapIcon, ClockIcon, BanknotesIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

export default function DashboardPage() {
  const { user } = usePrivy();
  const router = useRouter();

  const quickActions = [
    {
      name: 'Buy Insurance',
      description: 'Protect cargo',
      icon: ShoppingCartIcon,
      path: '/dashboard/buy'
    },
    {
      name: 'Track',
      description: 'Real-time location',
      icon: MapIcon,
      path: '/dashboard/track'
    },
    {
      name: 'Status',
      description: 'Delivery updates',
      icon: ClockIcon,
      path: '/dashboard/status'
    },
    {
      name: 'Claims',
      description: 'File claims',
      icon: BanknotesIcon,
      path: '/dashboard/claim'
    },
  ];

  const stats = [
    { label: 'Policies', value: '3', trend: '+2' },
    { label: 'Coverage', value: '$250K', trend: null },
    { label: 'Pending', value: '1', trend: '-1' },
    { label: 'Tracked', value: '5', trend: '+3' },
  ];

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-medium text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-1">
          {user?.email?.address || user?.phone?.number || user?.wallet?.address || 'Welcome'}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white p-4 rounded-lg border border-gray-100">
            <div className="flex items-baseline gap-2">
              <div className="text-xl font-medium text-gray-900">{stat.value}</div>
              {stat.trend && (
                <span className={`text-xs ${stat.trend.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                  {stat.trend}
                </span>
              )}
            </div>
            <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        {quickActions.map((action) => {
          const Icon = action.icon;
          return (
            <button
              key={action.name}
              onClick={() => router.push(action.path)}
              className="bg-white p-6 rounded-lg border border-gray-100 hover:border-gray-300 transition-colors text-left group"
            >
              <Icon className="w-5 h-5 text-gray-400 group-hover:text-gray-900 transition-colors mb-3" />
              <h3 className="text-sm font-medium text-gray-900">{action.name}</h3>
              <p className="text-xs text-gray-500 mt-0.5">{action.description}</p>
            </button>
          );
        })}
      </div>

      {/* Activity Feed */}
      <div className="bg-white rounded-lg border border-gray-100 p-6">
        <h2 className="text-sm font-medium text-gray-900 mb-4">Activity</h2>
        <div className="space-y-4">
          <div className="flex gap-3">
            <div className="w-1 bg-gray-900 rounded-full flex-shrink-0"></div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900">Policy activated</p>
              <p className="text-xs text-gray-500 mt-0.5">MSCU123456 • $50,000 • 2h ago</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-1 bg-gray-400 rounded-full flex-shrink-0"></div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900">Location update</p>
              <p className="text-xs text-gray-500 mt-0.5">HLCU987654 • Singapore • 5h ago</p>
            </div>
          </div>
          <div className="flex gap-3">
            <div className="w-1 bg-gray-400 rounded-full flex-shrink-0"></div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-gray-900">Claim approved</p>
              <p className="text-xs text-gray-500 mt-0.5">TCLU456789 • $2,500 • 1d ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}