import { createInsertSchema, createSelectSchema } from "drizzle-zod";

import {
  apiKeys,
  apps,
  customers,
  paymentLinks,
  payments,
  users,
  wallets,
  webhooks,
} from "./schema";
import { object, string } from "zod";

export const insertUserSchema = createInsertSchema(users, {
  email: (column) => column.email(),
});
export const selectUserSchema = createSelectSchema(users);
export const selectUserByIdSchema = selectUserSchema.pick({ id: true });

export const insertAppSchema = createInsertSchema(apps, {
  logo: (column) => column.url(),
});
export const selectAppSchema = createSelectSchema(apps);
export const selectAppByIdSchema = selectAppSchema.pick({ id: true });

export const selectApiKeySchema = createSelectSchema(apiKeys);
export const insertApiKeySchema = createInsertSchema(apiKeys).omit({
  id: true,
  publicKey: true,
  secretKey: true,
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
export const selectWebhookById = selectWebhookSchema.pick({ id: true });

export const insertPaymentSchema = createInsertSchema(payments).omit({
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
});

export const selectCustomerSchema = createSelectSchema(customers);
export const selectCustomerById = selectCustomerSchema.pick({ id: true });
export const insertCustomerSchema = createInsertSchema(customers, {
  email: (column) => column.email(),
}).omit({
  id: true,
  createdAt: true,
});

export const selectPaymentSchema = createSelectSchema(payments);
export const selectPaymentById = selectPaymentSchema.pick({ id: true });
