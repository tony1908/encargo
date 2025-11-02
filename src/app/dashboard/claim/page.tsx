'use client';

import { useState, useEffect } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useWalletClient, usePublicClient, useAccount } from 'wagmi';
import { useSetActiveWallet } from '@privy-io/wagmi';
import { formatEther } from 'viem';
import { BanknotesIcon, DocumentTextIcon, ClockIcon, CheckCircleIcon } from '@heroicons/react/24/outline';
import { INSURANCE_CONTRACT_ADDRESS, INSURANCE_CONTRACT_ABI } from '@/contracts/InsuranceContract';
import { arbitrumSepolia } from 'viem/chains';

interface Policy {
  policyId: number;
  containerId: string;
  expectedArrival: Date;
  active: boolean;
  delayed: boolean;
  delivered: boolean;
  actualArrival: Date | null;
  claimedDays: number;
  claimableDays: number;
}

export default function ClaimInsurancePage() {
  const { authenticated } = usePrivy();
  const { wallets } = useWallets();
  const { setActiveWallet } = useSetActiveWallet();
  const { address } = useAccount();
  const { data: walletClient } = useWalletClient({ chainId: arbitrumSepolia.id });
  const publicClient = usePublicClient({ chainId: arbitrumSepolia.id });

  // Get the active wallet from Privy
  const wallet = wallets[0];

  const [selectedPolicy, setSelectedPolicy] = useState<number | null>(null);
  const [claimSubmitted, setClaimSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [txHash, setTxHash] = useState('');
  const [userPolicies, setUserPolicies] = useState<Policy[]>([]);
  const [contractPricing, setContractPricing] = useState({
    payoutPerDay: '0',
    maxPayoutDays: '0'
  });

  // Set active wallet when wallets are available
  useEffect(() => {
    if (wallets.length > 0 && !address) {
      setActiveWallet(wallets[0]);
    }
  }, [wallets, address, setActiveWallet]);

  // Fetch user policies and contract pricing
  useEffect(() => {
    const fetchData = async () => {
      if (!publicClient || !address) return;

      try {
        // Fetch contract pricing
        const [payout, maxDays] = await Promise.all([
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
          payoutPerDay: formatEther(payout),
          maxPayoutDays: maxDays.toString()
        });

        // Get user's policy IDs using the new function
        const userPolicyIds = await publicClient.readContract({
          address: INSURANCE_CONTRACT_ADDRESS,
          abi: INSURANCE_CONTRACT_ABI,
          functionName: 'getPoliciesByUser',
          args: [address as `0x${string}`],
        }) as bigint[];

        // Fetch all policies for the user
        const policies: Policy[] = [];
        for (const policyId of userPolicyIds) {
          try {
            const policy = await publicClient.readContract({
              address: INSURANCE_CONTRACT_ADDRESS,
              abi: INSURANCE_CONTRACT_ABI,
              functionName: 'getPolicy',
              args: [policyId],
            }) as any;

            // Verify the policy belongs to this user
            if (policy[0].toLowerCase() === address.toLowerCase()) {
              // Check claimable days
              const claimableDays = await publicClient.readContract({
                address: INSURANCE_CONTRACT_ADDRESS,
                abi: INSURANCE_CONTRACT_ABI,
                functionName: 'claimableDays',
                args: [policyId],
              }) as bigint;

              policies.push({
                policyId: Number(policyId),
                containerId: policy[1],
                expectedArrival: new Date(Number(policy[2]) * 1000),
                active: policy[3],
                delayed: policy[4], // delayed status from contract
                delivered: policy[5],
                actualArrival: policy[6] > 0 ? new Date(Number(policy[6]) * 1000) : null,
                claimedDays: Number(policy[7]),
                claimableDays: Number(claimableDays),
              });
            }
          } catch (error) {
            console.error(`Error fetching policy ${policyId}:`, error);
          }
        }

        setUserPolicies(policies);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [publicClient, address]);

  const handleSubmitClaim = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPolicy) {
      alert('Please select a policy');
      return;
    }

    if (!wallet || !address) {
      alert('Please connect your wallet');
      return;
    }

    if (!walletClient) {
      alert('Wallet client not available. Please try again.');
      return;
    }

    setIsLoading(true);
    try {
      // Switch to the correct chain if needed
      console.log('Switching to Arbitrum Sepolia...');
      await wallet.switchChain(arbitrumSepolia.id);

      console.log('Claim parameters:', {
        policyId: selectedPolicy,
        contractAddress: INSURANCE_CONTRACT_ADDRESS,
        account: address
      });

      // Check wallet balance for gas fees
      const balance = await publicClient.getBalance({ address: address as `0x${string}` });
      console.log('Wallet balance (ETH):', formatEther(balance));

      // Estimate gas for the claim transaction
      console.log('Estimating gas for claim...');
      const gasEstimate = await publicClient.estimateContractGas({
        address: INSURANCE_CONTRACT_ADDRESS,
        abi: INSURANCE_CONTRACT_ABI,
        functionName: 'claim',
        args: [BigInt(selectedPolicy)],
        account: address as `0x${string}`,
      });

      console.log('Gas estimate:', gasEstimate.toString());

      // Add 20% buffer to gas estimate
      const gasLimit = gasEstimate + (gasEstimate * 20n / 100n);

      // Get current gas price
      const gasPrice = await publicClient.getGasPrice();
      console.log('Gas price:', gasPrice.toString());

      // Calculate estimated gas cost
      const estimatedGasCost = gasLimit * gasPrice;
      console.log('Estimated gas cost (Wei):', estimatedGasCost.toString());
      console.log('Estimated gas cost (ETH):', formatEther(estimatedGasCost));

      if (balance < estimatedGasCost) {
        alert(`Insufficient balance for gas fees. You need at least ${formatEther(estimatedGasCost)} ETH. Your balance is ${formatEther(balance)} ETH.`);
        setIsLoading(false);
        return;
      }

      // Send the transaction with gas parameters
      console.log('Sending claim transaction with gas limit:', gasLimit.toString());
      const hash = await walletClient.writeContract({
        address: INSURANCE_CONTRACT_ADDRESS,
        abi: INSURANCE_CONTRACT_ABI,
        functionName: 'claim',
        args: [BigInt(selectedPolicy)],
        account: address as `0x${string}`,
        gas: gasLimit,
        maxFeePerGas: gasPrice * 2n, // 2x current gas price for faster inclusion
        maxPriorityFeePerGas: gasPrice / 10n, // Tip for miners
      });

      console.log('Transaction hash:', hash);
      setTxHash(hash);

      // Show success message with transaction hash immediately
      alert(`Claim transaction submitted! Hash: ${hash.slice(0, 10)}...${hash.slice(-8)}\n\nWaiting for confirmation...`);

      // Wait for transaction confirmation
      if (publicClient) {
        const receipt = await publicClient.waitForTransactionReceipt({ hash });

        if (receipt.status === 'success') {
          console.log('Claim transaction successful');
          alert('Claim confirmed! Compensation has been transferred to your wallet.');
          setClaimSubmitted(true);
        }
      }
    } catch (error: any) {
      console.error('Error submitting claim:', error);

      // Provide more specific error messages
      let errorMessage = 'Error submitting claim. ';

      if (error?.message?.includes('insufficient funds')) {
        errorMessage += 'Insufficient funds for gas fees. Please ensure you have enough ETH.';
      } else if (error?.message?.includes('user rejected') || error?.message?.includes('User denied')) {
        errorMessage += 'Transaction was cancelled.';
      } else if (error?.message?.includes('gas')) {
        errorMessage += 'Gas estimation failed. Please check your balance and try again.';
      } else if (error?.message?.includes('already claimed')) {
        errorMessage += 'This policy has already been claimed.';
      } else if (error?.message?.includes('not eligible')) {
        errorMessage += 'This policy is not eligible for a claim.';
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

  const selectedPolicyData = userPolicies.find(p => p.policyId === selectedPolicy);

  // Filter eligible policies (any policy marked as delayed can attempt to claim)
  // The smart contract will validate if there are actual claimable days
  const eligiblePolicies = userPolicies.filter(p => p.delayed);

  if (claimSubmitted) {
    return (
      <div className="p-8 max-w-3xl mx-auto">
        <div className="bg-white rounded-lg border border-gray-100 p-12 text-center">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircleIcon className="w-6 h-6 text-gray-900" />
          </div>
          <h2 className="text-xl font-medium text-gray-900 mb-2">Claim Submitted</h2>
          <p className="text-sm text-gray-600 mb-8 max-w-md mx-auto">
            Your claim has been processed on-chain. Compensation has been transferred to your wallet.
          </p>

          {selectedPolicyData && selectedPolicyData.claimableDays > 0 && (
            <div className="bg-gray-900 text-white rounded-lg p-6 mb-8">
              <p className="text-xs text-gray-400 mb-2">Total Compensation</p>
              <p className="text-3xl font-medium">
                {(parseFloat(contractPricing.payoutPerDay) * selectedPolicyData.claimableDays).toFixed(4)} Tokens
              </p>
              <p className="text-xs text-gray-400 mt-2">
                {selectedPolicyData.claimableDays} days × {contractPricing.payoutPerDay} Tokens/day
              </p>
            </div>
          )}

          <div className="space-y-3 mb-8 text-left bg-gray-50 rounded-lg p-6">
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Transaction</span>
              <a
                href={`https://sepolia.arbiscan.io/tx/${txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="font-mono text-gray-900 hover:underline"
              >
                {txHash.slice(0, 10)}...{txHash.slice(-8)}
              </a>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Policy ID</span>
              <span className="font-mono text-gray-900">#{selectedPolicy}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Status</span>
              <span className="px-2 py-0.5 bg-gray-200 text-gray-700 text-xs font-medium rounded">
                Completed
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-500">Network</span>
              <span className="text-gray-900">Arbitrum Sepolia</span>
            </div>
          </div>

          <button
            onClick={() => {
              setClaimSubmitted(false);
              setSelectedPolicy(null);
              setTxHash('');
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

      {!authenticated || !address ? (
        <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
          <p className="text-sm text-gray-600">
            Please connect your wallet to Arbitrum Sepolia to view and claim policies
          </p>
        </div>
      ) : null}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Claim Form */}
        <div className="lg:col-span-2 space-y-4">
          {/* Eligible Policies */}
          <div className="bg-white rounded-lg border border-gray-100 p-6">
            <h2 className="text-sm font-medium text-gray-900 mb-4">Eligible Policies</h2>

            {eligiblePolicies.length === 0 ? (
              <div className="text-center py-8">
                <ClockIcon className="w-8 h-8 text-gray-300 mx-auto mb-3" />
                <p className="text-sm text-gray-500">No policies eligible for claims</p>
                {userPolicies.length > 0 && (
                  <p className="text-xs text-gray-400 mt-2">
                    You have {userPolicies.length} {userPolicies.length === 1 ? 'policy' : 'policies'}.
                    Only policies marked as delayed can be claimed.
                  </p>
                )}
              </div>
            ) : (
              <div className="space-y-3">
                {eligiblePolicies.map((policy) => (
                  <button
                    key={policy.policyId}
                    onClick={() => setSelectedPolicy(policy.policyId)}
                    className={`w-full text-left p-4 border rounded-lg transition-colors ${
                      selectedPolicy === policy.policyId
                        ? 'border-gray-900 bg-gray-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-mono text-sm font-medium text-gray-900">
                            {policy.containerId}
                          </h3>
                          <span className="px-1.5 py-0.5 bg-gray-700 text-white text-xs font-medium rounded">
                            Delayed
                          </span>
                        </div>
                        <p className="text-xs text-gray-500">
                          Policy #{policy.policyId}
                        </p>
                      </div>
                      <div className="px-2 py-0.5 bg-gray-900 text-white text-xs font-medium rounded">
                        {policy.claimableDays > 0 ? `${policy.claimableDays}d claimable` : 'Claimable'}
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-3 pt-3 border-t border-gray-100">
                      <div>
                        <p className="text-xs text-gray-500">Expected</p>
                        <p className="text-xs font-medium text-gray-900 mt-0.5">
                          {policy.expectedArrival.toLocaleDateString()}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Daily</p>
                        <p className="text-xs font-medium text-gray-900 mt-0.5">
                          {contractPricing.payoutPerDay} Tokens
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-500">Total</p>
                        <p className="text-xs font-medium text-gray-900 mt-0.5">
                          {(parseFloat(contractPricing.payoutPerDay) * policy.claimableDays).toFixed(4)} Tokens
                        </p>
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Claim Details */}
          {selectedPolicyData && (
            <div className="bg-white rounded-lg border border-gray-100 p-6">
              <h2 className="text-sm font-medium text-gray-900 mb-4">Claim Details</h2>

              <form onSubmit={handleSubmitClaim} className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">Container</p>
                    <p className="font-mono text-sm text-gray-900 mt-0.5">
                      {selectedPolicyData.containerId}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">Policy ID</p>
                    <p className="text-sm text-gray-900 mt-0.5">
                      #{selectedPolicyData.policyId}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">Expected</p>
                    <p className="text-sm text-gray-900 mt-0.5">
                      {selectedPolicyData.expectedArrival.toLocaleDateString()}
                    </p>
                  </div>
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs text-gray-500">Claimable</p>
                    <p className="text-sm text-gray-900 mt-0.5">
                      {selectedPolicyData.claimableDays} days
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 border border-gray-200 rounded-lg">
                  <h3 className="text-sm font-medium text-gray-900 mb-3">Compensation</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">Daily rate</span>
                      <span className="text-gray-900">
                        {contractPricing.payoutPerDay} Tokens
                      </span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-600">Claimable days</span>
                      <span className="text-gray-900">
                        {selectedPolicyData.claimableDays > 0 ? selectedPolicyData.claimableDays : 'TBD by contract'}
                      </span>
                    </div>
                    <div className="pt-2 border-t border-gray-200 flex justify-between">
                      <span className="text-sm font-medium text-gray-900">Estimated Total</span>
                      <span className="text-lg font-medium text-gray-900">
                        {selectedPolicyData.claimableDays > 0
                          ? `${(parseFloat(contractPricing.payoutPerDay) * selectedPolicyData.claimableDays).toFixed(4)} Tokens`
                          : 'Calculated on claim'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-gray-50 border border-gray-200 rounded-lg">
                  <p className="text-xs text-gray-600">
                    Claims are processed instantly on-chain. Compensation will be transferred to your wallet.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isLoading || !authenticated || !address}
                  className={`w-full py-2.5 rounded-lg text-sm font-medium transition ${
                    !isLoading && authenticated && address
                      ? 'bg-gray-900 text-white hover:bg-gray-800'
                      : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  {isLoading
                    ? 'Processing...'
                    : selectedPolicyData.claimableDays > 0
                    ? `Submit Claim - ${(parseFloat(contractPricing.payoutPerDay) * selectedPolicyData.claimableDays).toFixed(4)} Tokens`
                    : 'Submit Claim'}
                </button>
              </form>
            </div>
          )}

          {!selectedPolicyData && eligiblePolicies.length > 0 && (
            <div className="bg-white rounded-lg border border-gray-100 p-12 text-center">
              <BanknotesIcon className="w-8 h-8 text-gray-300 mx-auto mb-3" />
              <h3 className="text-sm font-medium text-gray-900 mb-1">Select a Policy</h3>
              <p className="text-xs text-gray-500">
                Choose a policy to file a claim
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
                <span>Only delayed policies are eligible</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gray-900">•</span>
                <span>Automatic calculation based on delay</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gray-900">•</span>
                <span>{contractPricing.payoutPerDay} Tokens per day delayed</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gray-900">•</span>
                <span>Instant on-chain processing</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gray-900">•</span>
                <span>Direct wallet payment</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-gray-900">•</span>
                <span>Max {contractPricing.maxPayoutDays} days coverage</span>
              </li>
            </ul>
          </div>

          {/* All Policies */}
          <div className="bg-white rounded-lg border border-gray-100 p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Your Policies</h3>
            <div className="space-y-3">
              {userPolicies.length === 0 ? (
                <p className="text-xs text-gray-500">No policies found</p>
              ) : (
                userPolicies.map((policy) => (
                  <div key={policy.policyId} className="pb-3 border-b border-gray-50 last:border-0 last:pb-0">
                    <div className="flex items-start justify-between mb-1">
                      <p className="font-mono text-xs text-gray-900">
                        {policy.containerId}
                      </p>
                      <span className={`px-1.5 py-0.5 text-xs font-medium rounded ${
                        policy.delayed && policy.claimableDays > 0
                          ? 'bg-gray-900 text-white'
                          : policy.delayed
                          ? 'bg-gray-700 text-white'
                          : policy.delivered
                          ? 'bg-gray-100 text-gray-700'
                          : 'bg-gray-50 text-gray-600'
                      }`}>
                        {policy.delayed && policy.claimableDays > 0
                          ? 'Claimable'
                          : policy.delayed
                          ? 'Delayed'
                          : policy.delivered
                          ? 'Delivered'
                          : 'Active'}
                      </span>
                    </div>
                    <div className="text-xs text-gray-500">
                      <p>Policy #{policy.policyId} • {policy.expectedArrival.toLocaleDateString()}</p>
                      {policy.delayed && (
                        <p className="text-gray-900 mt-0.5">
                          {policy.claimableDays > 0 ? `${policy.claimableDays} days claimable` : 'Ready to claim'}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Contract Info */}
          <div className="bg-white rounded-lg border border-gray-100 p-4">
            <h3 className="text-sm font-medium text-gray-900 mb-3">Contract</h3>
            <div className="space-y-2 text-xs">
              <div>
                <p className="text-gray-600">Address</p>
                <p className="font-mono text-gray-900 break-all">
                  {INSURANCE_CONTRACT_ADDRESS.slice(0, 10)}...{INSURANCE_CONTRACT_ADDRESS.slice(-8)}
                </p>
              </div>
              <div>
                <p className="text-gray-600">Network</p>
                <p className="text-gray-900">Arbitrum Sepolia</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}