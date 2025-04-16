import passport from "@fastify/passport";
import type { FastifyInstance, FastifyRequest } from "fastify";

import { format } from "../../core";
import { db } from "../../instances";
import { RequestError } from "../../error";
import { insertApiKeySchema, selectApiKeySchema } from "../../db/zod";
import {
  createApiKey,
  deleteApiKeyByAppAndId,
  getApiKeysByApp,
} from "./apiKey.controller";

const createApiKeyRoute = (
  request: FastifyRequest<{ Body?: Zod.infer<typeof insertApiKeySchema> }>
) =>
  insertApiKeySchema
    .pick({})
    .parseAsync(request.body)
    .then((body) => createApiKey(db, { ...body, app: request.user!.app!.id }));

const getApiKeysRoute = (request: FastifyRequest) =>
  getApiKeysByApp(db, request.user!.app!.id);

const deleteApiKeyRoute = (
  request: FastifyRequest<{
    Params: Pick<Zod.infer<typeof selectApiKeySchema>, "id">;
  }>
) =>
  selectApiKeySchema
    .pick({ id: true })
    .parseAsync(request.params)
    .then(async ({ id }) => {
      const [apiKey] = await deleteApiKeyByAppAndId(
        db,
        request.user!.app!.id,
        id
      );

      if (apiKey) return apiKey;

      throw new RequestError(404, format("apiKey with id=% not found", id));
    });

export default function registerApiKeyRoutes(fastify: FastifyInstance) {
  fastify
    .route({
      method: "POST",
      url: "/api-keys/",
      handler: RequestError.handler(createApiKeyRoute),
      preHandler: passport.authenticate(["jwt", "apiKey"]),
    })
    .route({
      method: "GET",
      url: "/api-keys/",
      handler: RequestError.handler(getApiKeysRoute),
      preHandler: passport.authenticate(["jwt", "apiKey"]),
    })
    .route({
      method: "DELETE",
      url: "/api-keys/:id//",
      handler: RequestError.handler(deleteApiKeyRoute),
      preHandler: passport.authenticate(["jwt", "apiKey"]),
    });
}
