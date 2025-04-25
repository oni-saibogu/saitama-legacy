import passport from "@fastify/passport";
import type { FastifyInstance } from "fastify";

import { db } from "../../instances";
import { getNetworks } from "./networks.controller";

const getNetworksRoute = () => getNetworks(db);

export default function registerNetworkRoutes(fastify: FastifyInstance) {
  fastify.route({
    url: "/networks",
    method: "GET",
    handler: getNetworksRoute,
    preHandler: passport.authenticate(["jwt", "apiKey"]),
  });
}
