import {
  IconComponent,
  NetworkEthereum,
  NetworkSolana,
  NetworkTron,
} from "@web3icons/react";

export type Network = {
  name: string;
  icon: IconComponent;
  data: string;
  chains?: Network[];
};

export const networks: Network[] = [
  {
    name: "Ethereum",
    icon: NetworkEthereum,
    data: "ethereum",
  },
  { name: "Solana", icon: NetworkSolana, data: "solana" },
  { name: "Tron", icon: NetworkTron, data: "tron" },
];
