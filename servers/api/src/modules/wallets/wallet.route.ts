import crypto from "crypto";
import passport from "@fastify/passport";
import type { FastifyInstance, FastifyRequest } from "fastify";

import { getEnv } from "../../env";
import { db } from "../../instances";
import { insertWalletSchema, selectWalletSchema } from "../../db/zod";
import { generateAddressFromIndex } from "../../core/wallet/generate";
import {
  createWallet,
  deleteWalletByAppAndId,
  getWalletsByApp,
  updateWalletByAppAndId,
} from "./wallet.controller";

const createWalletRoute = async (
  request: FastifyRequest<{ Body: Zod.infer<typeof insertWalletSchema> }>
) =>
  insertWalletSchema
    .omit({ generated: true })
    .partial({ address: true })
    .parseAsync(request.body)
    .then(async (body) => {
      if (body.address)
        return createWallet(db, { ...body, address: body.address });
      else {
        const index = crypto.randomInt(0, 10);
        const address = await generateAddressFromIndex(
          getEnv("MNEMONIC")!,
          index,
          body.chain
        );
        return createWallet(db, {
          ...body,
          generated: true,
          address,
          metadata: { index },
        });
      }
    });

export const getWalletsRoute = async (request: FastifyRequest) =>
  getWalletsByApp(db, request.user!.app!.id);

const updateWalletRoute = async (
  request: FastifyRequest<{
    Params: Zod.infer<typeof selectWalletSchema>["id"];
    Body: Partial<Zod.infer<typeof insertWalletSchema>>;
  }>
) =>
  selectWalletSchema
    .pick({ id: true })
    .parseAsync(request.body)
    .then(({ id }) =>
      insertWalletSchema
        .partial()
        .parseAsync(request.body)
        .then((body) => {
          return updateWalletByAppAndId(db, request.user!.app!.id, id, body);
        })
    );

const deleteeWalletRoute = async (
  request: FastifyRequest<{
    Params: Zod.infer<typeof selectWalletSchema>["id"];
  }>
) =>
  selectWalletSchema
    .pick({ id: true })
    .parseAsync(request.body)
    .then(({ id }) => {
      return deleteWalletByAppAndId(db, request.user!.app!.id, id);
    });

export default function registerWalletRoutes(fastify: FastifyInstance) {
  fastify
    .route({
      method: "POST",
      url: "/wallets/",
      handler: createWalletRoute,
      preHandler: passport.authenticate(["apiKey", "jwt"]),
    })
    .route({
      method: "GET",
      url: "/wallets",
      handler: getWalletsRoute,
      preHandler: passport.authenticate(["apiKey", "jwt"]),
    })
    .route({
      method: "PATCH",
      url: "/wallets/:id/",
      handler: updateWalletRoute,
      preHandler: passport.authenticate(["apiKey", "jwt"]),
    })
    .route({
      method: "DELETE",
      url: "/wallets/:id/",
      handler: deleteeWalletRoute,
      preHandler: passport.authenticate(["apiKey", "jwt"]),
    });
}
