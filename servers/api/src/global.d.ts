import { z } from "zod";
import type { Server } from "socket.io";

import type {
  selectAppSchema,
  selectAuthUserSchema,
  selectUserSchema,
} from "./db/zod";

type User = z.infer<typeof selectUserSchema>;

declare module "fastify" {
  interface PassportUser extends User {
    app: z.infer<typeof selectAppSchema>;
  }

  interface FastifyInstance {
    io: Server;
  }

  interface FastifyRequest {
    user: PassportUser;
  }
}

declare module "@fastify/secure-session" {
  interface SessionData {
    ["app/jwt"]: string;
  }
}

declare module "@web3icons/core";
