import { svgs } from "@web3icons/core";
import { getTableColumns } from "drizzle-orm";

import { coins } from "../db/schema";
import type { Database } from "../db";
import type { chains } from "../config";

export type Coin = {
  name: string;
  ticker: string;
  logo: string;
  chains: { name: (typeof chains)[number]; mint?: string; decimals: number }[];
};

export const defaultCoins: Coin[] = [
  {
    name: "Ethereum",
    ticker: "ETH",
    logo: svgs.tokens.branded.ETH,
    chains: [{ name: "ethereum", decimals: 18 }],
  },
  {
    name: "USDC",
    ticker: "USDC",
    logo: svgs.tokens.branded.USDC,
    chains: [
      { name: "ethereum", decimals: 6 },
      { name: "solana", decimals: 6 },
      { name: "tron", decimals: 6 },
    ],
  },
  {
    name: "USDT",
    ticker: "USDT",
    logo: svgs.tokens.branded.USDT,
    chains: [
      { name: "ethereum", decimals: 6 },
      { name: "solana", decimals: 6 },
      { name: "tron", decimals: 6 },
    ],
  },
  {
    name: "Dai StableCoin",
    ticker: "DAI",
    logo: svgs.tokens.branded.DIA,
    chains: [{ name: "ethereum", decimals: 6 }],
  },
  {
    name: "Solana",
    ticker: "SOL",
    logo: svgs.tokens.branded.SOL,
    chains: [{ name: "solana", decimals: 6 }],
  },
  {
    name: "Tron",
    ticker: "TRX",
    logo: svgs.tokens.branded.TRX,
    chains: [{ name: "tron", decimals: 6 }],
  },
];

export const seedCoin = async (db: Database) => {
  return (
    await Promise.all(
      defaultCoins.map(async (coin) => {
        const values = coin.chains.map((chain) => ({
          mint: chain.mint,
          name: coin.name,
          ticker: coin.ticker,
          logo: coin.logo,
          decimals: chain.decimals,
          chain: chain.name,
          enabled: true,
        }));
        return db
          .insert(coins)
          .values(values)
          .returning({ id: coins.id })
          .onConflictDoUpdate({
            target: [coins.mint, coins.chain, coins.name],
            set: {
              ...getTableColumns(coins),
              updatedAt: new Date(),
            },
          })
          .execute();
      })
    )
  ).flat();
};
