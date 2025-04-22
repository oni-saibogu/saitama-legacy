import { and, eq, getTableColumns, SQL } from "drizzle-orm";

import type { Database } from "../../db";
import { paymentLinks, payments, wallets } from "../../db/schema";
import type {
  insertPaymentSchema,
  selectAppSchema,
  selectPaymentSchema,
} from "../../db/zod";

export const createPayment = (
  db: Database,
  value: Zod.infer<typeof insertPaymentSchema>
) => db.insert(payments).values(value).returning().execute();

export const getPaymentsByAppWhere = (
  db: Database,
  app: Zod.infer<typeof selectAppSchema>["id"],
  where?: SQL<unknown>
) => {
  return db
    .select({
      ...getTableColumns(payments),
      paymentLink: getTableColumns(paymentLinks),
    })
    .from(payments)
    .where(where)
    .innerJoin(
      paymentLinks,
      and(eq(paymentLinks.app, app), eq(paymentLinks.id, payments.paymentLink))
    )
    .execute();
};

export const getPaymentByAppAndId = (
  db: Database,
  app: Zod.infer<typeof selectAppSchema>["id"],
  id: Zod.infer<typeof selectPaymentSchema>["id"]
) => {
  return db
    .select({
      ...getTableColumns(payments),
      wallet: getTableColumns(wallets),
      paymentLink: getTableColumns(paymentLinks),
    })
    .from(payments)
    .where(eq(payments.id, id))
    .innerJoin(
      paymentLinks,
      and(eq(paymentLinks.app, app), eq(paymentLinks.id, payments.paymentLink))
    )
    .innerJoin(
      wallets,
      and(eq(wallets.app, app), eq(wallets.id, payments.wallet))
    )
    .execute();
};

export const updatePaymentByAppAndId = async (
  db: Database,
  app: Zod.infer<typeof selectAppSchema>["id"],
  id: Zod.infer<typeof selectPaymentSchema>["id"],
  value: Partial<Zod.infer<typeof insertPaymentSchema>>
) => {
  const [payment] = await db
    .select({ id: payments.id })
    .from(payments)
    .where(eq(payments.id, id))
    .innerJoin(
      paymentLinks,
      and(eq(paymentLinks.app, app), eq(paymentLinks.id, payments.paymentLink))
    )
    .execute();

  if (payment)
    return db
      .update(payments)
      .set(value)
      .where(eq(payments.id, payment.id))
      .returning()
      .execute();

  return null;
};

export const deletePaymentByPaymentLinkAndId = async (
  db: Database,
  app: Zod.infer<typeof selectAppSchema>["id"],
  id: Zod.infer<typeof selectPaymentSchema>["id"]
) => {
  const [payment] = await db
    .select({ id: payments.id })
    .from(payments)
    .where(eq(payments.id, id))
    .innerJoin(
      paymentLinks,
      and(eq(paymentLinks.app, app), eq(paymentLinks.id, payments.paymentLink))
    )
    .execute();

  if (payment)
    return db
      .delete(payments)
      .where(eq(payments.id, payment.id))
      .returning()
      .execute();

  return null;
};
