export type Wallet<T extends object = object> = {
  id: string;
  app: string;
  metadata?: T;
  address: string;
  generated: boolean;
  createdAt: string;
  updatedAt: string;
  chain: "solana" | "ethereum" | "tron";
};
