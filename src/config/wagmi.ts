import { createConfig } from "@privy-io/wagmi";
import { baseSepolia, scrollSepolia, arbitrumSepolia } from "viem/chains";
import { http } from "wagmi";

export const wagmiConfig = createConfig({
  chains: [scrollSepolia, baseSepolia, arbitrumSepolia],
  transports: {
    [scrollSepolia.id]: http(),
    [baseSepolia.id]: http(),
    [arbitrumSepolia.id]: http(),
  },
});

