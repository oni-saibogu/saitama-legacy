import { mainnet } from "viem/chains";
import { createPublicClient, http } from "viem";
import { web3 } from "@coral-xyz/anchor";

import { getEnv } from "./env";
import { createDB } from "./db";

export const db = createDB(getEnv("DATABASE_URL")!);
export const secretKey = Buffer.from(getEnv("SECRET_KEY")!, "hex")
  .subarray(0, 16)
  .toString("hex");

export const solana = new web3.Connection(getEnv<string>("SOLANA_RPC_URL")!);

export const viem = createPublicClient({
  chain: mainnet,
  transport: http(getEnv<string>("ETHEREUM_RPC_URL")!),
});
