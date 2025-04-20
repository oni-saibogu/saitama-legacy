import {
  IconComponent,
  // NetworkArbitrumOne,
  NetworkAvalanche,
  NetworkBase,
  NetworkBinanceSmartChain,
  // NetworkBlast,
  NetworkEthereum,
  // NetworkFantom,
  // NetworkLinea,
  // NetworkOptimism,
  NetworkPolygon,
  // NetworkPolygonZkevm,
  // NetworkScroll,
  NetworkSolana,
  NetworkTron,
  // NetworkZksync,
} from "@web3icons/react";

export type Network = {
  name: string;
  icon: IconComponent;
  data: string;
  chains?: Network[];
};

export const networks: Network[] = [
  { name: "Avalanche", icon: NetworkAvalanche, data: "avalanche" },
  {
    name: "Binance Smart Chain",
    icon: NetworkBinanceSmartChain,
    data: "binance-smart-chain",
  },
  {
    name: "Ethereum",
    icon: NetworkEthereum,
    data: "ethereum",
    chains: [
      // { name: "Arbitrum One", icon: NetworkArbitrumOne, data: "arbitrum-one" },
      { name: "Base", icon: NetworkBase, data: "base" },
      // { name: "Blast", icon: NetworkBlast, data: "blast" },
      { name: "Ethereum", icon: NetworkEthereum, data: "ethereum" },
      // { name: "Linea", icon: NetworkLinea, data: "linea" },
      // { name: "Optimism", icon: NetworkOptimism, data: "optimism" },
      // {
      //   name: "Polygon zkEVM",
      //   icon: NetworkPolygonZkevm,
      //   data: "polygon-zkevm",
      // },
      // { name: "Scroll", icon: NetworkScroll, data: "scroll" },
      // { name: "zkSync", icon: NetworkZksync, data: "zksync" },
    ],
  },
  // { name: "Fantom", icon: NetworkFantom, data: "fantom" },
  { name: "Polygon", icon: NetworkPolygon, data: "polygon" },
  { name: "Solana", icon: NetworkSolana, data: "solana" },
  { name: "Tron", icon: NetworkTron, data: "tron" },
];
