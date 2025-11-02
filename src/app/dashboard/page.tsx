'use client';

import { useState, useEffect } from 'react';
import { usePrivy } from '@privy-io/react-auth';
import { useAccount, usePublicClient } from 'wagmi';
import { ShoppingCartIcon, MapIcon, ClockIcon, BanknotesIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';
import { INSURANCE_CONTRACT_ADDRESS, INSURANCE_CONTRACT_ABI } from '@/contracts/InsuranceContract';
import { arbitrumSepolia } from 'viem/chains';
import { formatEther } from 'viem';

export default function DashboardPage() {
  const { user } = usePrivy();
  const router = useRouter();
  const { address } = useAccount();
  const publicClient = usePublicClient({ chainId: arbitrumSepolia.id });

  const [stats, setStats] = useState({
    totalPolicies: 0,
    activePolicies: 0,
    claimablePolicies: 0,
    totalCoverage: '0',
  });

  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  // Fetch user data from contract
  useEffect(() => {
    const fetchUserData = async () => {
      if (!publicClient || !address) return;

      try {
        // Get user's policy count
        const policyCount = await publicClient.readContract({
          address: INSURANCE_CONTRACT_ADDRESS,
          abi: INSURANCE_CONTRACT_ABI,
          functionName: 'getUserPolicyCount',
          args: [address as `0x${string}`],
        }) as bigint;

        // Get user's policy IDs
        const policyIds = await publicClient.readContract({
          address: INSURANCE_CONTRACT_ADDRESS,
          abi: INSURANCE_CONTRACT_ABI,
          functionName: 'getPoliciesByUser',
          args: [address as `0x${string}`],
        }) as bigint[];

        let activePolicies = 0;
        let claimablePolicies = 0;
        let totalCoverage = 0n;
        const activities: any[] = [];

        // Get contract pricing for coverage calculation
        const [premiumAmount, payoutPerDay, maxDays] = await Promise.all([
          publicClient.readContract({
            address: INSURANCE_CONTRACT_ADDRESS,
            abi: INSURANCE_CONTRACT_ABI,
            functionName: 'premiumAmount',
          }) as Promise<bigint>,
          publicClient.readContract({
            address: INSURANCE_CONTRACT_ADDRESS,
            abi: INSURANCE_CONTRACT_ABI,
            functionName: 'payoutPerDay',
          }) as Promise<bigint>,
          publicClient.readContract({
            address: INSURANCE_CONTRACT_ADDRESS,
            abi: INSURANCE_CONTRACT_ABI,
            functionName: 'maxPayoutDays',
          }) as Promise<bigint>,
        ]);

        // Fetch details for each policy
        for (const policyId of policyIds.slice(-3)) { // Get last 3 policies for recent activity
          const policy = await publicClient.readContract({
            address: INSURANCE_CONTRACT_ADDRESS,
            abi: INSURANCE_CONTRACT_ABI,
            functionName: 'getPolicy',
            args: [policyId],
          }) as any;

          const claimableDays = await publicClient.readContract({
            address: INSURANCE_CONTRACT_ADDRESS,
            abi: INSURANCE_CONTRACT_ABI,
            functionName: 'claimableDays',
            args: [policyId],
          }) as bigint;

          if (policy[3]) { // active
            activePolicies++;
          }

          if (claimableDays > 0n) {
            claimablePolicies++;
          }

          // Calculate total potential coverage
          totalCoverage += payoutPerDay * maxDays;

          // Add to recent activity
          activities.push({
            policyId: Number(policyId),
            containerId: policy[1],
            active: policy[3],
            delivered: policy[5],
            claimableDays: Number(claimableDays),
            expectedArrival: new Date(Number(policy[2]) * 1000),
          });
        }

        setStats({
          totalPolicies: Number(policyCount),
          activePolicies,
          claimablePolicies,
          totalCoverage: formatEther(totalCoverage),
        });

        setRecentActivity(activities);
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserData();
  }, [publicClient, address]);

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
        <div className="bg-white p-4 rounded-lg border border-gray-100">
          <div className="flex items-baseline gap-2">
            <div className="text-xl font-medium text-gray-900">{stats.totalPolicies}</div>
          </div>
          <div className="text-xs text-gray-500 mt-1">Total Policies</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-100">
          <div className="flex items-baseline gap-2">
            <div className="text-xl font-medium text-gray-900">{stats.activePolicies}</div>
          </div>
          <div className="text-xs text-gray-500 mt-1">Active</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-100">
          <div className="flex items-baseline gap-2">
            <div className="text-xl font-medium text-gray-900">{stats.claimablePolicies}</div>
          </div>
          <div className="text-xs text-gray-500 mt-1">Claimable</div>
        </div>
        <div className="bg-white p-4 rounded-lg border border-gray-100">
          <div className="flex items-baseline gap-2">
            <div className="text-xl font-medium text-gray-900">
              {parseFloat(stats.totalCoverage).toFixed(2)} MXN
            </div>
          </div>
          <div className="text-xs text-gray-500 mt-1">Max Coverage</div>
        </div>
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
        <h2 className="text-sm font-medium text-gray-900 mb-4">Recent Policies</h2>
        <div className="space-y-4">
          {recentActivity.length > 0 ? (
            recentActivity.map((activity) => (
              <div key={activity.policyId} className="flex gap-3">
                <div className={`w-1 ${activity.active ? 'bg-gray-900' : 'bg-gray-400'} rounded-full flex-shrink-0`}></div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900">
                    Policy #{activity.policyId} {activity.active ? 'Active' : activity.delivered ? 'Delivered' : 'Pending'}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {activity.containerId} •
                    {activity.claimableDays > 0 ? ` ${activity.claimableDays} days claimable • ` : ' '}
                    Expected: {activity.expectedArrival.toLocaleDateString()}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <div className="text-sm text-gray-500">No policies found. Buy your first policy to get started!</div>
          )}
        </div>
      </div>
    </div>
  );
}