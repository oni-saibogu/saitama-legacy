import passport from "@fastify/passport";
import type { FastifyInstance, FastifyRequest } from "fastify";

import { format } from "../../core";
import { db } from "../../instances";
import { RequestError } from "../../error";
import { withUserGuard } from "../../guards";
import { insertPaymentLinkSchema, selectPaymentLinkSchema } from "../../db/zod";
import {
  createPaymentLink,
  deletePaymentLinkByAppAndId,
  getPaymentLinkByAppAndId,
  getPaymentLinksByApp,
  updatePaymentLinkByAppAndId,
} from "./payment-links.controller";

const createPaymentLinkRoute = (
  request: FastifyRequest<{ Body: Zod.infer<typeof insertPaymentLinkSchema> }>
) =>
  withUserGuard((user) =>
    insertPaymentLinkSchema
      .omit({ app: true })
      .parseAsync(request.body)
      .then(async (body) => {
        const [paymentLink] = await createPaymentLink(db, {
          ...body,
          app: user.app.id,
        });

        return paymentLink;
      })
  );

const getPaymentLinksRoute = () =>
  withUserGuard((user) => getPaymentLinksByApp(db, user.app.id));

const getPaymentLinkRoute = (
  request: FastifyRequest<{
    Params: Pick<Zod.infer<typeof selectPaymentLinkSchema>, "id">;
  }>
) =>
  withUserGuard((user) =>
    selectPaymentLinkSchema
      .pick({ id: true })
      .parseAsync(request.params)
      .then(async ({ id }) => {
        const paymentLink = await getPaymentLinkByAppAndId(db, user.app.id, id);
        if (paymentLink) return paymentLink;

        throw new RequestError(
          404,
          format("paymentLink with id=% not found", id)
        );
      })
  );

const updatePaymentLinkRoute = (
  request: FastifyRequest<{
    Params: Pick<Zod.infer<typeof selectPaymentLinkSchema>, "id">;
    Body: Partial<Zod.infer<typeof insertPaymentLinkSchema>>;
  }>
) =>
  withUserGuard((user) =>
    selectPaymentLinkSchema
      .pick({ id: true })
      .parseAsync(request.params)
      .then(({ id }) =>
        insertPaymentLinkSchema
          .partial()
          .parseAsync(request.body)
          .then(async (body) => {
            const [paymentLink] = await updatePaymentLinkByAppAndId(
              db,
              user.app.id,
              id,
              body
            );
            if (paymentLink) return paymentLink;

            throw new RequestError(
              404,
              format("paymentLink with id=% not found", id)
            );
          })
      )
  );

const deletePaymentLinkRoute = (
  request: FastifyRequest<{
    Params: Pick<Zod.infer<typeof selectPaymentLinkSchema>, "id">;
  }>
) =>
  withUserGuard((user) =>
    selectPaymentLinkSchema
      .pick({ id: true })
      .parseAsync(request.params)
      .then(async ({ id }) => {
        const [paymentLink] = await deletePaymentLinkByAppAndId(
          db,
          user.app.id,
          id
        );
        if (paymentLink) return paymentLink;

        throw new RequestError(
          404,
          format("paymentLink with id=% not found", id)
        );
      })
  );

export default function registerPaymentLinkRoutes(fastify: FastifyInstance) {
  fastify
    .route({
      method: "POST",
      url: "/payment-links/",
      handler: RequestError.handler(createPaymentLinkRoute),
      preHandler: passport.authenticate(["jwt", "apiKey"]),
    })
    .route({
      method: "GET",
      url: "/payment-links/",
      handler: RequestError.handler(getPaymentLinksRoute),
      preHandler: passport.authenticate(["jwt", "apiKey"]),
    })
    .route({
      method: "GET",
      url: "/payment-links/:id/",
      handler: RequestError.handler(getPaymentLinkRoute),
      preHandler: passport.authenticate(["jwt", "apiKey"]),
    })
    .route({
      method: "PATCH",
      url: "/payment-links/:id/",
      handler: RequestError.handler(updatePaymentLinkRoute),
      preHandler: passport.authenticate(["jwt", "apiKey"]),
    })
    .route({
      method: "DELETE",
      url: "/payment-links/:id/",
      handler: RequestError.handler(deletePaymentLinkRoute),
      preHandler: passport.authenticate(["jwt", "apiKey"]),
    });
}
