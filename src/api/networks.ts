import type { components } from "./schema";

export type BalanceInput = components["schemas"]["BalanceInput"];
export const networks = [
  { id: "eip155:1", name: "Ethereum", symbol: "ETH" },
  { id: "eip155:56", name: "BNB Smart Chain", symbol: "BNB" },
  { id: "eip155:137", name: "Polygon PoS", symbol: "POL" },
] as const;

export function networkLabel(id: string) {
  const n = networks.find((item) => item.id === id);
  return n ? n.name + " · " + n.symbol : id;
}
