import passport from "@fastify/passport";
import type { FastifyInstance, FastifyRequest } from "fastify";

import { db } from "../../instances";
import { RequestError } from "../../error";
import { insertPaymentLinkSchema, selectPaymentLinkSchema } from "../../db/zod";
import {
  createPaymentLink,
  deletePaymentLinkByAppAndId,
  getPaymentLinkByAppAndId,
  getPaymentLinksByApp,
  updatePaymentLinkByAppAndId,
} from "./paymentLinks.controller";

const createPaymentLinkRoute = (
  request: FastifyRequest<{ Body: Zod.infer<typeof insertPaymentLinkSchema> }>
) =>
  insertPaymentLinkSchema
    .parseAsync(request.body)
    .then((body) => createPaymentLink(db, body));

const getPaymentLinksRoute = (request: FastifyRequest) =>
  getPaymentLinksByApp(db, request.user!.app!.id);

const getPaymentLinkRoute = (
  request: FastifyRequest<{
    Params: Pick<Zod.infer<typeof selectPaymentLinkSchema>, "id">;
  }>
) =>
  selectPaymentLinkSchema
    .pick({ id: true })
    .parseAsync(request.params)
    .then(({ id }) => {
      return getPaymentLinkByAppAndId(db, request.user!.app!.id, id);
    });

const updatePaymentLinkRoute = (
  request: FastifyRequest<{
    Params: Pick<Zod.infer<typeof selectPaymentLinkSchema>, "id">;
    Body: Partial<Zod.infer<typeof insertPaymentLinkSchema>>;
  }>
) =>
  selectPaymentLinkSchema
    .pick({ id: true })
    .parseAsync(request.params)
    .then(({ id }) =>
      insertPaymentLinkSchema
        .partial()
        .parseAsync(request.body)
        .then((body) => {
          return updatePaymentLinkByAppAndId(
            db,
            request.user!.app!.id,
            id,
            body
          );
        })
    );

const deletePaymentLinkRoute = (
  request: FastifyRequest<{
    Params: Pick<Zod.infer<typeof selectPaymentLinkSchema>, "id">;
  }>
) =>
  selectPaymentLinkSchema
    .pick({ id: true })
    .parseAsync(request.params)
    .then(({ id }) => {
      return deletePaymentLinkByAppAndId(db, request.user!.app!.id, id);
    });

export default function registerPaymentLinkRoutes(fastify: FastifyInstance) {
  fastify
    .route({
      method: "POST",
      url: "/payment-links/",
      handler: RequestError.handler(createPaymentLinkRoute),
      preHandler: passport.authenticate("jwt"),
    })
    .route({
      method: "GET",
      url: "/payment-links/",
      handler: RequestError.handler(getPaymentLinksRoute),
      preHandler: passport.authenticate("jwt"),
    })
    .route({
      method: "GET",
      url: "/payment-links/:id/",
      handler: RequestError.handler(getPaymentLinkRoute),
      preHandler: passport.authenticate("jwt"),
    })
    .route({
      method: "PATCH",
      url: "/payment-links/:id/",
      handler: RequestError.handler(updatePaymentLinkRoute),
      preHandler: passport.authenticate("jwt"),
    })
    .route({
      method: "DELETE",
      url: "/payment-links/:id/",
      handler: RequestError.handler(deletePaymentLinkRoute),
      preHandler: passport.authenticate("jwt"),
    });
}
