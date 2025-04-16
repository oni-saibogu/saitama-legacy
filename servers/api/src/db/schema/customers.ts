import crypto from "crypto";
import { pgTable, text, timestamp, unique, uuid } from "drizzle-orm/pg-core";

import { apps } from "./apps";

export const customers = pgTable(
  "customers",
  {
    id: uuid().defaultRandom().primaryKey(),
    reference: text()
      .unique()
      .$defaultFn(() => crypto.randomUUID())
      .notNull(),
    app: uuid()
      .references(() => apps.id, { onDelete: "cascade" })
      .notNull(),
    email: text().unique().notNull(),
    createdAt: timestamp().defaultNow().notNull(),
    updatedAt: timestamp().defaultNow().notNull(),
  },
  (column) => ({
    uniqueCustomer: unique().on(column.app, column.reference),
  })
);
