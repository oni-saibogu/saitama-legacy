import passport from "@fastify/passport";
import type { FastifyInstance, FastifyRequest } from "fastify";

import { db } from "../../instances";
import {
  createPayment,
  getPaymentByAppAndId,
  getPaymentsByAppWhere,
  updatePaymentByAppAndId,
} from "./payment.controller";
import { insertPaymentSchema, selectPaymentSchema } from "../../db/zod";

const createPaymentRoute = (
  request: FastifyRequest<{ Body: Zod.infer<typeof insertPaymentSchema> }>
) =>
  insertPaymentSchema
    .parseAsync(request.body)
    .then((body) => createPayment(db, body));

const getPaymentsRoute = (request: FastifyRequest) =>
  getPaymentsByAppWhere(db, request.user!.app!.id);

const getPaymentRoute = (
  request: FastifyRequest<{
    Params: Pick<Zod.infer<typeof selectPaymentSchema>, "id">;
  }>
) =>
  selectPaymentSchema
    .pick({ id: true })
    .parseAsync(request.params)
    .then(({ id }) => {
      return getPaymentByAppAndId(db, request.user!.app!.id, id);
    });

const updatePaymentRoute = (
  request: FastifyRequest<{
    Params: Pick<Zod.infer<typeof selectPaymentSchema>, "id">;
    Body: Partial<Zod.infer<typeof insertPaymentSchema>>;
  }>
) =>
  selectPaymentSchema
    .pick({ id: true })
    .parseAsync(request.params)
    .then(({ id }) =>
      insertPaymentSchema
        .partial()
        .pick({ signature: true })
        .parseAsync(request.body)
        .then((body) => {
          return updatePaymentByAppAndId(db, request.user!.app!.id, id, body);
        })
    );

export default function registerPaymentkoutes(fastify: FastifyInstance) {
  fastify
    .route({
      method: "POST",
      url: "/payments/",
      handler: createPaymentRoute,
      preHandler: passport.authenticate("jwt"),
    })
    .route({
      method: "GET",
      url: "/payments/",
      handler: getPaymentsRoute,
      preHandler: passport.authenticate("jwt"),
    })
    .route({
      method: "GET",
      url: "/payments/:id/",
      handler: getPaymentRoute,
      preHandler: passport.authenticate("jwt"),
    })
    .route({
      method: "PATCH",
      url: "/payments/:id/",
      handler: updatePaymentRoute,
      preHandler: passport.authenticate("jwt"),
    });
}
