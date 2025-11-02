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
      description: 'Protect your cargo against delays',
      icon: ShoppingCartIcon,
      color: 'from-blue-500 to-blue-600',
      path: '/dashboard/buy'
    },
    {
      name: 'Track Container',
      description: 'View real-time location',
      icon: MapIcon,
      color: 'from-green-500 to-green-600',
      path: '/dashboard/track'
    },
    {
      name: 'Check Status',
      description: 'View delivery status',
      icon: ClockIcon,
      color: 'from-purple-500 to-purple-600',
      path: '/dashboard/status'
    },
    {
      name: 'File Claim',
      description: 'Claim for late delivery',
      icon: BanknotesIcon,
      color: 'from-orange-500 to-orange-600',
      path: '/dashboard/claim'
    },
  ];

  const stats = [
    { label: 'Active Policies', value: '3' },
    { label: 'Total Coverage', value: '$250K' },
    { label: 'Claims Pending', value: '1' },
    { label: 'Containers Tracked', value: '5' },
  ];

  return (
    <div className="p-6 lg:p-8 space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl p-8 text-white shadow-lg">
        <h1 className="text-3xl font-bold mb-2">Welcome back!</h1>
        <p className="text-indigo-100">
          {user?.email?.address || user?.phone?.number || user?.wallet?.address || 'User'}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
            <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
            <div className="text-sm text-gray-600">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <button
                key={action.name}
                onClick={() => router.push(action.path)}
                className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md transition-all hover:scale-105 text-left"
              >
                <div className={`w-12 h-12 bg-gradient-to-br ${action.color} rounded-lg flex items-center justify-center mb-4`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{action.name}</h3>
                <p className="text-sm text-gray-600">{action.description}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h2>
        <div className="space-y-4">
          <div className="flex items-start gap-4 pb-4 border-b border-gray-100">
            <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Insurance Policy Activated</p>
              <p className="text-xs text-gray-600 mt-1">Container #MSCU123456 - $50,000 coverage</p>
              <p className="text-xs text-gray-500 mt-1">2 hours ago</p>
            </div>
          </div>
          <div className="flex items-start gap-4 pb-4 border-b border-gray-100">
            <div className="w-2 h-2 bg-blue-500 rounded-full mt-2"></div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Container Location Updated</p>
              <p className="text-xs text-gray-600 mt-1">Container #HLCU987654 arrived at Port of Singapore</p>
              <p className="text-xs text-gray-500 mt-1">5 hours ago</p>
            </div>
          </div>
          <div className="flex items-start gap-4">
            <div className="w-2 h-2 bg-orange-500 rounded-full mt-2"></div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-900">Claim Approved</p>
              <p className="text-xs text-gray-600 mt-1">$2,500 compensation for Container #TCLU456789</p>
              <p className="text-xs text-gray-500 mt-1">1 day ago</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
