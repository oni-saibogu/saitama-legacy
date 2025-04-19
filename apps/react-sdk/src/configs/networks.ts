import {
  IconComponent,
  NetworkEthereum,
  NetworkSolana,
  NetworkTron,
} from "@web3icons/react";

export type Network = { name: string; icon: IconComponent; data: string };

export const networks: Network[] = [
  { name: "ethereum", icon: NetworkEthereum, data: "ethereum" },
  { name: "solana", icon: NetworkSolana, data: "solana" },
  { name: "tron", icon: NetworkTron, data: "tron" },
];
