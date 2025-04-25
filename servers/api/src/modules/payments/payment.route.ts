import passport from "@fastify/passport";
import type { FastifyInstance, FastifyRequest } from "fastify";

import { format } from "../../core";
import { db } from "../../instances";
import { RequestError } from "../../error";
import { withUserGuard } from "../../guards";
import { insertPaymentSchema, selectPaymentSchema } from "../../db/zod";
import {
  createPayment,
  getPaymentByAppAndId,
  getPaymentsByAppWhere,
  updatePaymentByAppAndId,
} from "./payment.controller";

const createPaymentRoute = (
  request: FastifyRequest<{ Body: Zod.infer<typeof insertPaymentSchema> }>
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
    Params: Pick<Zod.infer<typeof selectPaymentSchema>, "id">;
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
    Params: Pick<Zod.infer<typeof selectPaymentSchema>, "id">;
    Body: Partial<Zod.infer<typeof insertPaymentSchema>>;
  }>
) =>
  withUserGuard((user) =>
    selectPaymentSchema
      .pick({ id: true })
      .parseAsync(request.params)
      .then(({ id }) =>
        insertPaymentSchema
          .partial()
          .pick({ signature: true })
          .parseAsync(request.body)
          .then(async (body) => {
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
      url: "/payments/",
      handler: RequestError.handler(createPaymentRoute),
      preHandler: passport.authenticate(["jwt", "apiKey"]),
    })
    .route({
      method: "GET",
      url: "/payments/",
      handler: RequestError.handler(getPaymentsRoute),
      preHandler: passport.authenticate(["jwt", "apiKey"]),
    })
    .route({
      method: "GET",
      url: "/payments/:id/",
      handler: RequestError.handler(getPaymentRoute),
      preHandler: passport.authenticate(["jwt", "apiKey"]),
    })
    .route({
      method: "PATCH",
      url: "/payments/:id/",
      handler: RequestError.handler(updatePaymentRoute),
      preHandler: passport.authenticate(["jwt", "apiKey"]),
    });
}
