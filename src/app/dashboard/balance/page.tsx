'use client';

import { useState, useEffect } from 'react';
import { useAccount, usePublicClient, useChainId } from 'wagmi';
import { formatEther } from 'viem';
import { ERC20_ABI } from '@/contracts/InsuranceContract';
import { useContractAddresses } from '@/hooks/useContractAddresses';
import { ArrowPathIcon, BanknotesIcon, CurrencyDollarIcon } from '@heroicons/react/24/outline';

export default function BalancePage() {
  const { address } = useAccount();
  const chainId = useChainId();
  const publicClient = usePublicClient({ chainId });
  const { tokenContract: TOKEN_ADDRESS, insuranceContract: INSURANCE_CONTRACT_ADDRESS, networkName, explorer } = useContractAddresses();

  const [tokenBalance, setTokenBalance] = useState<string>('0');
  const [ethBalance, setEthBalance] = useState<string>('0');
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const fetchBalances = async () => {
    if (!publicClient || !address) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    try {
      // Fetch ETH balance
      const ethBal = await publicClient.getBalance({ address: address as `0x${string}` });
      setEthBalance(formatEther(ethBal));

      // Fetch Token balance
      const tokenBal = await publicClient.readContract({
        address: TOKEN_ADDRESS,
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: [address as `0x${string}`],
      }) as bigint;
      setTokenBalance(formatEther(tokenBal));

      setLastUpdated(new Date());
    } catch (error) {
      console.error('Error fetching balances:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBalances();
  }, [publicClient, address, chainId]);

  const handleRefresh = () => {
    fetchBalances();
  };

  if (!address) {
    return (
      <div className="p-8">
        <div className="mb-8">
          <h1 className="text-2xl font-medium text-gray-900">Balance</h1>
          <p className="text-sm text-gray-500 mt-1">View your wallet balances</p>
        </div>

        <div className="bg-white rounded-lg border border-gray-100 p-12 text-center">
          <BanknotesIcon className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Please connect your wallet to view balances</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-medium text-gray-900">Balance</h1>
          <p className="text-sm text-gray-500 mt-1">Your wallet balances</p>
        </div>
        <button
          onClick={handleRefresh}
          disabled={isLoading}
          className="flex items-center gap-2 px-4 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-colors disabled:opacity-50"
        >
          <ArrowPathIcon className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Network Info */}
      <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="text-sm font-medium text-gray-900">{networkName}</span>
          </div>
          <div className="text-xs text-gray-500">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </div>
        </div>
      </div>

      {/* Balance Cards */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Token Balance */}
        <div className="bg-white rounded-lg border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gray-900 rounded-lg flex items-center justify-center">
              <BanknotesIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Insurance Token</p>
              <p className="text-sm font-medium text-gray-900">Balance</p>
            </div>
          </div>

          <div className="mb-4">
            <p className="text-3xl font-medium text-gray-900">
              {isLoading ? (
                <span className="text-gray-400">Loading...</span>
              ) : (
                <>
                  {parseFloat(tokenBalance).toFixed(4)}
                  <span className="text-lg text-gray-500 ml-2">Tokens</span>
                </>
              )}
            </p>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-500 mb-1">Token Contract</p>
            <a
              href={`${explorer}/address/${TOKEN_ADDRESS}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-mono text-gray-900 hover:underline break-all"
            >
              {TOKEN_ADDRESS}
            </a>
          </div>
        </div>

        {/* ETH Balance */}
        <div className="bg-white rounded-lg border border-gray-100 p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
              <CurrencyDollarIcon className="w-5 h-5 text-gray-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Network Currency</p>
              <p className="text-sm font-medium text-gray-900">Gas Balance</p>
            </div>
          </div>

          <div className="mb-4">
            <p className="text-3xl font-medium text-gray-900">
              {isLoading ? (
                <span className="text-gray-400">Loading...</span>
              ) : (
                <>
                  {parseFloat(ethBalance).toFixed(6)}
                  <span className="text-lg text-gray-500 ml-2">ETH</span>
                </>
              )}
            </p>
          </div>

          <div className="pt-4 border-t border-gray-100">
            <p className="text-xs text-gray-500 mb-1">Wallet Address</p>
            <a
              href={`${explorer}/address/${address}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-mono text-gray-900 hover:underline break-all"
            >
              {address}
            </a>
          </div>
        </div>
      </div>

      {/* Balance Info */}
      <div className="bg-white rounded-lg border border-gray-100 p-6">
        <h2 className="text-sm font-medium text-gray-900 mb-4">Balance Information</h2>

        <div className="space-y-4">
          <div className="flex justify-between items-start pb-3 border-b border-gray-50">
            <div>
              <p className="text-sm text-gray-900 mb-1">Insurance Tokens</p>
              <p className="text-xs text-gray-500">
                Used to purchase insurance policies and receive claim payouts
              </p>
            </div>
            <span className="text-sm font-medium text-gray-900">
              {parseFloat(tokenBalance).toFixed(4)}
            </span>
          </div>

          <div className="flex justify-between items-start pb-3 border-b border-gray-50">
            <div>
              <p className="text-sm text-gray-900 mb-1">ETH Balance</p>
              <p className="text-xs text-gray-500">
                Required for transaction gas fees on {networkName}
              </p>
            </div>
            <span className="text-sm font-medium text-gray-900">
              {parseFloat(ethBalance).toFixed(6)}
            </span>
          </div>

          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-900 mb-1">Network</p>
              <p className="text-xs text-gray-500">
                Current connected network
              </p>
            </div>
            <span className="text-sm font-medium text-gray-900">
              {networkName}
            </span>
          </div>
        </div>
      </div>

      {/* Contract Addresses */}
      <div className="mt-6 bg-white rounded-lg border border-gray-100 p-6">
        <h2 className="text-sm font-medium text-gray-900 mb-4">Contract Addresses</h2>

        <div className="space-y-3">
          <div>
            <p className="text-xs text-gray-500 mb-1">Insurance Contract</p>
            <a
              href={`${explorer}/address/${INSURANCE_CONTRACT_ADDRESS}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-mono text-gray-900 hover:underline break-all block"
            >
              {INSURANCE_CONTRACT_ADDRESS}
            </a>
          </div>

          <div>
            <p className="text-xs text-gray-500 mb-1">Token Contract</p>
            <a
              href={`${explorer}/address/${TOKEN_ADDRESS}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-mono text-gray-900 hover:underline break-all block"
            >
              {TOKEN_ADDRESS}
            </a>
          </div>

          <div>
            <p className="text-xs text-gray-500 mb-1">Block Explorer</p>
            <a
              href={explorer}
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-gray-900 hover:underline"
            >
              {explorer}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
