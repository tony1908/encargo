'use client';

import { useState, useEffect } from 'react';
import { CheckCircleIcon, ClockIcon, TruckIcon } from '@heroicons/react/24/outline';
import { useAccount, usePublicClient } from 'wagmi';
import { INSURANCE_CONTRACT_ADDRESS, INSURANCE_CONTRACT_ABI } from '@/contracts/InsuranceContract';
import { arbitrumSepolia } from 'viem/chains';
import { useRouter } from 'next/navigation';

interface PolicyData {
  policyId: number;
  containerNumber: string;
  expectedArrival: Date;
  actualArrival?: Date;
  active: boolean;
  delayed: boolean;
  delivered: boolean;
  claimedDays: number;
  claimableDays: number;
  status: 'on-time' | 'delayed' | 'delivered';
  daysDelayed?: number;
  daysUntilArrival?: number;
}

export default function DeliveryStatusPage() {
  const { address } = useAccount();
  const publicClient = usePublicClient({ chainId: arbitrumSepolia.id });
  const router = useRouter();
  const [policies, setPolicies] = useState<PolicyData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPolicies = async () => {
      if (!publicClient || !address) {
        setLoading(false);
        return;
      }

      try {
        // Get user's policy IDs
        const policyIds = await publicClient.readContract({
          address: INSURANCE_CONTRACT_ADDRESS,
          abi: INSURANCE_CONTRACT_ABI,
          functionName: 'getPoliciesByUser',
          args: [address as `0x${string}`],
        }) as bigint[];

        const policyDataList: PolicyData[] = [];
        const currentTime = Math.floor(Date.now() / 1000);

        // Fetch details for each policy
        for (const policyId of policyIds) {
          const [policy, claimableDays] = await Promise.all([
            publicClient.readContract({
              address: INSURANCE_CONTRACT_ADDRESS,
              abi: INSURANCE_CONTRACT_ABI,
              functionName: 'getPolicy',
              args: [policyId],
            }) as Promise<any>,
            publicClient.readContract({
              address: INSURANCE_CONTRACT_ADDRESS,
              abi: INSURANCE_CONTRACT_ABI,
              functionName: 'claimableDays',
              args: [policyId],
            }) as Promise<bigint>,
          ]);

          const expectedArrival = new Date(Number(policy[2]) * 1000);
          const actualArrival = policy[6] > 0 ? new Date(Number(policy[6]) * 1000) : undefined;

          // Determine status
          let status: 'on-time' | 'delayed' | 'delivered' = 'on-time';
          let daysDelayed: number | undefined;
          let daysUntilArrival: number | undefined;

          if (policy[5]) {
            // Delivered
            status = 'delivered';
          } else if (policy[4]) {
            // Delayed
            status = 'delayed';
            const delayTime = currentTime - Number(policy[2]);
            daysDelayed = Math.max(0, Math.floor(delayTime / 86400));
          } else {
            // On-time (not yet arrived)
            const timeUntilArrival = Number(policy[2]) - currentTime;
            if (timeUntilArrival < 0) {
              // Past expected arrival but not marked as delayed or delivered
              status = 'delayed';
              daysDelayed = Math.abs(Math.floor(timeUntilArrival / 86400));
            } else {
              daysUntilArrival = Math.ceil(timeUntilArrival / 86400);
            }
          }

          policyDataList.push({
            policyId: Number(policyId),
            containerNumber: policy[1],
            expectedArrival,
            actualArrival,
            active: policy[3],
            delayed: policy[4],
            delivered: policy[5],
            claimedDays: Number(policy[7]),
            claimableDays: Number(claimableDays),
            status,
            daysDelayed,
            daysUntilArrival,
          });
        }

        // Sort policies: active first, then by policy ID descending
        policyDataList.sort((a, b) => {
          if (a.active !== b.active) return a.active ? -1 : 1;
          return b.policyId - a.policyId;
        });

        setPolicies(policyDataList);
      } catch (error) {
        console.error('Error fetching policies:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPolicies();
  }, [publicClient, address]);

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
    total: policies.length,
    onTime: policies.filter((p) => p.status === 'on-time').length,
    delayed: policies.filter((p) => p.status === 'delayed').length,
    delivered: policies.filter((p) => p.status === 'delivered').length,
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-medium text-gray-900">Delivery Status</h1>
          <p className="text-sm text-gray-500 mt-1">Monitor your shipments</p>
        </div>
        <div className="flex items-center justify-center h-64">
          <p className="text-gray-500">Loading policies...</p>
        </div>
      </div>
    );
  }

  if (!address) {
    return (
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-medium text-gray-900">Delivery Status</h1>
          <p className="text-sm text-gray-500 mt-1">Monitor your shipments</p>
        </div>
        <div className="bg-white rounded-lg border border-gray-100 p-8 text-center">
          <p className="text-gray-500">Please connect your wallet to view your policies</p>
        </div>
      </div>
    );
  }

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

      {/* Policies List */}
      {policies.length > 0 ? (
        <div className="space-y-3">
          {policies.map((policy) => (
            <div
              key={policy.policyId}
              className="bg-white rounded-lg border border-gray-100 p-6 hover:border-gray-200 transition-colors"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-start gap-3">
                  <div className="mt-0.5">{getStatusIcon(policy.status)}</div>
                  <div>
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-mono text-sm font-medium text-gray-900">
                        {policy.containerNumber}
                      </h3>
                      {getStatusBadge(policy.status)}
                      {!policy.active && (
                        <span className="px-2 py-0.5 bg-gray-50 text-gray-500 text-xs font-medium rounded">
                          Inactive
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-500">
                      Policy #{policy.policyId}
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-4 gap-4 pt-3 border-t border-gray-50">
                <div>
                  <p className="text-xs text-gray-500">Expected</p>
                  <p className="text-sm font-medium text-gray-900 mt-0.5">
                    {policy.expectedArrival.toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">
                    {policy.status === 'delivered' ? 'Delivered' : 'Status'}
                  </p>
                  <p className={`text-sm font-medium mt-0.5 ${
                    policy.status === 'delayed' ? 'text-gray-900' : 'text-gray-900'
                  }`}>
                    {policy.actualArrival
                      ? policy.actualArrival.toLocaleDateString()
                      : policy.status === 'on-time'
                      ? 'In Transit'
                      : 'Delayed'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">
                    {policy.status === 'on-time'
                      ? 'Days Left'
                      : policy.status === 'delayed'
                      ? 'Days Delayed'
                      : 'Claimed Days'}
                  </p>
                  <p className={`text-sm font-medium mt-0.5 ${
                    policy.status === 'delayed' ? 'text-gray-900' : 'text-gray-900'
                  }`}>
                    {policy.status === 'on-time' && policy.daysUntilArrival
                      ? `${policy.daysUntilArrival}d`
                      : policy.status === 'delayed'
                      ? `${policy.daysDelayed || 0}d`
                      : `${policy.claimedDays}d`}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Claimable</p>
                  <p className="text-sm font-medium text-gray-900 mt-0.5">
                    {policy.claimableDays}d
                  </p>
                </div>
              </div>

              {policy.claimableDays > 0 && (
                <div className="mt-4 p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        Claim Available
                      </p>
                      <p className="text-xs text-gray-600 mt-0.5">
                        {policy.claimableDays} days compensation available
                      </p>
                    </div>
                    <button
                      onClick={() => router.push('/dashboard/claim')}
                      className="px-3 py-1.5 bg-gray-900 text-white text-xs font-medium rounded hover:bg-gray-800 transition-colors"
                    >
                      File Claim
                    </button>
                  </div>
                </div>
              )}

              {policy.status === 'on-time' && policy.active && (
                <div className="mt-4 text-xs text-gray-500">
                  On schedule for delivery
                </div>
              )}

              {policy.status === 'delivered' && policy.claimedDays === 0 && (
                <div className="mt-4 text-xs text-gray-500">
                  Successfully delivered on time
                </div>
              )}

              {policy.status === 'delivered' && policy.claimedDays > 0 && (
                <div className="mt-4 text-xs text-gray-500">
                  Delivered with {policy.claimedDays} days claimed
                </div>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg border border-gray-100 p-8 text-center">
          <TruckIcon className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-500 mb-4">No policies found</p>
          <button
            onClick={() => router.push('/dashboard/buy')}
            className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded hover:bg-gray-800 transition-colors"
          >
            Buy Your First Policy
          </button>
        </div>
      )}
    </div>
  );
}