import passport from "@fastify/passport";
import type { FastifyInstance, FastifyRequest } from "fastify";

import { format } from "../../core";
import { db } from "../../instances";
import { RequestError } from "../../error";
import { withUserGuard } from "../../guards";
import { insertWebhookSchema, selectWebhookSchema } from "../../db/zod";
import {
  createWebhook,
  deleteWebhookByAppAndId,
  getWebhooksByApp,
  updateWebhookByAppAndId,
} from "./webhook.controller";

const createWebhookRoute = (
  request: FastifyRequest<{ Body: Zod.infer<typeof insertWebhookSchema> }>
) =>
  withUserGuard((user) =>
    insertWebhookSchema
      .omit({ app: true })
      .parseAsync(request.body)
      .then((body) => {
        return createWebhook(db, { ...body, app: user.app.id });
      })
  );

const getWebhooksRoute = withUserGuard((user) =>
  getWebhooksByApp(db, user.app.id)
);

const updateWebhookRoute = (
  request: FastifyRequest<{
    Params: Pick<Zod.infer<typeof selectWebhookSchema>, "id">;
    Body: Partial<Zod.infer<typeof insertWebhookSchema>>;
  }>
) =>
  withUserGuard((user) =>
    selectWebhookSchema
      .pick({ id: true })
      .parseAsync(request.params)
      .then(({ id }) =>
        insertWebhookSchema
          .partial()
          .parseAsync(request.body)
          .then(async (body) => {
            const [webhook] = await updateWebhookByAppAndId(
              db,
              user.app.id,
              id,
              body
            );
            if (webhook) return webhook;

            throw new RequestError(
              404,
              format("webhook with id=% not found", id)
            );
          })
      )
  );

const deleteWebhookRoute = (
  request: FastifyRequest<{
    Params: Pick<Zod.infer<typeof selectWebhookSchema>, "id">;
  }>
) =>
  withUserGuard((user) =>
    selectWebhookSchema
      .pick({ id: true })
      .parseAsync(request.params)
      .then(async ({ id }) => {
        const [webhook] = await deleteWebhookByAppAndId(db, user.app.id, id);
        if (webhook) return webhook;

        throw new RequestError(404, format("webhook with id=% not found", id));
      })
  );

export default function registerWebhookRoutes(fastify: FastifyInstance) {
  fastify
    .route({
      method: "POST",
      url: "/webhooks/",
      handler: RequestError.handler(createWebhookRoute),
      preHandler: passport.authenticate(["apiKey", "jwt"]),
    })
    .route({
      method: "GET",
      url: "/webhooks/",
      handler: RequestError.handler(getWebhooksRoute),
      preHandler: passport.authenticate(["apiKey", "jwt"]),
    })
    .route({
      method: "PATCH",
      url: "/webhooks/:id/",
      handler: RequestError.handler(updateWebhookRoute),
      preHandler: passport.authenticate(["apiKey", "jwt"]),
    })
    .route({
      method: "DELETE",
      url: "/webhooks/:id/",
      handler: RequestError.handler(deleteWebhookRoute),
      preHandler: passport.authenticate(["apiKey", "jwt"]),
    });
}
