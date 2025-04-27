import { getEnv } from "./env";
import { createDB } from "./db";
import { web3 } from "@coral-xyz/anchor";

export const db = createDB(getEnv("DATABASE_URL")!);
export const secretKey = Buffer.from(getEnv("SECRET_KEY")!, "hex")
  .subarray(0, 16)
  .toString("hex");

export const solanaConnection = new web3.Connection(
  getEnv('SOLANA_RPC_URL')!
);
