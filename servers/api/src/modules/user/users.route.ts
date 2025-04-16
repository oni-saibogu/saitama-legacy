import passport from "@fastify/passport";
import type { FastifyInstance, FastifyRequest } from "fastify";
import { RequestError } from "../../error";

const getUserRoute = (request: FastifyRequest) => request.user;

export default function registerUserRoutes(fastify: FastifyInstance) {
  fastify.route({
    method: "GET",
    url: "/users/me/",
    handler: RequestError.handler(getUserRoute),
    preHandler: passport.authenticate("jwt"),
  });
}
