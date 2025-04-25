import { and, eq, inArray, SQL } from "drizzle-orm";

import type { Database } from "../../db";
import { paymentLinks, payments } from "../../db/schema";
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
  return db.query.payments.findMany({
    with: {
      paymentLink: true,
      wallet: {
        columns: {
          address: true,
        },
      },
      coin: {
        with: {
          network: {
            columns: {
              name: true,
            },
          },
        },
        columns: {
          name: true,
          ticker: true,
        },
      },
    },
    columns: {
      id: true,
      createdAt: true,
      updatedAt: true,
    },
    where: and(
      where,
      inArray(
        payments.paymentLink,
        db
          .select({ id: paymentLinks.id })
          .from(paymentLinks)
          .where(eq(paymentLinks.app, app))
      )
    ),
  });
};

export const getPaymentByAppAndId = (
  db: Database,
  app: Zod.infer<typeof selectAppSchema>["id"],
  id: Zod.infer<typeof selectPaymentSchema>["id"]
) => {
  return db.query.payments.findFirst({
    with: {
      paymentLink: true,
      wallet: {
        columns: {
          address: true,
        },
      },
      coin: {
        with: {
          network: {
            columns: {
              id: true,
              name: true,
            },
          },
        },
        columns: {
          name: true,
          ticker: true,
        },
      },
      customer: {
        columns: {
          id: true,
          email: true,
        },
      },
    },
    columns: {
      id: true,
      createdAt: true,
      updatedAt: true,
    },
    where: and(
      eq(payments.id, id),
      inArray(
        payments.paymentLink,
        db
          .select({ id: paymentLinks.id })
          .from(paymentLinks)
          .where(eq(paymentLinks.app, app))
      )
    ),
  });
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
