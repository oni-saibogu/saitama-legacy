export type PaymentLink = {
  id: string;
  name: string;
  app: string;
  description?: string;
  price: {
    amount: string;
    currency: "USD" | "EUR";
  };
  chains: ("solana" | "ethereum" | "tron")[];
  createdAt: string;
  updatedAt: string;
};
