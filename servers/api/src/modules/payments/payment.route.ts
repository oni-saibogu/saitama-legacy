import assert from "assert";
import passport from "@fastify/passport";
import { type z, array, object } from "zod";
import { zodToJsonSchema } from "zod-to-json-schema";
import type { FastifyInstance, FastifyRequest } from "fastify";

import { format } from "../../core";
import { db } from "../../instances";
import { RequestError } from "../../error";
import { withUserGuard } from "../../guards";
import { string } from "../../db/zod-custom-type";
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
  selectWalletSchema1,
} from "../../db/zod";

// instead of getting amount quote here do it on client
const createPaymentRoute = (
  request: FastifyRequest<{ Body: z.infer<typeof insertPaymentSchema> }>
) =>
  insertPaymentSchema.parseAsync(request.body).then(async (body) => {
    const payment = await createPayment(db, body);
    return getSharedSchema.parseAsync(payment);
  });

const getPaymentsRoute = withUserGuard(async (user) =>
  array(getSharedSchema).parseAsync(
    await getPaymentsByAppWhere(db, user.app.id)
  )
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
        if (payment) return getSharedSchema.parseAsync(payment);

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
            const payment = await updatePaymentByAppAndId(
              db,
              user.app!.id,
              id,
              body
            );
            if (payment) return getSharedSchema.parseAsync(payment);

            throw new RequestError(
              404,
              format("payment with id=% not found", id)
            );
          })
      )
  );

const getSharedSchema = selectPaymentSchema
  .pick({
    id: true,
    createdAt: true,
    updatedAt: true,
  })
  .and(
    object({
      amount: string(),
      paymentLink: selectPaymentLinkSchema,
      wallet: selectWalletSchema1.pick({
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
  );

export default function registerPaymentkoutes(fastify: FastifyInstance) {
  fastify
    .route({
      method: "POST",
      url: "/",
      handler: RequestError.handler(createPaymentRoute),
      preHandler: passport.authenticate(["jwt", "apiKey"]),
      schema: {
        tags: ["payments"],
        description: "This resource is to create a unique payment.",
        body: zodToJsonSchema(insertPaymentSchema),
        response: {
          201: zodToJsonSchema(getSharedSchema),
        },
      },
    })
    .route({
      method: "GET",
      url: "/",
      handler: RequestError.handler(getPaymentsRoute),
      preHandler: passport.authenticate(["jwt", "apiKey"]),
      schema: {
        tags: ["payments"],
        description:
          "This resource is to retrieve information about all payments.",
        response: {
          200: zodToJsonSchema(array(getSharedSchema), {
            definitions: { getSharedSchema },
          }),
        },
      },
    })
    .route({
      method: "GET",
      url: "/:id/",
      handler: RequestError.handler(getPaymentRoute),
      preHandler: passport.authenticate(["jwt", "apiKey"]),
      schema: {
        tags: ["payments"],
        description:
          "This resource is to retrieve information about a single payment.",
        params: zodToJsonSchema(selectPaymentSchema.pick({ id: true })),
        response: {
          200: zodToJsonSchema(getSharedSchema),
        },
      },
    })
    .route({
      method: "PATCH",
      url: "/:id/",
      handler: RequestError.handler(updatePaymentRoute),
      preHandler: passport.authenticate(["jwt", "apiKey"]),
      schema: {
        tags: ["payments"],
        description:
          "This resource is to update some information about a single payment.",
        params: zodToJsonSchema(selectPaymentSchema.pick({ id: true })),
        response: {
          201: zodToJsonSchema(getSharedSchema),
        },
      },
    });
}
