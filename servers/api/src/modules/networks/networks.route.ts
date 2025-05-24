import { array, object } from "zod";
import passport from "@fastify/passport";
import type { FastifyInstance } from "fastify";
import zodToJsonSchema from "zod-to-json-schema";

import { db } from "../../instances";
import { getNetworks } from "./networks.controller";
import { selectCoinSchema, selectNetworkSchema } from "../../db/zod";

const getNetworksRoute = async () => getNetworks(db);

export default function registerNetworkRoutes(fastify: FastifyInstance) {
  fastify.route({
    url: "/",
    method: "GET",
    handler: getNetworksRoute,
    preHandler: passport.authenticate(["jwt", "apiKey"]),
    schema: {
      response: {
        200: zodToJsonSchema(
          array(
            selectNetworkSchema
              .omit({
                parent: true,
                creator: true,
                createdAt: true,
                updatedAt: true,
              })
              .and(
                object({
                  coins: array(
                    selectCoinSchema.omit({
                      network: true,
                      creator: true,
                      createdAt: true,
                      updatedAt: true,
                    })
                  ),
                })
              )
          )
        ),
      },
    },
  });
}
