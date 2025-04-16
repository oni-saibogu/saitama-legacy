import passport from "@fastify/passport";
import type { FastifyInstance, FastifyRequest } from "fastify";

import { format } from "../../core";
import { db } from "../../instances";
import { RequestError } from "../../error";
import { insertAppSchema, selectAppSchema } from "../../db/zod";
import {
  createApp,
  deleteAppByUserAndId,
  getAppByUserAndId,
  getAppsByUser,
  updateAppByUserAndId,
} from "./app.controller";

const createAppRoute = (
  request: FastifyRequest<{ Body: Zod.infer<typeof insertAppSchema> }>
) =>
  insertAppSchema
    .omit({ user: true })
    .parseAsync(request.body)
    .then(async (body) => {
      const [app] = await createApp(db, { ...body, user: request.user!.id });
      return app;
    });


const getAppsRoute = (request: FastifyRequest) =>
  getAppsByUser(db, request.user!.id);

const getAppRoute = (
  request: FastifyRequest<{
    Params: Pick<Zod.infer<typeof selectAppSchema>, "id">;
  }>
) =>
  selectAppSchema
    .pick({ id: true })
    .parseAsync(request.params)
    .then(async ({ id }) => {
      const app = await getAppByUserAndId(db, request.user!.id, id);
      if (app) return app;

      throw new RequestError(404, format("app with id=% not found", id));
    });

const updateAppRoute = (
  request: FastifyRequest<{
    Params: Pick<Zod.infer<typeof selectAppSchema>, "id">;
    Body: Partial<Zod.infer<typeof insertAppSchema>>;
  }>
) =>
  selectAppSchema
    .pick({ id: true })
    .parseAsync(request.params)
    .then(({ id }) =>
      insertAppSchema
        .partial()
        .parseAsync(request.body)
        .then(async (body) => {
          const app = await updateAppByUserAndId(
            db,
            request.user!.id,
            id,
            body
          );

          if (app) return app;

          throw new RequestError(404, format("app with id=% not found", id));
        })
    );

const deleteAppRoute = (
  request: FastifyRequest<{
    Params: Pick<Zod.infer<typeof selectAppSchema>, "id">;
  }>
) =>
  selectAppSchema
    .pick({ id: true })
    .parseAsync(request.params)
    .then(async ({ id }) => {
      const [app] = await deleteAppByUserAndId(db, request.user!.id, id);
      if (app) return app;

      throw new RequestError(404, format("app with id=% not found", id));
    });

export default function registerAppRoutes(fastify: FastifyInstance) {
  fastify
    .route({
      method: "POST",
      url: "/apps/",
      handler: RequestError.handler(createAppRoute),
      preHandler: passport.authenticate("jwt"),
    })
    .route({
      method: "GET",
      url: "/apps/",
      handler: RequestError.handler(getAppsRoute),
      preHandler: passport.authenticate("jwt"),
    })
    .route({
      method: "GET",
      url: "/apps/:id/",
      handler: RequestError.handler(getAppRoute),
      preHandler: passport.authenticate("jwt"),
    })
    .route({
      method: "PATCH",
      url: "/apps/:id/",
      handler: RequestError.handler(updateAppRoute),
      preHandler: passport.authenticate("jwt"),
    })
    .route({
      method: "DELETE",
      url: "/apps/:id/",
      handler: RequestError.handler(deleteAppRoute),
      preHandler: passport.authenticate("jwt"),
    });
}
