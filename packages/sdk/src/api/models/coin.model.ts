export type Coin = {
  id: string;
  mint?: string;
  name: string;
  logo: string;
  decimals: number;
  chain: "solana" | "ethereum" | "tron";
  creator?: string;
  createdAt: string;
  updatedAt: string;
};
