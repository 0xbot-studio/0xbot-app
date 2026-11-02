import { api, result } from "../api/client";
import type { components } from "../api/schema";
export type QuoteInput = components["schemas"]["SwapQuoteInput"];
export type Quote = components["schemas"]["SwapQuoteResult"]["data"];
export type Token = NonNullable<
  components["schemas"]["SwapTokensResult"]["data"]
>[number];
export const networks = [
  ["eip155:1", "Ethereum"],
  ["eip155:10", "Optimism"],
  ["eip155:56", "BNB Chain"],
  ["eip155:137", "Polygon"],
  ["eip155:8453", "Base"],
  ["eip155:42161", "Arbitrum"],
] as const;
export async function tokens(network: string, signal: AbortSignal) {
  return (
    result(await api.POST("/v1/swaps/tokens", { body: { network }, signal }))
      .data || []
  );
}
export async function quote(body: QuoteInput, signal: AbortSignal) {
  return result(await api.POST("/v1/swaps/quote", { body, signal })).data;
}
export async function status(
  from_network: string,
  to_network: string,
  tx_hash: string,
  signal: AbortSignal,
) {
  return result(
    await api.POST("/v1/swaps/status", {
      body: { from_network, to_network, tx_hash },
      signal,
    }),
  ).data;
}
