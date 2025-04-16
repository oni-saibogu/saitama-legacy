import crypto from "crypto";
import { json, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";

import { wallets } from "./wallets";
import { customers } from "./customers";
import { paymentLinks } from "./paymentLinks";

const generatePaymentId = () => "PAY-" + crypto.randomBytes(8).toString("hex");

export const payments = pgTable("payments", {
  id: text().$defaultFn(generatePaymentId).primaryKey(),
  amount: text().notNull(),
  mint: text(),
  signature: text().unique("signature", { nulls: "not distinct" }),
  paymentLink: uuid()
    .references(() => paymentLinks.id, { onDelete: "cascade" })
    .notNull(),
  customer: uuid()
    .references(() => customers.id, { onDelete: "cascade" })
    .notNull(),
  wallet: uuid()
    .references(() => wallets.id, { onDelete: "cascade" })
    .notNull(),
  status: text({ enum: ["pending", "success", "failed"] })
    .default("pending")
    .notNull(),
  metadata: json().default(null),
  createdAt: timestamp().defaultNow().notNull(),
  updatedAt: timestamp().defaultNow().notNull(),
});
