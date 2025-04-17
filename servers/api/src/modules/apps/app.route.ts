import passport from "@fastify/passport";
import type { FastifyInstance, FastifyRequest } from "fastify";

import { format } from "../../core";
import { db } from "../../instances";
import { RequestError } from "../../error";
import { withUserGuard } from "../../guards";
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
  withUserGuard(
    (user) =>
      insertAppSchema
        .omit({ user: true })
        .parseAsync(request.body)
        .then(async (body) => {
          const [app] = await createApp(db, { ...body, user: user.id });
          return app;
        }),
    true
  );
  
const getAppsRoute = withUserGuard((user) => getAppsByUser(db, user.id), true);

const getAppRoute = (
  request: FastifyRequest<{
    Params: Pick<Zod.infer<typeof selectAppSchema>, "id">;
  }>
) =>
  withUserGuard(
    async (user) =>
      selectAppSchema
        .pick({ id: true })
        .parseAsync(request.params)
        .then(async ({ id }) => {
          const app = await getAppByUserAndId(db, user.id, id);
          if (app) return app;

          throw new RequestError(404, format("app with id=% not found", id));
        }),
    true
  );

const updateAppRoute = (
  request: FastifyRequest<{
    Params: Pick<Zod.infer<typeof selectAppSchema>, "id">;
    Body: Partial<Zod.infer<typeof insertAppSchema>>;
  }>
) =>
  withUserGuard(
    (user) =>
      selectAppSchema
        .pick({ id: true })
        .parseAsync(request.params)
        .then(({ id }) =>
          insertAppSchema
            .partial()
            .parseAsync(request.body)
            .then(async (body) => {
              const app = await updateAppByUserAndId(db, user.id, id, body);
              if (app) return app;

              throw new RequestError(
                404,
                format("app with id=% not found", id)
              );
            })
        ),
    true
  );

const deleteAppRoute = (
  request: FastifyRequest<{
    Params: Pick<Zod.infer<typeof selectAppSchema>, "id">;
  }>
) =>
  withUserGuard(
    (user) =>
      selectAppSchema
        .pick({ id: true })
        .parseAsync(request.params)
        .then(async ({ id }) => {
          const [app] = await deleteAppByUserAndId(db, user.id, id);
          if (app) return app;

          throw new RequestError(404, format("app with id=% not found", id));
        }),
    true
  );

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
