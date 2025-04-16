import passport from "@fastify/passport";
import type { FastifyInstance, FastifyRequest } from "fastify";

import { db } from "../../instances";
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
  insertAppSchema.parseAsync(request.body).then((body) => {
    return createApp(db, body);
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
    .then(({ id }) => {
      return getAppByUserAndId(db, request.user!.id, id);
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
        .then((body) => {
          return updateAppByUserAndId(db, request.user!.id, id, body);
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
    .then(({ id }) => {
      return deleteAppByUserAndId(db, request.user!.id, id);
    });

export default function registerAppRoutes(fastify: FastifyInstance) {
  fastify
    .route({
      method: "POST",
      url: "/apps/",
      handler: createAppRoute,
      preHandler: passport.authenticate("jwt"),
    })
    .route({
      method: "GET",
      url: "/apps/",
      handler: getAppsRoute,
      preHandler: passport.authenticate("jwt"),
    })
    .route({
      method: "GET",
      url: "/apps/:id/",
      handler: getAppRoute,
      preHandler: passport.authenticate("jwt"),
    })
    .route({
      method: "PATCH",
      url: "/apps/:id/",
      handler: updateAppRoute,
      preHandler: passport.authenticate("jwt"),
    })
    .route({
      method: "DELETE",
      url: "/apps/:id/",
      handler: deleteAppRoute,
      preHandler: passport.authenticate("jwt"),
    });
}
