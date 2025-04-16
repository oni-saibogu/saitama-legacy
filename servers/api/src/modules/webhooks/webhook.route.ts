import passport from "@fastify/passport";
import type { FastifyInstance, FastifyRequest } from "fastify";

import { db } from "../../instances";
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
  insertWebhookSchema.parseAsync(request.body).then((body) => {
    return createWebhook(db, body);
  });

const getWebhooksRoute = (request: FastifyRequest) =>
  getWebhooksByApp(db, request.user!.app!.id);

const updateWebhookRoute = (
  request: FastifyRequest<{
    Params: Pick<Zod.infer<typeof selectWebhookSchema>, "id">;
    Body: Partial<Zod.infer<typeof insertWebhookSchema>>;
  }>
) =>
  selectWebhookSchema
    .pick({ id: true })
    .parseAsync(request.params)
    .then(({ id }) =>
      insertWebhookSchema
        .partial()
        .parseAsync(request.body)
        .then((body) => {
          return updateWebhookByAppAndId(db, request.user!.app!.id, id, body);
        })
    );

const deleteWebhookRoute = (
  request: FastifyRequest<{
    Params: Pick<Zod.infer<typeof selectWebhookSchema>, "id">;
  }>
) =>
  selectWebhookSchema
    .pick({ id: true })
    .parseAsync(request.params)
    .then(({ id }) => {
      return deleteWebhookByAppAndId(db, request.user!.app!.id, id);
    });

export default function registerWebhookRoutes(fastify: FastifyInstance) {
  fastify
    .route({
      method: "POST",
      url: "/webhooks/",
      handler: createWebhookRoute,
      preHandler: passport.authenticate(["apiKey", "jwt"]),
    })
    .route({
      method: "GET",
      url: "/webhooks/",
      handler: getWebhooksRoute,
      preHandler: passport.authenticate(["apiKey", "jwt"]),
    })
    .route({
      method: "PATCH",
      url: "/webhooks/:id/",
      handler: updateWebhookRoute,
      preHandler: passport.authenticate(["apiKey", "jwt"]),
    })
    .route({
      method: "DELETE",
      url: "/webhooks/:id/",
      handler: deleteWebhookRoute,
      preHandler: passport.authenticate(["apiKey", "jwt"]),
    });
}
