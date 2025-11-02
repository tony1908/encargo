'use client';

import { useState } from 'react';
import { useWallets } from '@privy-io/react-auth';
import { useChainId } from 'wagmi';
import { arbitrumSepolia, scrollSepolia } from 'viem/chains';
import { NETWORK_CONFIG } from '@/contracts/InsuranceContract';
import { ChevronDownIcon, CheckIcon } from '@heroicons/react/24/outline';

export function NetworkSwitcher() {
  const { wallets } = useWallets();
  const wallet = wallets[0];
  const currentChainId = useChainId();
  const [isOpen, setIsOpen] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);

  const networks = [
    {
      id: arbitrumSepolia.id,
      name: 'Arbitrum Sepolia',
      chainName: arbitrumSepolia.name,
    },
    {
      id: scrollSepolia.id,
      name: 'Scroll Sepolia',
      chainName: scrollSepolia.name,
    },
  ];

  const currentNetwork = networks.find(n => n.id === currentChainId) || networks[0];

  const handleNetworkSwitch = async (chainId: number) => {
    if (!wallet || chainId === currentChainId) {
      setIsOpen(false);
      return;
    }

    setIsSwitching(true);
    try {
      await wallet.switchChain(chainId);
      setIsOpen(false);
    } catch (error) {
      console.error('Error switching network:', error);
      alert('Failed to switch network. Please try again.');
    } finally {
      setIsSwitching(false);
    }
  };

  if (!wallet) {
    return null;
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors"
        disabled={isSwitching}
      >
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-green-500 rounded-full"></div>
          <span className="font-medium">{currentNetwork.name}</span>
        </div>
        <ChevronDownIcon className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          ></div>
          <div className="absolute left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 overflow-hidden">
            {networks.map((network) => (
              <button
                key={network.id}
                onClick={() => handleNetworkSwitch(network.id)}
                disabled={isSwitching}
                className={`w-full flex items-center justify-between px-3 py-2.5 text-sm transition-colors ${
                  network.id === currentChainId
                    ? 'bg-gray-50 text-gray-900'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${
                    network.id === currentChainId ? 'bg-green-500' : 'bg-gray-300'
                  }`}></div>
                  <span>{network.name}</span>
                </div>
                {network.id === currentChainId && (
                  <CheckIcon className="w-4 h-4 text-gray-900" />
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
