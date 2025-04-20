import {
  TokenETH,
  TokenUSDT,
  TokenUSDC,
  TokenSOL,
  TokenDIA,
  TokenPYUSD,
  TokenSWETH,
  TokenMATIC,
  TokenBNB,
  TokenAVAX,
  TokenFTM,
  TokenCELO,
  TokenSUI,
  TokenAPT,
  TokenNEAR,
  TokenOSMO,
  IconComponent,
} from "@web3icons/react";

export type Coin = {
  [key: string]: { name: string; icon: IconComponent; data?: string }[];
};

export const coins: Coin = {
  "arbitrum-one": [
    { name: "ETH", icon: TokenETH },
    { name: "USDT", icon: TokenUSDT },
    { name: "USDC", icon: TokenUSDC },
  ],
  base: [
    { name: "ETH", icon: TokenETH },
    { name: "USDC", icon: TokenUSDC },
  ],
  "binance-smart-chain": [
    { name: "BNB", icon: TokenBNB },
    { name: "USDT", icon: TokenUSDT },
    { name: "USDC", icon: TokenUSDC },
    { name: "ETH", icon: TokenETH },
    { name: "DAI", icon: TokenDIA },
  ],
  ethereum: [
    { name: "ETH", icon: TokenETH },
    { name: "DAI", icon: TokenDIA },
    { name: "PYUSD", icon: TokenPYUSD },
    { name: "WETH", icon: TokenSWETH },
    { name: "USDT", icon: TokenUSDT },
    { name: "USDC", icon: TokenUSDC },
  ],
  optimism: [
    { name: "ETH", icon: TokenETH },
    { name: "USDT", icon: TokenUSDT },
    { name: "USDC", icon: TokenUSDC },
  ],
  polygon: [
    { name: "MATIC", icon: TokenMATIC },
    { name: "USDT", icon: TokenUSDT },
    { name: "USDC", icon: TokenUSDC },
  ],
  avalanche: [
    { name: "AVAX", icon: TokenAVAX },
    { name: "USDT", icon: TokenUSDT },
    { name: "USDC", icon: TokenUSDC },
  ],
  fantom: [
    { name: "FTM", icon: TokenFTM },
    { name: "USDT", icon: TokenUSDT },
    { name: "USDC", icon: TokenUSDC },
  ],
  celo: [
    { name: "CELO", icon: TokenCELO },
    { name: "USDT", icon: TokenUSDT },
    { name: "USDC", icon: TokenUSDC },
  ],
  solana: [
    { name: "SOL", icon: TokenSOL },
    { name: "USDT", icon: TokenUSDT },
    { name: "USDC", icon: TokenUSDC },
  ],
  tron: [
    { name: "USDT", icon: TokenUSDT },
    { name: "USDC", icon: TokenUSDC },
  ],
  sui: [
    { name: "SUI", icon: TokenSUI },
    { name: "USDC", icon: TokenUSDC },
  ],
  aptos: [
    { name: "APT", icon: TokenAPT },
    { name: "USDC", icon: TokenUSDC },
  ],
  near: [
    { name: "NEAR", icon: TokenNEAR },
    { name: "USDT", icon: TokenUSDT },
    { name: "USDC", icon: TokenUSDC },
  ],
  osmosis: [{ name: "OSMO", icon: TokenOSMO }],
};
