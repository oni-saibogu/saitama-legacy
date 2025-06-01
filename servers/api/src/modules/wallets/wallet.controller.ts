import type { z } from "zod";
import { and, eq } from "drizzle-orm";

import type { Database } from "../../db";
import { wallets } from "../../db/schema";
import type {
  insertWalletSchema,
  selectAppSchema,
  selectWalletSchema,
} from "../../db/zod";

export const createWallet = (
  db: Database,
  value: z.infer<typeof insertWalletSchema>
) =>
  db
    .insert(wallets)
    .values(value)
    .returning()
    .onConflictDoUpdate({
      target: [wallets.app, wallets.customer, wallets.network, wallets.address],
      set: value,
    })
    .execute();

export const getWalletsByApp = (
  db: Database,
  app: z.infer<typeof selectAppSchema>["id"]
) =>
  db.query.wallets
    .findMany({
      where: eq(wallets.app, app),
    })
    .execute();

export const updateWalletByAppAndId = (
  db: Database,
  app: z.infer<typeof selectAppSchema>["id"],
  id: z.infer<typeof selectWalletSchema>["id"],
  value: Partial<z.infer<typeof insertWalletSchema>>
) =>
  db
    .update(wallets)
    .set(value)
    .where(
      and(
        eq(wallets.id, id),
        eq(wallets.app, app),
        eq(wallets.generated, false)
      )
    )
    .returning()
    .execute();

export const deleteWalletByAppAndId = (
  db: Database,
  app: z.infer<typeof selectAppSchema>["id"],
  id: z.infer<typeof selectWalletSchema>["id"]
) =>
  db
    .delete(wallets)
    .where(
      and(
        eq(wallets.id, id),
        eq(wallets.app, app),
        eq(wallets.generated, false)
      )
    )
    .returning()
    .execute();
