import passport from "@fastify/passport";
import type { FastifyInstance } from "fastify";

import { RequestError } from "../../error";
import { withUserGuard } from "../../guards";

const getUserRoute = withUserGuard((user) => user, true);

export default function registerUserRoutes(fastify: FastifyInstance) {
  fastify.route({
    method: "GET",
    url: "/users/me/",
    handler: RequestError.handler(getUserRoute),
    preHandler: passport.authenticate("jwt"),
  });
}
