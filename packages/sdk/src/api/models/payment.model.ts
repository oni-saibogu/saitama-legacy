import type { Wallet } from "./wallet.model";
import type { Customer } from "./customer.model";
import type { PaymentLink } from "./paymentLink.model";

export type Payment<T extends object = object> = {
  id: string;
  amount: string;
  metadata?: T;
  mint?: string;
  wallet: Wallet;
  customer: Customer;
  createdAt: string;
  updatedAt: string;
  signature?: string;
  paymentLink: PaymentLink;
  status: "pending" | "success" | "failed";
};
