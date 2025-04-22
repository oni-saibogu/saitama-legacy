import { eq, isNull } from "drizzle-orm";
import passport from "@fastify/passport";
import type { FastifyInstance, FastifyRequest } from "fastify";

import { format } from "../../core";
import { db } from "../../instances";
import { coins } from "../../db/schema";
import { RequestError } from "../../error";
import { withUserGuard } from "../../guards";
import { insertCoinSchema, selectCoinSchema } from "../../db/zod";
import {
  createCoin,
  deleteCoinByUserAndId,
  getCoins,
  updateCoinByUserAndId,
} from "./coins.controller";

const createCoinRoute = (
  request: FastifyRequest<{ Body: Zod.infer<typeof insertCoinSchema> }>
) =>
  withUserGuard((user) =>
    insertCoinSchema
      .omit({ creator: true })
      .parseAsync(request.body)
      .then(async (body) => {
        const [coin] = await createCoin(db, { ...body, creator: user.id });
        return coin;
      })
  );

const getCoinsRoute = withUserGuard(async (user) => {
  return (
    await Promise.all([
      getCoins(db, eq(coins.creator, user.id)),
      getCoins(db, isNull(coins.creator)),
    ])
  ).flat();
}, true);

const updateCoinRoute = (
  request: FastifyRequest<{
    Params: Pick<Zod.infer<typeof selectCoinSchema>, "id">;
    Body: Partial<Zod.infer<typeof insertCoinSchema>>;
  }>
) =>
  withUserGuard((user) =>
    selectCoinSchema
      .pick({ id: true })
      .parseAsync(request.body)
      .then((params) =>
        insertCoinSchema
          .partial()
          .parseAsync(request.body)
          .then(async (body) => {
            const [coin] = await updateCoinByUserAndId(
              db,
              user.id,
              params.id,
              body
            );
            if (coin) return coin;
            throw new RequestError(
              404,
              format("coin with id=% not found", params.id)
            );
          })
      )
  );

const deleteCoinRoute = (
  request: FastifyRequest<{
    Params: Pick<Zod.infer<typeof selectCoinSchema>, "id">;
  }>
) =>
  withUserGuard((user) =>
    selectCoinSchema
      .pick({ id: true })
      .parseAsync(request.body)
      .then(async (params) => {
        const [coin] = await deleteCoinByUserAndId(db, user.id, params.id);
        if (coin) return coin;
        throw new RequestError(
          404,
          format("coin with id=% not found", params.id)
        );
      })
  );

export default function registerCoinRoutes(fastify: FastifyInstance) {
  fastify
    .route({
      url: "/coins/",
      method: "POST",
      handler: RequestError.handler(createCoinRoute),
      preHandler: passport.authenticate(["jwt", "apiKey"]),
    })
    .route({
      url: "/coins/",
      method: "GET",
      handler: RequestError.handler(getCoinsRoute),
      preHandler: passport.authenticate(["jwt", "apiKey"]),
    })
    .route({
      url: "/coins/:id/",
      method: "PATCH",
      handler: RequestError.handler(updateCoinRoute),
      preHandler: passport.authenticate(["jwt", "apiKey"]),
    })
    .route({
      url: "/coins/:id/",
      method: "DELETE",
      handler: RequestError.handler(deleteCoinRoute),
      preHandler: passport.authenticate(["jwt", "apiKey"]),
    });
}
