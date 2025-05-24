import { array, type z } from "zod";
import crypto from "crypto";
import passport from "@fastify/passport";
import zodToJsonSchema from "zod-to-json-schema";
import type { FastifyInstance, FastifyRequest } from "fastify";

import { getEnv } from "../../env";
import { format } from "../../core";
import { db } from "../../instances";
import { RequestError } from "../../error";
import type { chains } from "../../config";
import { withUserGuard } from "../../guards";
import { getNetworkById } from "../networks/networks.controller";
import { insertWalletSchema, selectWalletSchema } from "../../db/zod";
import { generateAddressFromIndex } from "../../core/wallet/generate";
import {
  createWallet,
  deleteWalletByAppAndId,
  getWalletsByApp,
  updateWalletByAppAndId,
} from "./wallet.controller";

const createWalletRoute = async (
  request: FastifyRequest<{ Body: z.infer<typeof insertWalletSchema> }>
) =>
  insertWalletSchema
    .omit({ app: true, generated: true })
    .partial({ address: true })
    .parseAsync(request.body)
    .then(async (body) => {
      let wallet = undefined;
      if (body.address)
        [wallet] = await createWallet(db, {
          ...body,
          app: request.user!.app!.id,
          address: body.address,
        });
      else {
        const index = crypto.randomInt(1, 10);
        const network = await getNetworkById(db, body.network);
        if (network) {
          const address = await generateAddressFromIndex(
            getEnv("MNEMONIC")!,
            index,
            network.name as unknown as (typeof chains)[number]
          );
          [wallet] = await createWallet(db, {
            ...body,
            address,
            generated: true,
            app: request.user!.app!.id,
            metadata: { index },
          });
        } else
          throw new RequestError(
            404,
            format("network with id=% not found", body.network)
          );
      }
      return wallet;
    });

export const getWalletsRoute = async (request: FastifyRequest) =>
  getWalletsByApp(db, request.user!.app!.id);

const updateWalletRoute = async (
  request: FastifyRequest<{
    Params: z.infer<typeof selectWalletSchema>["id"];
    Body: Partial<z.infer<typeof insertWalletSchema>>;
  }>
) =>
  withUserGuard((user) =>
    selectWalletSchema
      .pick({ id: true })
      .parseAsync(request.params)
      .then(({ id }) =>
        insertWalletSchema
          .partial()
          .parseAsync(request.body)
          .then(async (body) => {
            const [wallet] = await updateWalletByAppAndId(
              db,
              user.app.id,
              id,
              body
            );
            if (wallet) return wallet;

            throw new RequestError(
              404,
              format("wallet with id=% not found", id)
            );
          })
      )
  );

const deleteWalletRoute = async (
  request: FastifyRequest<{
    Params: z.infer<typeof selectWalletSchema>["id"];
  }>
) =>
  withUserGuard((user) =>
    selectWalletSchema
      .pick({ id: true })
      .parseAsync(request.params)
      .then(async ({ id }) => {
        const [wallet] = await deleteWalletByAppAndId(db, user.app.id, id);
        if (wallet) return wallet;

        throw new RequestError(404, format("wallet with id=% not found", id));
      })
  );

export default function registerWalletRoutes(fastify: FastifyInstance) {
  fastify
    .route({
      method: "POST",
      url: "/",
      handler: RequestError.handler(createWalletRoute),
      preHandler: passport.authenticate(["apiKey", "jwt"]),
      schema: {
        body: zodToJsonSchema(
          insertWalletSchema.omit({ app: true, generated: true })
        ),
        response: {
          201: zodToJsonSchema(selectWalletSchema),
        },
      },
    })
    .route({
      method: "GET",
      url: "/",
      handler: RequestError.handler(getWalletsRoute),
      preHandler: passport.authenticate(["apiKey", "jwt"]),
      schema: {
        response: {
          200: zodToJsonSchema(array(selectWalletSchema)),
        },
      },
    })
    .route({
      method: "PATCH",
      url: "/:id/",
      handler: RequestError.handler(updateWalletRoute),
      preHandler: passport.authenticate(["apiKey", "jwt"]),
      schema: {
        params: zodToJsonSchema(selectWalletSchema.pick({ id: true })),
        response: {
          200: zodToJsonSchema(selectWalletSchema),
        },
      },
    })
    .route({
      method: "DELETE",
      url: "/:id/",
      handler: RequestError.handler(deleteWalletRoute),
      preHandler: passport.authenticate(["apiKey", "jwt"]),
      schema: {
        params: zodToJsonSchema(selectWalletSchema.pick({ id: true })),
        response: {
          200: zodToJsonSchema(selectWalletSchema),
        },
      },
    });
}
