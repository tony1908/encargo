# Multi-Network Support Setup

This document explains how the multi-network support has been implemented and how to use it across the application.

## Overview

The application now supports multiple networks (Arbitrum Sepolia and Scroll Sepolia) with automatic contract address switching based on the selected network.

## Changes Made

### 1. Contract Configuration (`src/contracts/InsuranceContract.ts`)

Added network-specific configuration:

```typescript
export const NETWORK_CONFIG = {
  [arbitrumSepolia.id]: {
    name: 'Arbitrum Sepolia',
    insuranceContract: '0xDE5d818E49F12E1feB107F320276D84Cb544b767',
    tokenContract: '0x8420eEC4b6C5Df04D3bf8eA282aD2C8bE35858Cd',
    explorer: 'https://sepolia.arbiscan.io',
  },
  [scrollSepolia.id]: {
    name: 'Scroll Sepolia',
    insuranceContract: '0xYourScrollContractAddress', // UPDATE THIS
    tokenContract: '0xYourScrollTokenAddress', // UPDATE THIS
    explorer: 'https://sepolia.scrollscan.com',
  },
};
```

**⚠️ IMPORTANT**: Update the Scroll Sepolia contract addresses with your actual deployed addresses!

### 2. Custom Hook (`src/hooks/useContractAddresses.ts`)

Created a hook to get contract addresses based on the current network:

```typescript
export function useContractAddresses() {
  const chainId = useChainId();
  const config = getContractAddresses(chainId);

  return {
    insuranceContract: config.insuranceContract,
    tokenContract: config.tokenContract,
    explorer: config.explorer,
    networkName: config.name,
    chainId: chainId,
  };
}
```

### 3. Network Switcher Component (`src/components/NetworkSwitcher.tsx`)

A dropdown component in the sidebar that allows users to switch between networks. Automatically uses Privy's wallet to switch chains.

### 4. Sidebar Integration

The Network Switcher is added to the sidebar (visible when expanded) above the Help and Logout buttons.

## How to Update Existing Pages

All pages that interact with smart contracts need to be updated. Here's the pattern:

### Before (Old Pattern):

```typescript
import { INSURANCE_CONTRACT_ADDRESS, TOKEN_ADDRESS } from '@/contracts/InsuranceContract';
import { arbitrumSepolia } from 'viem/chains';

export default function SomePage() {
  const { data: walletClient } = useWalletClient({ chainId: arbitrumSepolia.id });
  const publicClient = usePublicClient({ chainId: arbitrumSepolia.id });

  // Hardcoded addresses
  await wallet.switchChain(arbitrumSepolia.id);
  // Use INSURANCE_CONTRACT_ADDRESS directly
}
```

### After (New Pattern):

```typescript
import { INSURANCE_CONTRACT_ABI, ERC20_ABI } from '@/contracts/InsuranceContract';
import { useContractAddresses } from '@/hooks/useContractAddresses';
import { useChainId } from 'wagmi';

export default function SomePage() {
  const chainId = useChainId();
  const { data: walletClient } = useWalletClient({ chainId });
  const publicClient = usePublicClient({ chainId });

  // Get dynamic addresses
  const {
    insuranceContract: INSURANCE_CONTRACT_ADDRESS,
    tokenContract: TOKEN_ADDRESS,
    explorer,
    networkName,
  } = useContractAddresses();

  // Use dynamic chain ID
  await wallet.switchChain(chainId);
  console.log(`Switching to ${networkName}...`);
}
```

## Pages That Need Updating

The following pages need to be updated to use the new pattern:

- ✅ `/src/app/dashboard/buy/page.tsx` - **UPDATED (Example)**
- ⏳ `/src/app/dashboard/claim/page.tsx` - TODO
- ⏳ `/src/app/dashboard/status/page.tsx` - TODO
- ⏳ `/src/app/dashboard/track/page.tsx` - TODO
- ⏳ `/src/app/dashboard/page.tsx` - TODO

## Steps to Update Each Page

1. **Import the hook**:
   ```typescript
   import { useContractAddresses } from '@/hooks/useContractAddresses';
   import { useChainId } from 'wagmi';
   ```

2. **Remove hardcoded imports**:
   ```typescript
   // REMOVE:
   import { INSURANCE_CONTRACT_ADDRESS, TOKEN_ADDRESS } from '@/contracts/InsuranceContract';
   import { arbitrumSepolia } from 'viem/chains';
   ```

3. **Use the hook**:
   ```typescript
   const chainId = useChainId();
   const { insuranceContract: INSURANCE_CONTRACT_ADDRESS, tokenContract: TOKEN_ADDRESS, explorer, networkName } = useContractAddresses();
   ```

4. **Update wallet/public clients**:
   ```typescript
   // BEFORE:
   const { data: walletClient } = useWalletClient({ chainId: arbitrumSepolia.id });

   // AFTER:
   const { data: walletClient } = useWalletClient({ chainId });
   ```

5. **Update chain switching**:
   ```typescript
   // BEFORE:
   await wallet.switchChain(arbitrumSepolia.id);

   // AFTER:
   await wallet.switchChain(chainId);
   ```

6. **Update explorer URLs**:
   ```typescript
   // BEFORE:
   href={`https://sepolia.arbiscan.io/tx/${txHash}`}

   // AFTER:
   href={`${explorer}/tx/${txHash}`}
   ```

## Testing

After updating all pages:

1. **Test network switching**: Click the network switcher in the sidebar and switch between networks
2. **Verify contract interactions**: Ensure transactions work on both networks
3. **Check explorer links**: Verify transaction links open the correct block explorer
4. **Test wallet switching**: Ensure Privy properly switches the wallet to the selected chain

## Configuration

To add a new network:

1. Add the chain to `wagmi.ts`:
   ```typescript
   import { newChain } from 'viem/chains';

   export const wagmiConfig = createConfig({
     chains: [scrollSepolia, arbitrumSepolia, newChain],
     // ...
   });
   ```

2. Add network config to `InsuranceContract.ts`:
   ```typescript
   [newChain.id]: {
     name: 'New Chain',
     insuranceContract: '0x...',
     tokenContract: '0x...',
     explorer: 'https://...',
   },
   ```

3. Update `NetworkSwitcher.tsx` to include the new network in the dropdown

## Notes

- The hook automatically falls back to Arbitrum Sepolia if the current chain is not configured
- Contract ABIs are shared across all networks (same contract code, different addresses)
- The network switcher only appears when the sidebar is expanded
- All network switches are handled through Privy's wallet interface
