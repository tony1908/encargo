import { useChainId } from 'wagmi';
import { getContractAddresses, NETWORK_CONFIG } from '@/contracts/InsuranceContract';
import { arbitrumSepolia } from 'viem/chains';

export function useContractAddresses() {
  const chainId = useChainId();

  // Get config for current chain, or default to Arbitrum Sepolia
  const config = getContractAddresses(chainId);

  return {
    insuranceContract: config.insuranceContract as `0x${string}`,
    tokenContract: config.tokenContract as `0x${string}`,
    explorer: config.explorer,
    networkName: config.name,
    chainId: chainId,
  };
}
