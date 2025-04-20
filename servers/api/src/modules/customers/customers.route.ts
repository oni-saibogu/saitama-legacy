import passport from "@fastify/passport";
import type { FastifyInstance, FastifyRequest } from "fastify";

import { format } from "../../core";
import { db } from "../../instances";
import { RequestError } from "../../error";
import { withUserGuard } from "../../guards";
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
  withUserGuard((user) =>
    insertCustomerSchema
      .omit({ app: true })
      .parseAsync(request.body)
      .then(async (body) => {
        const [customer] = await createCustomer(db, {
          ...body,
          app: user.app.id,
        });

        return customer;
      })
  );

const getCustomersRoute = withUserGuard((user) =>
  getCustomersByAppWhere(db, user.app.id)
);

const getCustomerRoute = (
  request: FastifyRequest<{
    Params: Pick<Zod.infer<typeof selectCustomerSchema>, "id">;
  }>
) =>
  withUserGuard((user) =>
    selectCustomerSchema
      .pick({ id: true })
      .parseAsync(request.params)
      .then(async ({ id }) => {
        const customer = await getCustomerByAppAndId(db, user.app.id, id);
        if (customer) return customer;

        throw new RequestError(404, format("customer with id=% not found", id));
      })
  );

const updateCustomerRoute = (
  request: FastifyRequest<{
    Params: Pick<Zod.infer<typeof selectCustomerSchema>, "id">;
    Body: Partial<Zod.infer<typeof insertCustomerSchema>>;
  }>
) =>
  withUserGuard((user) =>
    selectCustomerSchema
      .pick({ id: true })
      .parseAsync(request.params)
      .then(({ id }) =>
        selectCustomerSchema
          .partial()
          .parseAsync(request.body)
          .then(async (body) => {
            const [customer] = await updateCustomerByAppAndId(
              db,
              user.app.id,
              id,
              body
            );
            if (customer) return customer;

            throw new RequestError(
              404,
              format("customer with id=% not found", id)
            );
          })
      )
  );

const deleteCustomerRoute = (
  request: FastifyRequest<{
    Params: Pick<Zod.infer<typeof selectCustomerSchema>, "id">;
  }>
) =>
  selectCustomerSchema
    .pick({ id: true })
    .parseAsync(request.params)
    .then(async ({ id }) => {
      const [customer] = await deleteCustomerByAppAndId(
        db,
        request.user!.app!.id,
        id
      );

      if (customer) return customer;

      throw new RequestError(404, format("customer with id=% not found", id));
    });

export default function registerCustomerRoutes(fastify: FastifyInstance) {
  fastify
    .route({
      method: "POST",
      url: "/customers/",
      handler: RequestError.handler(createCustomerRoute),
      preHandler: passport.authenticate(["jwt", "apiKey"]),
    })
    .route({
      method: "GET",
      url: "/customers/",
      handler: RequestError.handler(getCustomersRoute),
      preHandler: passport.authenticate(["jwt", "apiKey"]),
    })
    .route({
      method: "GET",
      url: "/customers/:id/",
      handler: RequestError.handler(getCustomerRoute),
      preHandler: passport.authenticate(["jwt", "apiKey"]),
    })
    .route({
      method: "PATCH",
      url: "/customers/:id/",
      handler: RequestError.handler(updateCustomerRoute),
      preHandler: passport.authenticate(["jwt", "apiKey"]),
    })
    .route({
      method: "DELETE",
      url: "/customers/:id/",
      handler: RequestError.handler(deleteCustomerRoute),
      preHandler: passport.authenticate(["jwt", "apiKey"]),
    });
}
