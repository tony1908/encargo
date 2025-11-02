'use client';

import { usePrivy } from '@privy-io/react-auth';

export default function DashboardPage() {
  const { user } = usePrivy();

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      {/* User Info Section */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Welcome back!</h1>
            <p className="text-gray-600 mt-1">
              {user?.email?.address || user?.phone?.number || user?.wallet?.address || 'User'}
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Dashboard</h2>
        <p className="text-gray-600">Your insurance dashboard content goes here.</p>
      </div>
    </div>
  );
}
