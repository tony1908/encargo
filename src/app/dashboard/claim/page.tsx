'use client';

import { useState } from 'react';
import { BanknotesIcon, DocumentTextIcon, ClockIcon, CheckCircleIcon } from '@heroicons/react/24/outline';

export default function ClaimInsurancePage() {
  const [selectedContainer, setSelectedContainer] = useState<string>('');
  const [claimSubmitted, setClaimSubmitted] = useState(false);

  // Mock data for containers eligible for claims
  const eligibleContainers = [
    {
      containerNumber: 'TCLU456789',
      origin: 'Tokyo, Japan',
      destination: 'Seattle, USA',
      merchandiseValue: 100000,
      expectedArrival: '2024-11-20',
      currentDate: '2024-11-28',
      daysDelayed: 8,
      dailyCompensation: 1000,
      totalCompensation: 8000,
      status: 'delayed',
      insurancePremium: 2000,
    },
    {
      containerNumber: 'MSCU345678',
      origin: 'Singapore',
      destination: 'Long Beach, USA',
      merchandiseValue: 85000,
      expectedArrival: '2024-11-22',
      currentDate: '2024-11-28',
      daysDelayed: 6,
      dailyCompensation: 850,
      totalCompensation: 5100,
      status: 'delayed',
      insurancePremium: 1700,
    },
  ];

  const handleSubmitClaim = (e: React.FormEvent) => {
    e.preventDefault();
    setClaimSubmitted(true);
  };

  const selectedContainerData = eligibleContainers.find(
    (c) => c.containerNumber === selectedContainer
  );

  // Mock claim history
  const claimHistory = [
    {
      id: 1,
      containerNumber: 'HLCU111222',
      claimDate: '2024-11-10',
      daysDelayed: 5,
      amount: 3500,
      status: 'approved',
      paymentDate: '2024-11-12',
    },
    {
      id: 2,
      containerNumber: 'MSCU333444',
      claimDate: '2024-11-05',
      daysDelayed: 3,
      amount: 2100,
      status: 'approved',
      paymentDate: '2024-11-07',
    },
    {
      id: 3,
      containerNumber: 'TCLU555666',
      claimDate: '2024-11-01',
      daysDelayed: 10,
      amount: 8000,
      status: 'processing',
      paymentDate: null,
    },
  ];

  if (claimSubmitted) {
    return (
      <div className="p-8 max-w-3xl mx-auto">
        <div className="bg-white rounded-lg border border-gray-100 p-12 text-center">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircleIcon className="w-6 h-6 text-gray-900" />
          </div>
          <h2 className="text-xl font-medium text-gray-900 mb-2">Claim Submitted</h2>
          <p className="text-sm text-gray-600 mb-8 max-w-md mx-auto">
            Your claim is being processed. Payment expected within 24-48 hours.
          </p>

          {selectedContainerData && (
            <div className="bg-gray-900 text-white rounded-lg p-6 mb-8">
              <p className="text-xs text-gray-400 mb-2">Total Compensation</p>
              <p className="text-3xl font-medium">${selectedContainerData.totalCompensation.toLocaleString()}</p>
              <p className="text-xs text-gray-400 mt-2">
                {selectedContainerData.daysDelayed} days × ${selectedContainerData.dailyCompensation.toLocaleString()}/day
              </p>
            </div>
          )}

          <div className="space-y-3 mb-8 text-left bg-gray-50 rounded-lg p-6">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Claim ID</span>
              <span className="font-mono text-gray-900">#CLM{Date.now()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Container</span>
              <span className="font-mono text-gray-900">{selectedContainer}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Status</span>
              <span className="px-2 py-0.5 bg-gray-200 text-gray-700 text-xs font-medium rounded">
                Processing
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Payment</span>
              <span className="text-gray-900">24-48 hours</span>
            </div>
          </div>

          <button
            onClick={() => {
              setClaimSubmitted(false);
              setSelectedContainer('');
            }}
            className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
          >
            Submit Another Claim
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-medium text-gray-900">Claim Insurance</h1>
        <p className="text-sm text-gray-500 mt-1">File claims for delayed containers</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Claim Form */}
        <div className="lg:col-span-2 space-y-4">
          {/* Eligible Containers */}
          <div className="bg-white rounded-lg border border-gray-100 p-6">
            <h2 className="text-sm font-medium text-gray-900 mb-4">Eligible Containers</h2>

            {eligibleContainers.length === 0 ? (
              <div className="text-center py-8">
                <ClockIcon className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">No containers eligible for claims</p>
              </div>
            ) : (
              <div className="space-y-3">
                {eligibleContainers.map((container) => (
                  <button
                    key={container.containerNumber}
                    onClick={() => setSelectedContainer(container.containerNumber)}
                    className={`w-full text-left p-4 border rounded-lg transition-colors ${
                      selectedContainer === container.containerNumber
                        ? 'border-gray-900 bg-gray-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-mono text-sm font-medium text-gray-900">
                          {container.containerNumber}
                        </h3>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {container.origin} → {container.destination}
                        </p>
                      </div>
                      <div className="px-2 py-0.5 bg-gray-900 text-white text-xs font-medium rounded">
                        {container.daysDelayed}d delayed
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 pt-3 border-t border-gray-100">
                      <div>
                        <p className="text-xs text-gray-500">Expected</p>
                        <p className="text-xs font-medium text-gray-900 mt-0.5">
                          {container.expectedArrival}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Daily</p>
                        <p className="text-xs font-medium text-gray-900 mt-0.5">
                          ${container.dailyCompensation.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Total</p>
                        <p className="text-xs font-medium text-gray-900 mt-0.5">
                          ${container.totalCompensation.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Claim Details */}
          {selectedContainerData && (
            <div className="bg-white rounded-lg border border-gray-100 p-6">
              <h2 className="text-sm font-medium text-gray-900 mb-4">Claim Details</h2>

              <form onSubmit={handleSubmitClaim} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">Container</p>
                    <p className="font-mono text-sm text-gray-900 mt-0.5">
                      {selectedContainerData.containerNumber}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">Value</p>
                    <p className="text-sm text-gray-900 mt-0.5">
                      ${selectedContainerData.merchandiseValue.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">Expected</p>
                    <p className="text-sm text-gray-900 mt-0.5">
                      {selectedContainerData.expectedArrival}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">Delayed</p>
                    <p className="text-sm text-gray-900 mt-0.5">
                      {selectedContainerData.daysDelayed} days
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Compensation</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">Daily rate (1%)</span>
                      <span className="text-gray-900">
                        ${selectedContainerData.dailyCompensation.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">Days delayed</span>
                      <span className="text-gray-900">
                        {selectedContainerData.daysDelayed}
                      </span>
                    </div>
                    <div className="pt-2 border-t border-gray-200 flex justify-between">
                      <span className="text-sm font-medium text-gray-900">Total</span>
                      <span className="text-lg font-medium text-gray-900">
                        ${selectedContainerData.totalCompensation.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <p className="text-xs text-gray-600">
                    Container tracking and delivery confirmation will be automatically verified.
                  </p>
                </div>

                <button
                  type="submit"
                  className="w-full bg-gray-900 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
                >
                  Submit Claim - ${selectedContainerData.totalCompensation.toLocaleString()}
                </button>
              </form>
            </div>
          )}

          {!selectedContainerData && eligibleContainers.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-100 p-12 text-center">
              <BanknotesIcon className="w-8 h-8 text-gray-300 mx-auto mb-3" />
              <h3 className="text-sm font-medium text-gray-900 mb-1">Select a Container</h3>
              <p className="text-xs text-gray-500">
                Choose a container to file a claim
              </p>
            </div>
          )}
        </div>

        {/* Sidebar Info */}
        <div className="space-y-4">
          {/* How it Works */}
          <div className="bg-white rounded-lg border border-gray-100 p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">How Claims Work</h3>
            <ul className="space-y-2 text-xs text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-gray-900">•</span>
                <span>Automatic calculation based on delay</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gray-900">•</span>
                <span>1% of value per day delayed</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gray-900">•</span>
                <span>24-48 hour processing</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gray-900">•</span>
                <span>Direct wallet payment</span>
              </li>
            </ul>
          </div>

          {/* Recent Claims */}
          <div className="bg-white rounded-lg border border-gray-100 p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Recent Claims</h3>
            <div className="space-y-3">
              {claimHistory.map((claim) => (
                <div key={claim.id} className="pb-3 border-b border-gray-50 last:border-0 last:pb-0">
                  <div className="flex items-start justify-between mb-1">
                    <p className="font-mono text-xs text-gray-900">
                      {claim.containerNumber}
                    </p>
                    <span className={`px-1.5 py-0.5 text-xs font-medium rounded ${
                      claim.status === 'approved'
                        ? 'bg-gray-100 text-gray-700'
                        : 'bg-gray-50 text-gray-600'
                    }`}>
                      {claim.status === 'approved' ? 'Paid' : 'Processing'}
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">
                    <p>${claim.amount.toLocaleString()} • {claim.claimDate}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}