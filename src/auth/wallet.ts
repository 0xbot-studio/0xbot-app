import { api, result } from "../api/client";
type Wallet = {
  request: (a: { method: string; params?: unknown[] }) => Promise<unknown>;
};
declare global {
  interface Window {
    ethereum?: Wallet;
  }
}
export async function walletLogin(link = false) {
  const wallet = window.ethereum;
  if (!wallet) throw new Error("wallet_missing");
  try {
    const addresses = (await wallet.request({
      method: "eth_requestAccounts",
    })) as string[];
    if (!addresses?.[0]) throw new Error("wallet_missing");
    const c = result(
      await api.POST("/v1/auth/wallet/challenge", {
        body: { address: addresses[0], link },
      }),
    );
    const hex =
      "0x" +
      Array.from(new TextEncoder().encode(c.message), (b) =>
        b.toString(16).padStart(2, "0"),
      ).join("");
    const signature = (await wallet.request({
      method: "personal_sign",
      params: [hex, addresses[0]],
    })) as string;
    result(
      await api.POST("/v1/auth/wallet/verify", {
        body: { id: c.id, signature },
      }),
    );
  } catch (e) {
    if ((e as { code?: number }).code === 4001)
      throw new Error("wallet_rejected");
    throw e;
  }
}
