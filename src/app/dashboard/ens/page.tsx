'use client';

import { useState } from 'react';
import { useChainId } from 'wagmi';
import { useContractAddresses } from '@/hooks/useContractAddresses';
import { CheckCircleIcon, ClockIcon, GlobeAltIcon } from '@heroicons/react/24/outline';

export default function ENSClaimPage() {
  const chainId = useChainId();
  const { insuranceContract, tokenContract, networkName } = useContractAddresses();

  const [subdomain, setSubdomain] = useState('');
  const [isSimulating, setIsSimulating] = useState(false);
  const [claimed, setClaimed] = useState(false);
  const [claimedSubdomain, setClaimedSubdomain] = useState('');

  // Simulated claimed subdomains
  const existingSubdomains = [
    { name: 'arbitrum', address: '0xDE5d818E49F12E1feB107F320276D84Cb544b767', network: 'Arbitrum Sepolia' },
    { name: 'scroll', address: '0x8420eEC4b6C5Df04D3bf8eA282aD2C8bE35858Cd', network: 'Scroll Sepolia' },
    { name: 'insurance', address: '0xDE5d818E49F12E1feB107F320276D84Cb544b767', network: 'Multi-network' },
  ];

  const handleClaimSubdomain = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSimulating(true);

    // Simulate transaction delay
    await new Promise(resolve => setTimeout(resolve, 2000));

    setClaimedSubdomain(`${subdomain}.encargoportocol.eth`);
    setClaimed(true);
    setIsSimulating(false);
  };

  const handleClaimAnother = () => {
    setClaimed(false);
    setSubdomain('');
    setClaimedSubdomain('');
  };

  if (claimed) {
    return (
      <div className="p-8 max-w-3xl mx-auto">
        <div className="bg-white rounded-lg border border-gray-100 p-12 text-center">
          <div className="w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircleIcon className="w-6 h-6 text-white" />
          </div>

          <h2 className="text-xl font-medium text-gray-900 mb-2">Subdomain Claimed!</h2>
          <p className="text-sm text-gray-600 mb-8 max-w-md mx-auto">
            Your ENS subdomain has been successfully claimed (simulated)
          </p>

          <div className="bg-gray-50 rounded-lg p-6 mb-8 border border-gray-200">
            <p className="text-xs text-gray-500 mb-2">Your ENS Subdomain</p>
            <p className="text-2xl font-medium text-gray-900 mb-4">
              {claimedSubdomain}
            </p>
            <p className="text-xs text-gray-500">Points to</p>
            <p className="text-sm font-mono text-gray-900 mt-1 break-all">
              {insuranceContract}
            </p>
          </div>

          <div className="space-y-3 mb-8 text-left bg-gray-50 rounded-lg p-6">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Network</span>
              <span className="text-gray-900">{networkName}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Contract Address</span>
              <span className="font-mono text-gray-900 text-xs">
                {insuranceContract.slice(0, 10)}...{insuranceContract.slice(-8)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Status</span>
              <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded">
                Active (Simulated)
              </span>
            </div>
          </div>

          <p className="text-xs text-gray-500 mb-6">
            Note: This is a simulation. No actual ENS transaction was performed.
          </p>

          <button
            onClick={handleClaimAnother}
            className="px-4 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-800 transition-colors"
          >
            Claim Another Subdomain
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-medium text-gray-900">ENS Subdomains</h1>
        <p className="text-sm text-gray-500 mt-1">Claim subdomains under encargoportocol.eth</p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Claim Form */}
        <div className="lg:col-span-2 space-y-6">
          {/* Existing Subdomains */}
          <div className="bg-white rounded-lg border border-gray-100 p-6">
            <h2 className="text-sm font-medium text-gray-900 mb-4">Existing Subdomains</h2>
            <div className="space-y-3">
              {existingSubdomains.map((domain) => (
                <div key={domain.name} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-gray-100 rounded-lg flex items-center justify-center">
                      <GlobeAltIcon className="w-4 h-4 text-gray-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {domain.name}.encargoportocol.eth
                      </p>
                      <p className="text-xs text-gray-500 mt-0.5">{domain.network}</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs font-medium rounded">
                    Active
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Claim New Subdomain */}
          <div className="bg-white rounded-lg border border-gray-100 p-6">
            <h2 className="text-sm font-medium text-gray-900 mb-4">Claim New Subdomain</h2>

            <form onSubmit={handleClaimSubdomain} className="space-y-4">
              <div>
                <label className="block text-xs text-gray-600 mb-2">Subdomain Name</label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={subdomain}
                    onChange={(e) => setSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))}
                    placeholder="mycontract"
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-lg focus:border-gray-900 outline-none transition text-sm"
                    required
                    disabled={isSimulating}
                  />
                  <span className="text-sm text-gray-500">.encargoportocol.eth</span>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Only lowercase letters, numbers, and hyphens allowed
                </p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Will Point To</h3>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Network</span>
                    <span className="text-gray-900">{networkName}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Insurance Contract</span>
                    <span className="font-mono text-gray-900">
                      {insuranceContract.slice(0, 10)}...{insuranceContract.slice(-8)}
                    </span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-600">Token Contract</span>
                    <span className="font-mono text-gray-900">
                      {tokenContract.slice(0, 10)}...{tokenContract.slice(-8)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-xs text-yellow-800">
                  <strong>Simulation Mode:</strong> This will only simulate the claiming process.
                  No actual ENS transaction will be performed.
                </p>
              </div>

              <button
                type="submit"
                disabled={isSimulating || !subdomain}
                className={`w-full py-2.5 rounded-lg text-sm font-medium transition ${
                  !isSimulating && subdomain
                    ? 'bg-gray-900 text-white hover:bg-gray-800'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                {isSimulating ? (
                  <span className="flex items-center justify-center gap-2">
                    <ClockIcon className="w-4 h-4 animate-spin" />
                    Simulating Claim...
                  </span>
                ) : (
                  'Claim Subdomain (Simulated)'
                )}
              </button>
            </form>
          </div>
        </div>

        {/* Info Sidebar */}
        <div className="space-y-4">
          {/* About ENS */}
          <div className="bg-white rounded-lg border border-gray-100 p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">About ENS</h3>
            <ul className="space-y-2 text-xs text-gray-600">
              <li className="flex items-start gap-2">
                <span className="text-gray-900">•</span>
                <span>Human-readable names for addresses</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gray-900">•</span>
                <span>Easier to share and remember</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gray-900">•</span>
                <span>Works across all Ethereum apps</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gray-900">•</span>
                <span>Decentralized naming system</span>
              </li>
            </ul>
          </div>

          {/* Current Network */}
          <div className="bg-white rounded-lg border border-gray-100 p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Current Network</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span className="text-sm text-gray-900">{networkName}</span>
              </div>
              <p className="text-xs text-gray-500">
                Subdomains will point to contracts on this network
              </p>
            </div>
          </div>

          {/* Parent Domain */}
          <div className="bg-white rounded-lg border border-gray-100 p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Parent Domain</h3>
            <p className="text-sm text-gray-900 mb-2">encargoportocol.eth</p>
            <p className="text-xs text-gray-500">
              All subdomains will be created under this parent domain
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
