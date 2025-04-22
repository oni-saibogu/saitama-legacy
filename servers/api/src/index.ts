import Fastify, { type FastifyRequest } from "fastify";
import { readFileSync } from "fs";
import fastifyCors from "@fastify/cors";
import fastifyPassport from "@fastify/passport";
import fastifySecureSession from "@fastify/secure-session";
import { ExtractJwt, Strategy as JWTStrategy } from "passport-jwt";

import { credential } from "firebase-admin";
import { initializeApp, type ServiceAccount } from "firebase-admin/app";

import { getEnv } from "./env";
import { format } from "./core";
import { db } from "./instances";
import { RequestError } from "./error";
import registerRoutes from "./modules";
import type { selectUserSchema } from "./db/zod";
import { getUserById } from "./modules/users/users.controller";
import { getAppByUserAndId } from "./modules/apps/app.controller";
import { ApiKeyStrategy, FirebaseStrategy } from "./modules/auth/auth.strategy";

function main() {
  initializeApp({
    credential: credential.cert(getEnv<ServiceAccount>("SERVICE_ACCOUNT")!),
  });

  const fastify = Fastify({
    logger: true,
    ignoreDuplicateSlashes: true,
    ignoreTrailingSlash: true,
  });

  fastify.register(fastifySecureSession, {
    key: readFileSync("secret-key"),
  });
  fastify.register(fastifyCors, {
    origin: [/localhost/],
  });

  fastify.register(fastifyPassport.initialize());
  fastify.register(fastifyPassport.secureSession());

  fastifyPassport.use("apiKey", new ApiKeyStrategy());
  fastifyPassport.use("firebase", new FirebaseStrategy());
  fastifyPassport.use(
    "jwt",
    new JWTStrategy(
      {
        jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
        secretOrKey: getEnv("SECRET_KEY")!,
        passReqToCallback: true,
      },
      async (request: FastifyRequest, payload, done) => {
        let app = undefined;
        const appId = request.headers["x-app-id"] as string | undefined;

        if (payload.id) {
          const user = await getUserById(db, payload.id).then((user) => user);
          if (user) {
            if (appId) app = await getAppByUserAndId(db, user.id, appId);
            return done(null, { ...user, app });
          }

          done(null, null);
        }

        return done(new RequestError(500, "invalid jwt payload"), null);
      }
    )
  );

  fastifyPassport.registerUserSerializer<
    Zod.infer<typeof selectUserSchema>,
    Pick<Zod.infer<typeof selectUserSchema>, "id">
  >(async (user) => ({ id: user.id }));

  fastifyPassport.registerUserDeserializer<
    Pick<Zod.infer<typeof selectUserSchema>, "id">,
    Zod.infer<typeof selectUserSchema>
  >(async (payload) => {
    const user = await getUserById(db, payload.id);

    if (user) return user;

    throw new RequestError(404, format("user with id=% not found", payload.id));
  });

  registerRoutes(fastify);

  fastify.listen({
    host: getEnv<string>("HOST")!,
    port: getEnv("PORT", Number)!,
  });

  process.on("SIGINT", () => fastify.close());
  process.on("SIGTERM", () => fastify.close());
}

main();
