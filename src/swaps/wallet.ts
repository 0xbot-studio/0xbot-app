import type { Quote } from "./client";
import { addressPattern, hashPattern, native } from "./amount";
export type Wallet = {
  request(a: { method: string; params?: unknown[] }): Promise<unknown>;
};
export type Pending = {
  kind: "approval" | "swap";
  from: string;
  to: string;
  hash: string;
  state: "unknown" | "submitted";
  at: string;
};
const key = (workspace: string) => "0xbot.swap.receipt." + workspace;
const locks = new Set<string>();
export const receiptEvent = "0xbot:swap-receipt";
export function readPending(workspace: string): Pending | null {
  const raw = sessionStorage.getItem(key(workspace));
  if (!raw) return null;
  const p = JSON.parse(raw) as Pending;
  if (
    !["approval", "swap"].includes(p.kind) ||
    !["unknown", "submitted"].includes(p.state) ||
    !/^eip155:\d+$/.test(p.from) ||
    !/^eip155:\d+$/.test(p.to) ||
    (p.hash !== "" && !hashPattern.test(p.hash))
  )
    throw new Error("swap_storage");
  return p;
}
export function savePending(workspace: string, pending: Pending | null) {
  try {
    if (pending)
      sessionStorage.setItem(key(workspace), JSON.stringify(pending));
    else sessionStorage.removeItem(key(workspace));
  } catch {
    throw new Error("swap_storage");
  }
  if (typeof window !== "undefined")
    window.dispatchEvent(new Event(receiptEvent));
}
export function isBusy(workspace: string) {
  return locks.has(workspace);
}
export async function connect(wallet: Wallet): Promise<string> {
  const accounts = await wallet.request({ method: "eth_requestAccounts" });
  if (
    !Array.isArray(accounts) ||
    !addressPattern.test(accounts[0] || "") ||
    accounts[0].toLowerCase() === native
  )
    throw new Error("wallet_missing");
  return accounts[0].toLowerCase();
}
export async function checkWallet(
  wallet: Wallet,
  quote: Quote,
  signal: AbortSignal,
) {
  signal.throwIfAborted();
  if (
    !Number.isFinite(Date.parse(quote.expires_at)) ||
    Date.now() >= Date.parse(quote.expires_at)
  )
    throw new Error("swap_expired");
  const accounts = await wallet.request({ method: "eth_accounts" });
  const chain = await wallet.request({ method: "eth_chainId" });
  signal.throwIfAborted();
  if (
    !Array.isArray(accounts) ||
    accounts[0]?.toLowerCase() !== quote.request.wallet
  )
    throw new Error("swap_wallet_changed");
  if (
    typeof chain !== "string" ||
    BigInt(chain) !== BigInt(quote.request.from_network.split(":")[1])
  )
    throw new Error("swap_chain");
  if (
    !Number.isFinite(Date.parse(quote.expires_at)) ||
    Date.now() >= Date.parse(quote.expires_at)
  )
    throw new Error("swap_expired");
}
export async function allowance(wallet: Wallet, q: Quote, signal: AbortSignal) {
  await checkWallet(wallet, q, signal);
  if (q.request.from_token === native) return BigInt(q.request.amount);
  const result = await wallet.request({
    method: "eth_call",
    params: [
      {
        to: q.request.from_token,
        data:
          "0xdd62ed3e" +
          q.request.wallet.slice(2).padStart(64, "0") +
          q.approval_address.slice(2).padStart(64, "0"),
      },
      "latest",
    ],
  });
  signal.throwIfAborted();
  if (typeof result !== "string" || !/^0x[0-9a-fA-F]{64}$/.test(result))
    throw new Error("swap_allowance");
  return BigInt(result);
}
// Never retry a wallet submission. The journal is written before eth_sendTransaction.
export async function submit(
  wallet: Wallet,
  workspace: string,
  q: Quote,
  kind: "reset" | "approval" | "swap",
  signal: AbortSignal,
  update: (p: Pending | null) => void,
) {
  if (locks.has(workspace) || readPending(workspace))
    throw new Error("swap_pending");
  locks.add(workspace);
  try {
    const allowed = await allowance(wallet, q, signal);
    const needed = BigInt(q.request.amount);
    if (
      (kind === "swap" && allowed < needed) ||
      (kind === "reset" && (allowed === 0n || allowed >= needed)) ||
      (kind === "approval" && allowed !== 0n)
    )
      throw new Error("swap_allowance");
    await checkWallet(wallet, q, signal);
    const transaction =
      kind === "swap"
        ? {
            chainId:
              "0x" + BigInt(q.request.from_network.split(":")[1]).toString(16),
            from: q.request.wallet,
            to: q.transaction.to,
            data: q.transaction.data,
            value: "0x" + BigInt(q.transaction.value).toString(16),
          }
        : {
            chainId:
              "0x" + BigInt(q.request.from_network.split(":")[1]).toString(16),
            from: q.request.wallet,
            to: q.request.from_token,
            value: "0x0",
            data:
              "0x095ea7b3" +
              q.approval_address.slice(2).padStart(64, "0") +
              (kind === "reset" ? 0n : needed).toString(16).padStart(64, "0"),
          };
    const pending: Pending = {
      kind: kind === "swap" ? "swap" : "approval",
      from: q.request.from_network,
      to: q.request.to_network,
      hash: "",
      state: "unknown",
      at: new Date().toISOString(),
    };
    savePending(workspace, pending);
    update(pending);
    try {
      const hash = await wallet.request({
        method: "eth_sendTransaction",
        params: [transaction],
      });
      if (typeof hash !== "string" || !hashPattern.test(hash))
        throw new Error("swap_unknown");
      pending.hash = hash;
      pending.state = "submitted";
      savePending(workspace, pending);
      update({ ...pending });
    } catch (e) {
      if ((e as { code?: number }).code === 4001) {
        savePending(workspace, null);
        update(null);
        throw new Error("wallet_rejected");
      }
      throw new Error("swap_unknown");
    }
  } finally {
    locks.delete(workspace);
  }
}
export async function approvalReceipt(
  wallet: Wallet,
  pending: Pending,
  signal: AbortSignal,
) {
  const chain = await wallet.request({ method: "eth_chainId" });
  if (
    typeof chain !== "string" ||
    BigInt(chain) !== BigInt(pending.from.split(":")[1])
  )
    throw new Error("swap_chain");
  const receipt = (await wallet.request({
    method: "eth_getTransactionReceipt",
    params: [pending.hash],
  })) as { transactionHash?: string; status?: string } | null;
  signal.throwIfAborted();
  if (!receipt) return "pending";
  if (receipt.transactionHash?.toLowerCase() !== pending.hash.toLowerCase())
    throw new Error("swap_unknown");
  return receipt.status === "0x1"
    ? "completed"
    : receipt.status === "0x0"
      ? "failed"
      : "unknown";
}
