import { createConfig } from "@privy-io/wagmi";
import { scrollSepolia, arbitrumSepolia } from "viem/chains";
import { http } from "wagmi";

export const wagmiConfig = createConfig({
  chains: [scrollSepolia, arbitrumSepolia],
  transports: {
    [scrollSepolia.id]: http(),
    [arbitrumSepolia.id]: http(),
  },
});

