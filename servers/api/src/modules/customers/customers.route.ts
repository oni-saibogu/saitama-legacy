import passport from "@fastify/passport";
import type { FastifyInstance, FastifyRequest } from "fastify";

import { db } from "../../instances";
import { RequestError } from "../../error";
import { insertCustomerSchema, selectCustomerSchema } from "../../db/zod";
import {
  createCustomer,
  deleteCustomerByAppAndId,
  getCustomerByAppAndId,
  getCustomersByAppWhere,
  updateCustomerByAppAndId,
} from "./customers.controller";

const createCustomerRoute = (
  request: FastifyRequest<{ Body: Zod.infer<typeof insertCustomerSchema> }>
) =>
  insertCustomerSchema
    .parseAsync(request.body)
    .then((body) => createCustomer(db, body));

const getCustomersRoute = (request: FastifyRequest) =>
  getCustomersByAppWhere(db, request.user!.app!.id);

const getCustomerRoute = (
  request: FastifyRequest<{
    Params: Pick<Zod.infer<typeof selectCustomerSchema>, "id">;
  }>
) =>
  selectCustomerSchema
    .pick({ id: true })
    .parseAsync(request.params)
    .then(({ id }) => {
      return getCustomerByAppAndId(db, request.user!.app!.id, id);
    });

const updateCustomerRoute = (
  request: FastifyRequest<{
    Params: Pick<Zod.infer<typeof selectCustomerSchema>, "id">;
    Body: Partial<Zod.infer<typeof insertCustomerSchema>>;
  }>
) =>
  selectCustomerSchema
    .pick({ id: true })
    .parseAsync(request.params)
    .then(({ id }) =>
      selectCustomerSchema
        .partial()
        .parseAsync(request.body)
        .then((body) => {
          return updateCustomerByAppAndId(db, request.user!.app!.id, id, body);
        })
    );

const deleteCustomerRoute = (
  request: FastifyRequest<{
    Params: Pick<Zod.infer<typeof selectCustomerSchema>, "id">;
  }>
) =>
  selectCustomerSchema
    .pick({ id: true })
    .parseAsync(request.params)
    .then(({ id }) => {
      return deleteCustomerByAppAndId(db, request.user!.app!.id, id);
    });

export default function registerCustomerRoutes(fastify: FastifyInstance) {
  fastify
    .route({
      method: "POST",
      url: "/customers/",
      handler: RequestError.handler(createCustomerRoute),
      preHandler: passport.authenticate("jwt"),
    })
    .route({
      method: "GET",
      url: "/customers/",
      handler: RequestError.handler(getCustomersRoute),
      preHandler: passport.authenticate("jwt"),
    })
    .route({
      method: "GET",
      url: "/customers/:id/",
      handler: RequestError.handler(getCustomerRoute),
      preHandler: passport.authenticate("jwt"),
    })
    .route({
      method: "PATCH",
      url: "/customers/:id/",
      handler: RequestError.handler(updateCustomerRoute),
      preHandler: passport.authenticate("jwt"),
    })
    .route({
      method: "DELETE",
      url: "/customers/:id/",
      handler: RequestError.handler(deleteCustomerRoute),
      preHandler: passport.authenticate("jwt"),
    });
}
