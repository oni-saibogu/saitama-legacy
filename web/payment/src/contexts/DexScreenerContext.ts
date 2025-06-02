import { DexScreener, type Network } from "@saitamafun/sdk";
import { createContext, useContext } from "react";

type DexScreenerContext = {
  dexscreener: DexScreener;
  getMintPriceUSD: (network: Network["name"], mint: string) => Promise<number>;
};

export const DexScreenerContext = createContext<Partial<DexScreenerContext>>(
  {}
);

export const useDexscreener = () =>
  useContext(DexScreenerContext) as DexScreenerContext;
