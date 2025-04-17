import { and, eq } from "drizzle-orm";

import type { Database } from "../../db";
import { paymentLinks, payments } from "../../db/schema";
import type {
  insertPaymentLinkSchema,
  selectAppSchema,
  selectPaymentLinkSchema,
  selectPaymentSchema,
} from "../../db/zod";

export const createPaymentLink = (
  db: Database,
  value: Zod.infer<typeof insertPaymentLinkSchema>
) => db.insert(paymentLinks).values(value).returning().execute();

export const getPaymentLinkByAppAndId = (
  db: Database,
  app: Zod.infer<typeof selectAppSchema>["id"],
  id: Zod.infer<typeof selectPaymentSchema>["id"]
) =>
  db.query.paymentLinks
    .findFirst({
      where: and(eq(paymentLinks.id, id), eq(paymentLinks.app, app)),
    })
    .execute();

export const getPaymentLinksByApp = (
  db: Database,
  app: Zod.infer<typeof selectAppSchema>["id"]
) =>
  db.query.paymentLinks.findMany({
    where: eq(paymentLinks.app, app),
  }).execute();

export const updatePaymentLinkByAppAndId = async (
  db: Database,
  app: Zod.infer<typeof selectAppSchema>["id"],
  id: Zod.infer<typeof selectPaymentLinkSchema>["id"],
  value: Partial<Zod.infer<typeof insertPaymentLinkSchema>>
) =>
  db
    .update(paymentLinks)
    .set(value)
    .where(and(eq(paymentLinks.id, id), eq(paymentLinks.app, app)))
    .returning()
    .execute();

export const deletePaymentLinkByAppAndId = async (
  db: Database,
  app: Zod.infer<typeof selectAppSchema>["id"],
  id: Zod.infer<typeof selectPaymentSchema>["id"]
) =>
  db
    .delete(paymentLinks)
    .where(and(eq(paymentLinks.id, id), eq(paymentLinks.app, app)))
    .returning()
    .execute();
