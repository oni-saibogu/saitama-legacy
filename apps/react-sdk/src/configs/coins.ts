import {
  TokenETH,
  TokenUSDT,
  TokenUSDC,
  TokenSOL,
  IconComponent,
  TokenDIA,
  TokenPYUSD,
  TokenSWETH,
} from "@web3icons/react";

export type Coin = {
  [key: string]: { name: string; icon: IconComponent; data?: string }[];
};

export const coins: Coin = {
  ethereum: [
    { name: "DAI", icon: TokenDIA },
    { name: "ETH", icon: TokenETH },
    { name: "PYUSD", icon: TokenPYUSD },
    { name: "WETH", icon: TokenSWETH },
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
};
