'use client';

import { useState, useEffect } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useWalletClient, usePublicClient, useAccount, useChainId } from 'wagmi';
import { useSetActiveWallet } from '@privy-io/wagmi';
import { parseEther, formatEther } from 'viem';
import { INSURANCE_CONTRACT_ABI, ERC20_ABI } from '@/contracts/InsuranceContract';
import { useContractAddresses } from '@/hooks/useContractAddresses';

export default function BuyInsurancePage() {
  const { user, authenticated } = usePrivy();
  const { wallets } = useWallets();
  const { setActiveWallet } = useSetActiveWallet();
  const { address } = useAccount();
  const chainId = useChainId();
  const { data: walletClient } = useWalletClient({ chainId });
  const publicClient = usePublicClient({ chainId });

  // Get contract addresses for current network
  const { insuranceContract: INSURANCE_CONTRACT_ADDRESS, tokenContract: TOKEN_ADDRESS, explorer, networkName } = useContractAddresses();

  // Get the active wallet from Privy
  const wallet = wallets[0];

  const [formData, setFormData] = useState({
    containerNumber: '',
    merchandiseValue: '',
    expectedArrivalDate: '',
    origin: '',
    destination: '',
  });

  const [showQuote, setShowQuote] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [txHash, setTxHash] = useState('');
  const [approvalTxHash, setApprovalTxHash] = useState('');
  const [isApproved, setIsApproved] = useState(false);
  const [purchaseComplete, setPurchaseComplete] = useState(false);
  const [contractPricing, setContractPricing] = useState({
    premiumAmount: '0',
    payoutPerDay: '0',
    maxPayoutDays: '0'
  });

  // Set active wallet when wallets are available
  useEffect(() => {
    if (wallets.length > 0 && !address) {
      setActiveWallet(wallets[0]);
    }
  }, [wallets, address, setActiveWallet]);

  // Fetch contract pricing on mount
  useEffect(() => {
    const fetchPricing = async () => {
      if (!publicClient) return;

      try {
        const [premium, payout, maxDays] = await Promise.all([
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

        setContractPricing({
          premiumAmount: formatEther(premium),
          payoutPerDay: formatEther(payout),
          maxPayoutDays: maxDays.toString()
        });
      } catch (error) {
        console.error('Error fetching contract pricing:', error);
      }
    };

    fetchPricing();
  }, [publicClient]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const calculatePremium = () => {
    // Use contract premium amount or fallback to 2% of value
    if (contractPricing.premiumAmount !== '0') {
      return contractPricing.premiumAmount;
    }
    const value = parseFloat(formData.merchandiseValue) || 0;
    return (value * 0.02).toFixed(2);
  };

  const calculateDailyCompensation = () => {
    // Use contract payout per day or fallback to 1% of value
    if (contractPricing.payoutPerDay !== '0') {
      return contractPricing.payoutPerDay;
    }
    const value = parseFloat(formData.merchandiseValue) || 0;
    return (value * 0.01).toFixed(2);
  };

  const handleGetQuote = (e: React.FormEvent) => {
    e.preventDefault();
    setShowQuote(true);
  };

  // Check token allowance when quote is shown
  useEffect(() => {
    const checkAllowance = async () => {
      if (!showQuote || !publicClient || !address) return;

      try {
        const premiumInWei = parseEther(calculatePremium());
        const allowance = await publicClient.readContract({
          address: TOKEN_ADDRESS,
          abi: ERC20_ABI,
          functionName: 'allowance',
          args: [address as `0x${string}`, INSURANCE_CONTRACT_ADDRESS],
        }) as bigint;

        console.log('Current allowance:', formatEther(allowance), 'tokens');
        console.log('Required premium:', calculatePremium(), 'tokens');

        setIsApproved(allowance >= premiumInWei);
      } catch (error) {
        console.error('Error checking allowance:', error);
      }
    };

    checkAllowance();
  }, [showQuote, publicClient, address, formData.merchandiseValue]);

  const handleApproveTokens = async () => {
    console.log('Starting token approval process...');

    if (!wallet || !address) {
      alert('Please connect your wallet');
      return;
    }

    if (!walletClient || !publicClient) {
      alert('Wallet client not available. Please try again.');
      return;
    }

    setIsLoading(true);
    try {
      // Switch to the correct chain if needed
      console.log(`Switching to ${networkName}...`);
      await wallet.switchChain(chainId);

      // Calculate premium amount in wei (assuming token has 18 decimals like ETH)
      const premiumInWei = parseEther(calculatePremium());
      console.log('Approving tokens:', calculatePremium(), 'tokens');

      // Check token balance first
      const tokenBalance = await publicClient.readContract({
        address: TOKEN_ADDRESS,
        abi: ERC20_ABI,
        functionName: 'balanceOf',
        args: [address as `0x${string}`],
      }) as bigint;

      console.log('Token balance:', formatEther(tokenBalance), 'tokens');

      if (tokenBalance < premiumInWei) {
        alert(`Insufficient token balance. You need ${calculatePremium()} tokens. Your balance is ${formatEther(tokenBalance)} tokens.`);
        setIsLoading(false);
        return;
      }

      // Estimate gas for approval
      const gasEstimate = await publicClient.estimateContractGas({
        address: TOKEN_ADDRESS,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [INSURANCE_CONTRACT_ADDRESS, premiumInWei],
        account: address as `0x${string}`,
      });

      const gasLimit = gasEstimate + (gasEstimate * 20n / 100n);
      const gasPrice = await publicClient.getGasPrice();

      // Send approval transaction
      console.log('Sending approval transaction...');
      const hash = await walletClient.writeContract({
        address: TOKEN_ADDRESS,
        abi: ERC20_ABI,
        functionName: 'approve',
        args: [INSURANCE_CONTRACT_ADDRESS, premiumInWei],
        account: address as `0x${string}`,
        gas: gasLimit,
        maxFeePerGas: gasPrice * 2n,
        maxPriorityFeePerGas: gasPrice / 10n,
      });

      console.log('Approval transaction hash:', hash);
      setApprovalTxHash(hash);

      // Show success message with transaction hash immediately
      alert(`Approval transaction submitted! Hash: ${hash.slice(0, 10)}...${hash.slice(-8)}\n\nWaiting for confirmation...`);

      // Wait for confirmation
      const receipt = await publicClient.waitForTransactionReceipt({ hash });

      if (receipt.status === 'success') {
        console.log('Token approval successful');
        setIsApproved(true);
        alert('Tokens approved successfully! You can now purchase the insurance.');
      }
    } catch (error: any) {
      console.error('Error approving tokens:', error);

      let errorMessage = 'Error approving tokens. ';
      if (error?.message?.includes('user rejected') || error?.message?.includes('User denied')) {
        errorMessage += 'Transaction was cancelled.';
      } else if (error?.shortMessage) {
        errorMessage += error.shortMessage;
      } else {
        errorMessage += 'Please check the console for details.';
      }

      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBuyAnother = () => {
    // Reset all state for a new purchase
    setFormData({
      containerNumber: '',
      merchandiseValue: '',
      expectedArrivalDate: '',
      origin: '',
      destination: '',
    });
    setShowQuote(false);
    setAcceptTerms(false);
    setIsApproved(false);
    setApprovalTxHash('');
    setTxHash('');
    setPurchaseComplete(false);
  };

  const handlePurchase = async () => {
    console.log('Starting insurance purchase process...');

    if (!acceptTerms) {
      alert('Please accept the terms and conditions');
      return;
    }

    if (!isApproved) {
      alert('Please approve tokens first');
      return;
    }

    if (!wallet || !address) {
      alert('Please connect your wallet');
      return;
    }

    if (!walletClient || !publicClient) {
      alert('Wallet client not available. Please try again.');
      return;
    }

    setIsLoading(true);
    try {
      // Switch to the correct chain if needed
      console.log(`Switching to ${networkName}...`);
      await wallet.switchChain(chainId);

      // Convert date to Unix timestamp
      const expectedArrival = Math.floor(new Date(formData.expectedArrivalDate).getTime() / 1000);

      console.log('Transaction parameters:', {
        containerNumber: formData.containerNumber,
        expectedArrival,
        contractAddress: INSURANCE_CONTRACT_ADDRESS,
        account: address
      });

      // Estimate gas for the buy transaction
      console.log('Estimating gas for purchase...');
      const gasEstimate = await publicClient.estimateContractGas({
        address: INSURANCE_CONTRACT_ADDRESS,
        abi: INSURANCE_CONTRACT_ABI,
        functionName: 'buyPolicy',
        args: [formData.containerNumber, BigInt(expectedArrival)],
        account: address as `0x${string}`,
      });

      console.log('Gas estimate:', gasEstimate.toString());

      const gasLimit = gasEstimate + (gasEstimate * 20n / 100n);
      const gasPrice = await publicClient.getGasPrice();

      // Send the buy transaction
      console.log('Sending purchase transaction...');
      const hash = await walletClient.writeContract({
        address: INSURANCE_CONTRACT_ADDRESS,
        abi: INSURANCE_CONTRACT_ABI,
        functionName: 'buyPolicy',
        args: [formData.containerNumber, BigInt(expectedArrival)],
        account: address as `0x${string}`,
        gas: gasLimit,
        maxFeePerGas: gasPrice * 2n,
        maxPriorityFeePerGas: gasPrice / 10n,
      });

      console.log('Purchase transaction hash:', hash);
      setTxHash(hash);

      // Show success message with transaction hash immediately
      alert(`Transaction submitted successfully! Hash: ${hash.slice(0, 10)}...${hash.slice(-8)}\n\nWaiting for confirmation...`);

      // Wait for transaction confirmation
      const receipt = await publicClient.waitForTransactionReceipt({ hash });

      if (receipt.status === 'success') {
        alert(`Insurance policy confirmed! Your policy is now active.`);
        // Mark purchase as complete
        setPurchaseComplete(true);
      }
    } catch (error: any) {
      console.error('Error purchasing policy:', error);

      let errorMessage = 'Error purchasing policy. ';
      if (error?.message?.includes('insufficient')) {
        errorMessage += 'Insufficient token balance or allowance.';
      } else if (error?.message?.includes('user rejected') || error?.message?.includes('User denied')) {
        errorMessage += 'Transaction was cancelled.';
      } else if (error?.shortMessage) {
        errorMessage += error.shortMessage;
      } else {
        errorMessage += 'Please check the console for details.';
      }

      alert(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-medium text-gray-900">Buy Insurance</h1>
        <p className="text-sm text-gray-500 mt-1">Container delay protection on Arbitrum Sepolia</p>
      </div>

      {/* Connection Status */}
      {!authenticated || !address ? (
        <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-sm text-gray-600">
            Please connect your wallet to Arbitrum Sepolia to purchase insurance
          </p>
        </div>
      ) : null}

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleGetQuote} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-600 mb-2">Container Number</label>
                <input
                  type="text"
                  name="containerNumber"
                  value={formData.containerNumber}
                  onChange={handleInputChange}
                  placeholder="MSCU1234567"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-gray-900 outline-none transition text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs text-gray-600 mb-2">Value (USD)</label>
                <input
                  type="number"
                  name="merchandiseValue"
                  value={formData.merchandiseValue}
                  onChange={handleInputChange}
                  placeholder="50000"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-gray-900 outline-none transition text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs text-gray-600 mb-2">Origin</label>
                <input
                  type="text"
                  name="origin"
                  value={formData.origin}
                  onChange={handleInputChange}
                  placeholder="Shanghai"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-gray-900 outline-none transition text-sm"
                  required
                />
              </div>

              <div>
                <label className="block text-xs text-gray-600 mb-2">Destination</label>
                <input
                  type="text"
                  name="destination"
                  value={formData.destination}
                  onChange={handleInputChange}
                  placeholder="Los Angeles"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-gray-900 outline-none transition text-sm"
                  required
                />
              </div>

              <div className="col-span-2">
                <label className="block text-xs text-gray-600 mb-2">Expected Arrival</label>
                <input
                  type="date"
                  name="expectedArrivalDate"
                  value={formData.expectedArrivalDate}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg focus:border-gray-900 outline-none transition text-sm"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full bg-gray-900 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-gray-800 transition"
            >
              Get Quote
            </button>
          </form>

          {showQuote && (
            <div className="mt-8 space-y-6">
              {/* Quote Details */}
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-sm font-medium text-gray-900 mb-4">Quote Details</h3>
                <div className="space-y-3">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Coverage Amount</span>
                    <span className="font-medium text-gray-900">
                      ${parseFloat(formData.merchandiseValue).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Premium</span>
                    <span className="font-medium text-gray-900">{calculatePremium()} Tokens</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Daily Compensation</span>
                    <span className="font-medium text-gray-900">{calculateDailyCompensation()} Tokens</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">Max Coverage Days</span>
                    <span className="font-medium text-gray-900">{contractPricing.maxPayoutDays}</span>
                  </div>
                </div>
              </div>

              {/* Terms */}
              <div className="border border-gray-200 rounded-lg p-6">
                <h3 className="text-sm font-medium text-gray-900 mb-3">Terms</h3>
                <ul className="space-y-2 text-xs text-gray-600">
                  <li>• Coverage starts from expected arrival date</li>
                  <li>• Daily compensation for delays: {calculateDailyCompensation()} Tokens</li>
                  <li>• Maximum coverage: {contractPricing.maxPayoutDays} days</li>
                  <li>• Payment via ERC20 tokens</li>
                  <li>• Real-time tracking included</li>
                  <li>• Instant on-chain claim processing</li>
                  <li>• Network: Arbitrum Sepolia</li>
                </ul>

                <div className="mt-4 flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={acceptTerms}
                    onChange={(e) => setAcceptTerms(e.target.checked)}
                    className="mt-0.5 rounded border-gray-300"
                  />
                  <label htmlFor="terms" className="text-xs text-gray-600">
                    I accept the terms and conditions
                  </label>
                </div>
              </div>

              {/* Transaction Hashes */}
              {approvalTxHash && (
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <p className="text-xs text-gray-600">Approval Transaction:</p>
                  <a
                    href={`${explorer}/tx/${approvalTxHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-mono text-gray-900 hover:underline break-all"
                  >
                    {approvalTxHash}
                  </a>
                </div>
              )}

              {txHash && (
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <p className="text-xs text-gray-600">Purchase Transaction:</p>
                  <a
                    href={`${explorer}/tx/${txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-mono text-gray-900 hover:underline break-all"
                  >
                    {txHash}
                  </a>
                </div>
              )}

              {/* Two-step purchase process */}
              <div className="space-y-3">
                {purchaseComplete ? (
                  <>
                    {/* Success State */}
                    <div className="p-4 bg-gray-900 text-white rounded-lg">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-5 h-5 bg-white rounded-full flex items-center justify-center">
                          <svg className="w-3 h-3 text-gray-900" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <p className="font-medium">Purchase Successful!</p>
                      </div>
                      <p className="text-xs text-gray-200">
                        Your insurance policy is now active. You can track your container and file claims if needed.
                      </p>
                    </div>
                    <button
                      onClick={handleBuyAnother}
                      className="w-full py-2.5 rounded-lg text-sm font-medium bg-gray-900 text-white hover:bg-gray-800 transition"
                    >
                      Buy Another Policy
                    </button>
                  </>
                ) : !isApproved ? (
                  <>
                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg text-xs text-gray-600">
                      <p className="font-medium text-gray-900 mb-1">Step 1: Approve Tokens</p>
                      <p>Allow the insurance contract to use {calculatePremium()} tokens from your wallet.</p>
                    </div>
                    <button
                      onClick={handleApproveTokens}
                      disabled={!acceptTerms || isLoading || !authenticated || !address}
                      className={`w-full py-2.5 rounded-lg text-sm font-medium transition ${
                        acceptTerms && !isLoading && authenticated && address
                          ? 'bg-gray-900 text-white hover:bg-gray-800'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {isLoading ? 'Approving...' : `Approve ${calculatePremium()} Tokens`}
                    </button>
                  </>
                ) : (
                  <>
                    <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                      <div className="flex items-center gap-2 text-xs">
                        <div className="w-4 h-4 bg-gray-900 rounded-full flex items-center justify-center">
                          <svg className="w-2 h-2 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <p className="font-medium text-gray-900">Tokens Approved!</p>
                      </div>
                      <p className="text-xs text-gray-600 mt-1 ml-6">
                        Step 2: Now you can purchase the insurance policy.
                      </p>
                    </div>
                    <button
                      onClick={handlePurchase}
                      disabled={isLoading || !authenticated || !address}
                      className={`w-full py-2.5 rounded-lg text-sm font-medium transition ${
                        !isLoading && authenticated && address
                          ? 'bg-gray-900 text-white hover:bg-gray-800'
                          : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {isLoading ? 'Processing...' : `Purchase Insurance - ${calculatePremium()} Tokens`}
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Info Panel */}
        <div className="space-y-4">
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Coverage</h3>
            <div className="space-y-2 text-xs text-gray-600">
              <p>Container delay insurance on Arbitrum Sepolia blockchain.</p>
              <p className="font-medium text-gray-900 mt-2">You receive:</p>
              <p>• {calculateDailyCompensation()} Tokens per day delayed</p>
              <p>• Instant claim processing</p>
              <p>• Real-time tracking</p>
              <p>• Up to {contractPricing.maxPayoutDays} days coverage</p>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Contract Info</h3>
            <div className="space-y-2 text-xs">
              <div>
                <p className="text-gray-600">Network</p>
                <p className="font-medium text-gray-900">Arbitrum Sepolia</p>
              </div>
              <div>
                <p className="text-gray-600">Insurance Contract</p>
                <p className="font-mono text-gray-900 break-all text-[10px]">{INSURANCE_CONTRACT_ADDRESS}</p>
              </div>
              <div>
                <p className="text-gray-600">Token Contract</p>
                <p className="font-mono text-gray-900 break-all text-[10px]">{TOKEN_ADDRESS}</p>
              </div>
              <div>
                <p className="text-gray-600">Status</p>
                <p className="font-medium text-gray-900">
                  {authenticated && address ? 'Connected' : 'Not Connected'}
                </p>
              </div>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Process</h3>
            <div className="space-y-2 text-xs text-gray-600">
              <div className="flex gap-2">
                <span className="font-medium text-gray-900">1.</span>
                <span>Enter container details</span>
              </div>
              <div className="flex gap-2">
                <span className="font-medium text-gray-900">2.</span>
                <span>Review quote & terms</span>
              </div>
              <div className="flex gap-2">
                <span className="font-medium text-gray-900">3.</span>
                <span>Approve token spending</span>
              </div>
              <div className="flex gap-2">
                <span className="font-medium text-gray-900">4.</span>
                <span>Purchase insurance</span>
              </div>
              <div className="flex gap-2">
                <span className="font-medium text-gray-900">5.</span>
                <span>Track & claim if delayed</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}