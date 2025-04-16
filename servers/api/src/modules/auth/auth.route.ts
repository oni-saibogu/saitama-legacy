import { sign } from "jsonwebtoken";
import passport from "@fastify/passport";
import type { FastifyInstance, FastifyRequest } from "fastify";

import { getEnv } from "../../env";
import { RequestError } from "../../error";

const tokenAuthRoute = (request: FastifyRequest) => {
  const user = request.user;
  if (user) {
    const token = sign(
      { id: user.id, lastLogin: user.lastLogin },
      getEnv<null>("SECRET_KEY")
    );

    return { token, user };
  }
};

export default function registerAuthRoutes(fastify: FastifyInstance) {
  fastify.route({
    method: "POST",
    url: "/auth/token/",
    handler: RequestError.handler(tokenAuthRoute),
    preHandler: passport.authenticate("firebase"),
  });
}
