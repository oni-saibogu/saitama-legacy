import {
  pgTable,
  text,
  uuid,
  timestamp,
  unique,
  boolean,
  json,
} from "drizzle-orm/pg-core";

import { apps } from "./apps";
import { chains } from "../../config";

export const wallets = pgTable(
  "wallets",
  {
    id: uuid().defaultRandom().primaryKey(),
    app: uuid()
      .references(() => apps.id, { onDelete: "cascade" })
      .notNull(),
    metadata: json(),
    address: text().notNull(),
    generated: boolean().default(false).notNull(),
    chain: text({ enum: chains }).notNull(),
    createdAt: timestamp().defaultNow().notNull(),
    updatedAt: timestamp().defaultNow().notNull(),
  },
  (column) => ({
    uniqueWallet: unique().on(column.app, column.address, column.chain),
  })
);
