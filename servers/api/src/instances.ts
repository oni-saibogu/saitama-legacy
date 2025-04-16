import { createDB } from "./db";
import { getEnv } from "./env";

export const db = createDB(getEnv("DATABASE_URL")!);
export const secretKey = Buffer.from(getEnv("SECRET_KEY")!, "hex").subarray(
  0,
  16
);
