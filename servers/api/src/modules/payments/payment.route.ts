import assert from "assert";
import passport from "@fastify/passport";
import { type z, array, object } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import type { FastifyInstance, FastifyRequest } from "fastify";

import { format } from "../../core";
import { db } from "../../instances";
import { RequestError } from "../../error";
import { withUserGuard } from "../../guards";
import {
  createPayment,
  getPaymentByAppAndId,
  getPaymentsByAppWhere,
  updatePaymentByAppAndId,
} from "./payment.controller";
import {
  insertPaymentSchema,
  selectCoinSchema,
  selectCustomerSchema,
  selectNetworkSchema,
  selectPaymentLinkSchema,
  selectPaymentSchema,
  selectWalletSchema,
} from "../../db/zod";

const createPaymentRoute = (
  request: FastifyRequest<{ Body: z.infer<typeof insertPaymentSchema> }>
) =>
  insertPaymentSchema.parseAsync(request.body).then(async (body) => {
    const [payment] = await createPayment(db, body);
    return payment;
  });

const getPaymentsRoute = withUserGuard((user) =>
  getPaymentsByAppWhere(db, user.app.id)
);

const getPaymentRoute = (
  request: FastifyRequest<{
    Params: Pick<z.infer<typeof selectPaymentSchema>, "id">;
  }>
) =>
  withUserGuard((user) =>
    selectPaymentSchema
      .pick({ id: true })
      .parseAsync(request.params)
      .then(async ({ id }) => {
        const payment = await getPaymentByAppAndId(db, user.app.id, id);
        if (payment) return payment;

        throw new RequestError(404, format("payment with id=% not found", id));
      })
  );

const updatePaymentRoute = (
  request: FastifyRequest<{
    Params: Pick<z.infer<typeof selectPaymentSchema>, "id">;
    Body: Partial<z.infer<typeof insertPaymentSchema>>;
  }>
) =>
  withUserGuard((user) =>
    selectPaymentSchema
      .pick({ id: true })
      .parseAsync(request.params)
      .then(({ id }) =>
        insertPaymentSchema
          .pick({ amount: true, coin: true, wallet: true })
          .partial()
          .parseAsync(request.body)
          .then(async (body) => {
            assert(
              body.coin ? body.wallet : body.wallet ? body.coin : true,
              new RequestError(
                404,
                "if changing coin or wallet, both coin and wallet is required."
              )
            );
            const payments = await updatePaymentByAppAndId(
              db,
              user.app!.id,
              id,
              body
            );
            if (payments) {
              const [payment] = payments;
              if (payment) return payment;
            }

            throw new RequestError(
              404,
              format("payment with id=% not found", id)
            );
          })
      )
  );

export default function registerPaymentkoutes(fastify: FastifyInstance) {
  fastify
    .route({
      method: "POST",
      url: "/",
      handler: RequestError.handler(createPaymentRoute),
      preHandler: passport.authenticate(["jwt", "apiKey"]),
      schema: {
        body: zodToJsonSchema(insertPaymentSchema),
        response: {
          201: zodToJsonSchema(selectPaymentSchema),
        },
      },
    })
    .route({
      method: "GET",
      url: "/",
      handler: RequestError.handler(getPaymentsRoute),
      preHandler: passport.authenticate(["jwt", "apiKey"]),
      schema: {
        response: {
          200: zodToJsonSchema(
            array(
              selectPaymentSchema
                .pick({
                  id: true,
                  createdAt: true,
                  updatedAt: true,
                  amount: true,
                })
                .and(
                  object({
                    paymentLink: selectPaymentLinkSchema,
                    wallet: selectWalletSchema.pick({
                      id: true,
                      address: true,
                    }),
                    coin: selectCoinSchema
                      .pick({
                        id: true,
                        name: true,
                        ticker: true,
                        decimals: true,
                      })
                      .and(
                        object({
                          network: selectNetworkSchema.pick({
                            id: true,
                            name: true,
                          }),
                        })
                      ),
                    customer: selectCustomerSchema.pick({
                      id: true,
                      email: true,
                    }),
                  })
                )
            )
          ),
        },
      },
    })
    .route({
      method: "GET",
      url: "/:id/",
      handler: RequestError.handler(getPaymentRoute),
      preHandler: passport.authenticate(["jwt", "apiKey"]),
      schema: {
        params: zodToJsonSchema(selectPaymentSchema.pick({ id: true })),
        response: {
          200: zodToJsonSchema(
            selectPaymentSchema
              .pick({
                id: true,
                createdAt: true,
                updatedAt: true,
                amount: true,
              })
              .and(
                object({
                  paymentLink: selectPaymentLinkSchema,
                  wallet: selectWalletSchema.pick({ id: true, address: true }),
                  coin: selectCoinSchema
                    .pick({
                      id: true,
                      name: true,
                      ticker: true,
                      decimals: true,
                    })
                    .and(
                      object({
                        network: selectNetworkSchema.pick({
                          id: true,
                          name: true,
                        }),
                      })
                    ),
                  customer: selectCustomerSchema.pick({
                    id: true,
                    email: true,
                  }),
                })
              )
          ),
        },
      },
    })
    .route({
      method: "PATCH",
      url: "/:id/",
      handler: RequestError.handler(updatePaymentRoute),
      preHandler: passport.authenticate(["jwt", "apiKey"]),
      schema: {
        params: zodToJsonSchema(selectPaymentSchema.pick({ id: true })),
        response: {
          201: zodToJsonSchema(selectPaymentSchema),
        },
      },
    });
}
