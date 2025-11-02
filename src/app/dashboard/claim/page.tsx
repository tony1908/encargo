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
    // Simulate claim submission
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
      <div className="p-6 lg:p-8 max-w-3xl mx-auto">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircleIcon className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Claim Submitted Successfully!</h2>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Your claim has been submitted and is being processed. You will receive compensation within
            24-48 hours.
          </p>

          {selectedContainerData && (
            <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl p-6 text-white mb-8">
              <p className="text-indigo-100 mb-2">Total Compensation</p>
              <p className="text-4xl font-bold">${selectedContainerData.totalCompensation.toLocaleString()}</p>
              <p className="text-indigo-100 mt-2">
                {selectedContainerData.daysDelayed} days × ${selectedContainerData.dailyCompensation.toLocaleString()}/day
              </p>
            </div>
          )}

          <div className="space-y-2 mb-8 text-left bg-gray-50 rounded-lg p-6">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Claim ID</span>
              <span className="font-mono font-semibold text-gray-900">#CLM{Date.now()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Container Number</span>
              <span className="font-mono font-semibold text-gray-900">{selectedContainer}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Status</span>
              <span className="px-2 py-1 bg-yellow-100 text-yellow-700 text-xs font-semibold rounded-full">
                Processing
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Expected Payment</span>
              <span className="font-semibold text-gray-900">Within 24-48 hours</span>
            </div>
          </div>

          <button
            onClick={() => {
              setClaimSubmitted(false);
              setSelectedContainer('');
            }}
            className="px-6 py-3 bg-indigo-600 text-white font-semibold rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Submit Another Claim
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 lg:p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Claim Insurance</h1>
        <p className="text-gray-600">File a claim for delayed container delivery</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Claim Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Eligible Containers */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-6">Eligible Containers</h2>

            {eligibleContainers.length === 0 ? (
              <div className="text-center py-8">
                <ClockIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">No containers are currently eligible for claims</p>
              </div>
            ) : (
              <div className="space-y-4">
                {eligibleContainers.map((container) => (
                  <button
                    key={container.containerNumber}
                    onClick={() => setSelectedContainer(container.containerNumber)}
                    className={`w-full text-left p-4 border-2 rounded-xl transition-all ${
                      selectedContainer === container.containerNumber
                        ? 'border-indigo-500 bg-indigo-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="font-mono font-semibold text-gray-900 mb-1">
                          {container.containerNumber}
                        </h3>
                        <p className="text-sm text-gray-600">
                          {container.origin} → {container.destination}
                        </p>
                      </div>
                      <div className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full">
                        {container.daysDelayed} days delayed
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 pt-3 border-t border-gray-200">
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Expected Arrival</p>
                        <p className="text-sm font-semibold text-gray-900">
                          {container.expectedArrival}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Daily Compensation</p>
                        <p className="text-sm font-semibold text-orange-600">
                          ${container.dailyCompensation.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-600 mb-1">Total Claim</p>
                        <p className="text-sm font-semibold text-green-600">
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
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-6">Claim Details</h2>

              <form onSubmit={handleSubmitClaim} className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Container Number</p>
                    <p className="font-mono font-semibold text-gray-900">
                      {selectedContainerData.containerNumber}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Merchandise Value</p>
                    <p className="font-semibold text-gray-900">
                      ${selectedContainerData.merchandiseValue.toLocaleString()}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Expected Arrival</p>
                    <p className="font-semibold text-gray-900">
                      {selectedContainerData.expectedArrival}
                    </p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-600 mb-1">Days Delayed</p>
                    <p className="font-semibold text-orange-600">
                      {selectedContainerData.daysDelayed} days
                    </p>
                  </div>
                </div>

                <div className="p-6 bg-gradient-to-br from-green-50 to-green-100 border border-green-200 rounded-xl">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-gray-900">Compensation Breakdown</h3>
                    <BanknotesIcon className="w-6 h-6 text-green-600" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-700">Daily compensation (1% of value)</span>
                      <span className="font-semibold text-gray-900">
                        ${selectedContainerData.dailyCompensation.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-700">Number of days delayed</span>
                      <span className="font-semibold text-gray-900">
                        {selectedContainerData.daysDelayed} days
                      </span>
                    </div>
                    <div className="pt-3 border-t border-green-300 flex justify-between">
                      <span className="font-semibold text-gray-900">Total Compensation</span>
                      <span className="text-2xl font-bold text-green-600">
                        ${selectedContainerData.totalCompensation.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <DocumentTextIcon className="w-5 h-5 text-blue-600 mt-0.5" />
                  <div className="text-sm text-blue-900">
                    <p className="font-semibold mb-1">Required Documentation</p>
                    <p className="text-blue-700">
                      Container tracking information and delivery confirmation will be automatically
                      verified. No additional documentation required.
                    </p>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-indigo-600 text-white py-4 rounded-lg font-semibold hover:bg-indigo-700 transition-colors shadow-lg hover:shadow-xl"
                >
                  Submit Claim - ${selectedContainerData.totalCompensation.toLocaleString()}
                </button>
              </form>
            </div>
          )}

          {!selectedContainerData && eligibleContainers.length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-12 text-center">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <BanknotesIcon className="w-8 h-8 text-gray-600" />
              </div>
              <h3 className="font-semibold text-gray-900 mb-2">Select a Container</h3>
              <p className="text-sm text-gray-600">
                Choose a container from the eligible list above to file a claim
              </p>
            </div>
          )}
        </div>

        {/* Claim History & Info */}
        <div className="space-y-6">
          {/* Info Card */}
          <div className="bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl p-6 text-white">
            <h3 className="font-semibold mb-3">How Claims Work</h3>
            <ul className="space-y-2 text-sm text-indigo-100">
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-white rounded-full mt-1.5"></div>
                <span>Claims are automatically calculated based on delay</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-white rounded-full mt-1.5"></div>
                <span>You receive 1% of merchandise value per day delayed</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-white rounded-full mt-1.5"></div>
                <span>Processing takes 24-48 hours</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-white rounded-full mt-1.5"></div>
                <span>Payment sent directly to your wallet</span>
              </li>
            </ul>
          </div>

          {/* Claim History */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="font-semibold text-gray-900 mb-4">Recent Claims</h3>
            <div className="space-y-3">
              {claimHistory.map((claim) => (
                <div key={claim.id} className="p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-start justify-between mb-2">
                    <p className="font-mono text-sm font-semibold text-gray-900">
                      {claim.containerNumber}
                    </p>
                    <span
                      className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                        claim.status === 'approved'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-yellow-100 text-yellow-700'
                      }`}
                    >
                      {claim.status === 'approved' ? 'Paid' : 'Processing'}
                    </span>
                  </div>
                  <div className="space-y-1 text-xs text-gray-600">
                    <p>Filed: {claim.claimDate}</p>
                    <p className="font-semibold text-green-600">${claim.amount.toLocaleString()}</p>
                    {claim.paymentDate && <p>Paid: {claim.paymentDate}</p>}
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
