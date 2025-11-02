// Simulated ENS mappings for contracts
const ENS_MAPPINGS: { [key: string]: string } = {
  // Arbitrum Sepolia
  '0xDE5d818E49F12E1feB107F320276D84Cb544b767': 'arbitrum.encargoportocol.eth',
  '0x8420eEC4b6C5Df04D3bf8eA282aD2C8bE35858Cd': 'scroll.encargoportocol.eth',
  // Token contracts
  '0xd880112AeC1307eBE2886e4fB0daec82564f3a65': 'token-scroll.encargoportocol.eth',
};

/**
 * Get ENS name for an address (simulated)
 * @param address - The contract address
 * @returns ENS name if mapped, otherwise null
 */
export function getENSName(address: string): string | null {
  const normalizedAddress = address.toLowerCase();
  const ensName = Object.keys(ENS_MAPPINGS).find(
    key => key.toLowerCase() === normalizedAddress
  );
  return ensName ? ENS_MAPPINGS[ensName] : null;
}

/**
 * Display address with ENS name if available (simulated)
 * @param address - The contract address
 * @param showFull - Whether to show full address or shortened
 * @returns Formatted display string
 */
export function displayAddress(address: string, showFull: boolean = false): string {
  const ensName = getENSName(address);

  if (ensName) {
    return ensName;
  }

  if (showFull) {
    return address;
  }

  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

/**
 * Component to display address with optional ENS name
 */
export function formatAddressWithENS(address: string): {
  primary: string;
  secondary?: string;
} {
  const ensName = getENSName(address);

  if (ensName) {
    return {
      primary: ensName,
      secondary: `${address.slice(0, 10)}...${address.slice(-8)}`,
    };
  }

  return {
    primary: address,
  };
}
