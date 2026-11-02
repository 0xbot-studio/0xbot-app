export const entries = [
  { slug: "rooms", id: "rooms.get", label: "rooms", planned: false },
  {
    slug: "send-message",
    id: "messaging.send",
    label: "sendMessage",
    planned: false,
  },
  { slug: "inbox", id: "messaging.list", label: "inbox", planned: false },
  {
    slug: "message-detail",
    id: "messaging.get",
    label: "messageDetail",
    planned: false,
  },
  {
    slug: "asset-price",
    id: "market.asset_price",
    label: "assetPrice",
    planned: false,
  },
  {
    slug: "token-price",
    id: "market.token_price",
    label: "tokenPrice",
    planned: false,
  },
  {
    slug: "native-balance",
    id: "data.balance",
    label: "native",
    planned: false,
  },
  {
    slug: "token-balance",
    id: "data.token_balance",
    label: "token",
    planned: false,
  },
  {
    slug: "common-balances",
    id: "data.balances",
    label: "common",
    planned: false,
  },
  {
    slug: "transaction",
    id: "data.transaction",
    label: "transaction",
    planned: true,
  },
  {
    slug: "transaction-receipt",
    id: "data.transaction_receipt",
    label: "receipt",
    planned: true,
  },
  { slug: "nft-detail", id: "nft.token", label: "nft", planned: false },
  { slug: "nft-owner", id: "nft.owner", label: "nftOwner", planned: false },
  {
    slug: "nft-balance",
    id: "nft.balance",
    label: "nftBalance",
    planned: false,
  },
  {
    slug: "token-bound-resolve",
    id: "data.token_bound_account.resolve",
    label: "tbaResolve",
    planned: false,
  },
  {
    slug: "token-bound-account",
    id: "data.token_bound_account.get",
    label: "tbaInspect",
    planned: false,
  },
  {
    slug: "nft-transfers",
    id: "nft.transfers",
    label: "nftTransfers",
    planned: true,
  },
  { slug: "wallet-nfts", id: "nft.owned", label: "walletNFTs", planned: true },
] as const;
export type QueryEntry = (typeof entries)[number];
export function parsePlaygroundRoute(route: string) {
  return route === "playground"
    ? "native-balance"
    : route.replace(/^playground\//, "");
}
export function eligibleProviders<
  T extends {
    enabled: boolean;
    networks: string[];
    capabilities: string[];
    health: string;
  },
>(providers: T[], capability: string, network: string): T[] {
  return providers.filter(
    (p) =>
      p.enabled &&
      p.networks.includes(network) &&
      p.capabilities.includes(capability) &&
      p.health !== "circuit_open",
  );
}
