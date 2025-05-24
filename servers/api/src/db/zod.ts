import { object, string } from "zod";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";

import {
  apiKeys,
  apps,
  coins,
  customers,
  networks,
  paymentLinks,
  payments,
  users,
  wallets,
  webhooks,
} from "./schema";
import { bigInt } from "./zod-custom-type";

export const insertUserSchema = createInsertSchema(users, {
  email: (column) => column.email(),
}).omit({ id: true, createdAt: true, updatedAt: true });
export const selectUserSchema = createSelectSchema(users);

export const insertAppSchema = createInsertSchema(apps, {
  logo: (column) => column.url(),
}).omit({ id: true, createdAt: true, updatedAt: true });
export const selectAppSchema = createSelectSchema(apps);

export const selectApiKeySchema = createSelectSchema(apiKeys);
export const insertApiKeySchema = createInsertSchema(apiKeys).omit({
  id: true,
  publicKey: true,
  secretKey: true,
  createdAt: true,
});

export const selectWalletSchema = createSelectSchema(wallets);
export const insertWalletSchema = createInsertSchema(wallets).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
export const insertWebhookSchema = createInsertSchema(webhooks, {
  url: (column) => column.url(),
}).omit({ id: true, createdAt: true });
export const selectWebhookSchema = createSelectSchema(webhooks);

export const selectPaymentSchema = createSelectSchema(payments, {
  amount: bigInt(),
});
export const insertPaymentSchema = createInsertSchema(payments, {
  metadata: object({}),
  amount: bigInt(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const priceSchema = object({
  amount: string(),
  currency: string(),
});
export const selectPaymentLinkSchema = createSelectSchema(paymentLinks, {
  price: priceSchema,
});
export const insertPaymentLinkSchema = createInsertSchema(paymentLinks, {
  price: priceSchema,
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const selectCustomerSchema = createSelectSchema(customers);
export const insertCustomerSchema = createInsertSchema(customers, {
  email: (column) => column.email(),
}).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const selectCoinSchema = createSelectSchema(coins);
export const insertCoinSchema = createInsertSchema(coins).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const selectNetworkSchema = createSelectSchema(networks);
export const insertNetworkSchema = createInsertSchema(networks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});
