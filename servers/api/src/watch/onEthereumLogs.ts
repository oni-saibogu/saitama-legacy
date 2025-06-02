import type { z } from "zod";
import { desc, eq, and, getTableColumns } from "drizzle-orm";

import { format } from "../core";
import { db, fastify, viem } from "../instances";
import type { insertPaymentSchema } from "../db/zod";
import { apps, coins, paymentLinks, payments, wallets } from "../db/schema";

const unsubscribeERC20 = viem.watchEvent({
  event: {
    type: "event",
    name: "Transfer",
    inputs: [
      { type: "address", indexed: true, name: "from" },
      { type: "address", indexed: true, name: "to" },
      { type: "uint256", indexed: false, name: "value" },
    ],
  },
  onLogs: async (logs) => {
    return Promise.all(
      logs.map(async (log) => {
        if (log.args.from && log.args.to && log.args.value) {
          console.log(
            "[transaction.processing] signature=",
            log.transactionHash
          );

          const { to, value } = log.args;

          const wallet = await db.query.wallets
            .findFirst({
              where: eq(wallets.address, to),
            })
            .execute();
          const coin = await db.query.coins.findFirst({
            where: eq(coins.mint, log.address),
          });

          if (wallet && coin) {
            console.log(
              "[transaction.validation.initialized]",
              format("wallet=%, coin=%", wallet.id, coin.id)
            );

            const [payment] = await db
              .select({
                ...getTableColumns(payments),
                app: {
                  id: apps.id,
                },
                paymentLink: {
                  id: paymentLinks.id,
                  app: paymentLinks.app,
                },
              })
              .from(payments)
              .innerJoin(
                paymentLinks,
                eq(paymentLinks.id, payments.paymentLink)
              )
              .innerJoin(apps, eq(apps.id, paymentLinks.app))
              .orderBy(desc(payments.createdAt))
              .where(
                and(eq(payments.wallet, wallet.id), eq(payments.coin, coin.id))
              )
              .execute();

            if (payment) {
              console.log("[transaction.validating] payment=", payment.id);

              const data: Partial<z.infer<typeof insertPaymentSchema>> = {};

              if (value >= payment.amount) data.status = "success";
              else {
                data.status = "failed";
                const error = format(
                  "Expected % amount but got %",
                  payment.amount.toString(),
                  value.toString()
                );
                data.metadata = {
                  ...payment.metadata,
                  error,
                };
                console.error(
                  "[transaction.amount.invalid]",
                  format("reason=% signature=%", error, log.transactionHash)
                );
              }

              data.signature = log.transactionHash;

              const [updatedPayment] = await db
                .update(payments)
                .set(data)
                .where(eq(payments.id, payment.id))
                .returning()
                .execute();

              return fastify.io.to(payment.id).emit("payments", updatedPayment);
            }

            console.error(
              "[transaction.payment.notFound] reason=payment can't be found. signature=%",
              log.transactionHash
            );
          }

          console.error(
            "[transaction.wallet.notFound] reason=wallet and coin can't be found. signature=",
            log.transactionHash
          );
        }
      })
    );
  },
});

const unsubscribeNative = viem.watchBlocks({
  onBlock: async (block) => {
    return Promise.all(
      block.transactions.map((transaction) =>
        viem.getTransaction({ hash: transaction })
      )
    ).then((transactions) =>
      transactions.map(async (transaction) => {
        const { to, value } = transaction;
        if (to) {
          const wallet = await db.query.wallets
            .findFirst({
              where: eq(wallets.address, to),
            })
            .execute();
          if (wallet) {
            console.log(
              "[transaction.validation.initialized] wallet=",
              wallet.id
            );

            const payment = await db.query.payments
              .findFirst({
                where: eq(payments.wallet, wallet.id),
                orderBy: desc(payments.createdAt),
              })
              .execute();

            if (payment) {
              console.log("[transaction.validating] payment=", payment.id);
              const data: Partial<z.infer<typeof insertPaymentSchema>> = {};

              if (value >= payment.amount) data.status = "success";
              else {
                data.status = "failed";
                const error = format(
                  "Expected % amount but got %",
                  payment.amount.toString(),
                  value.toString()
                );
                data.metadata = {
                  ...payment.metadata,
                  error,
                };
                console.error(
                  "[transaction.amount.invalid]",
                  format("reason=% signature=%", error, transaction.hash)
                );
              }

              data.signature = transaction.hash;

              const [updatedPayment] = await db
                .update(payments)
                .set(data)
                .where(eq(payments.id, payment.id))
                .returning()
                .execute();

              return fastify.io.to(payment.id).emit("payments", updatedPayment);
            }

            console.error(
              "[transaction.payment.notFound] reason=payment can't be found. signature=%",
              transaction.hash
            );
          }

          console.error(
            "[transaction.wallet.notFound] reason=wallet and coin can't be found. signature=",
            transaction.hash
          );
        }
      })
    );
  },
});

const unsubscribe = () =>
  Promise.allSettled([unsubscribeERC20(), unsubscribeNative()]);

process.on("SIGINT", unsubscribe);
process.on("SIGTERM", unsubscribe);
