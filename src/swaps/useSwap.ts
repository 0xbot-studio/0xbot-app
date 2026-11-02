import { useEffect, useRef, useState } from "react";
import { useLocale } from "../i18n/Locale";
import * as client from "./client";
import * as walletActions from "./wallet";
import { toUnits } from "./amount";
import { swapCopy } from "./copy";
export function useSwap(workspace: string) {
  const { lang, error } = useLocale();
  const p = swapCopy[lang];
  const [from, setFrom] = useState("eip155:1");
  const [to, setTo] = useState("eip155:8453");
  const [fromToken, setFromToken] = useState("");
  const [toToken, setToToken] = useState("");
  const [catalog, setCatalog] = useState<[client.Token[], client.Token[]]>([
    [],
    [],
  ]);
  const [catalogBusy, setCatalogBusy] = useState(false);
  const [reload, setReload] = useState(0);
  const [amount, setAmount] = useState("");
  const [slippage, setSlippage] = useState(50);
  const [address, setAddress] = useState("");
  const [quote, setQuote] = useState<client.Quote>();
  const [allowed, setAllowed] = useState<bigint>();
  const [consent, setConsent] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<unknown>();
  const [notice, setNotice] = useState("");
  const [pending, setPending] = useState<walletActions.Pending | null>(null);
  const [storageReady, setStorageReady] = useState(false);
  const [now, setNow] = useState(Date.now());
  const action = useRef<AbortController | null>(null);
  const mounted = useRef(true);
  const wallet = useRef<walletActions.Wallet | null>(null);
  const busyRef = useRef(false);
  useEffect(() => {
    mounted.current = true;
    const restore = () => {
      try {
        setPending(walletActions.readPending(workspace));
        setStorageReady(true);
      } catch {
        setStorageReady(false);
        setErr(new Error("swap_storage"));
      }
    };
    restore();
    window.addEventListener(walletActions.receiptEvent, restore);
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => {
      mounted.current = false;
      action.current?.abort();
      clearInterval(timer);
      window.removeEventListener(walletActions.receiptEvent, restore);
    };
  }, [workspace]);
  function clearQuote() {
    action.current?.abort();
    setQuote(undefined);
    setAllowed(undefined);
    setConsent(false);
  }
  useEffect(() => {
    const controller = new AbortController();
    setCatalogBusy(true);
    setCatalog([[], []]);
    setFromToken("");
    setToToken("");
    Promise.all([
      client.tokens(from, controller.signal),
      client.tokens(to, controller.signal),
    ])
      .then((lists) => {
        if (!controller.signal.aborted) setCatalog(lists);
      })
      .catch((e) => {
        if (!controller.signal.aborted) setErr(e);
      })
      .finally(() => {
        if (!controller.signal.aborted) setCatalogBusy(false);
      });
    return () => controller.abort();
  }, [from, to, reload]);
  useEffect(() => {
    if (!address || !wallet.current) return;
    let active = true,
      checking = false;
    const timer = setInterval(async () => {
      if (checking) return;
      checking = true;
      try {
        const accounts = await wallet.current!.request({
          method: "eth_accounts",
        });
        if (
          active &&
          (!Array.isArray(accounts) || accounts[0]?.toLowerCase() !== address)
        ) {
          action.current?.abort();
          setAddress("");
          setQuote(undefined);
          setAllowed(undefined);
          setConsent(false);
          setErr(new Error("swap_wallet_changed"));
        }
      } catch {
        if (active) {
          setQuote(undefined);
          setAllowed(undefined);
        }
      } finally {
        checking = false;
      }
    }, 1500);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [address]);
  async function run(fn: (signal: AbortSignal) => Promise<void>) {
    if (busyRef.current) return;
    busyRef.current = true;
    action.current?.abort();
    const controller = new AbortController();
    action.current = controller;
    setBusy(true);
    setErr(undefined);
    setNotice("");
    try {
      await fn(controller.signal);
    } catch (e) {
      if (mounted.current && !controller.signal.aborted) setErr(e);
    } finally {
      busyRef.current = false;
      if (mounted.current) setBusy(false);
    }
  }
  function getWallet() {
    const w = wallet.current || window.ethereum;
    if (!w) throw new Error("wallet_missing");
    return w;
  }
  const source = catalog[0].find((t) => t.address === fromToken);
  const expired = !quote || now >= Date.parse(quote.expires_at);
  const blocked = busy || !!pending || !storageReady;
  const kind: "reset" | "approval" | "swap" | undefined =
    allowed === undefined || !quote
      ? undefined
      : allowed >= BigInt(quote.request.amount)
        ? "swap"
        : allowed === 0n
          ? "approval"
          : "reset";
  const errorCode = err instanceof Error ? err.message : "";
  const errorText = p.errors[errorCode as keyof typeof p.errors] || error(err);
  async function getQuote(signal: AbortSignal) {
    if (!source || !address) return;
    setQuote(undefined);
    setAllowed(undefined);
    setConsent(false);
    const q = await client.quote(
      {
        from_network: from,
        to_network: to,
        from_token: fromToken,
        to_token: toToken,
        amount: toUnits(amount, source.decimals),
        wallet: address,
        slippage_bps: slippage,
      },
      signal,
    );
    signal.throwIfAborted();
    if (
      q.from_token.decimals !== source.decimals ||
      q.to_token.decimals !==
        catalog[1].find((t) => t.address === toToken)?.decimals
    )
      throw new Error("invalid_request");
    setQuote(q);
    const a = await walletActions.allowance(getWallet(), q, signal);
    signal.throwIfAborted();
    setAllowed(a);
  }
  async function track(signal: AbortSignal) {
    if (!pending?.hash) return;
    const state =
      pending.kind === "approval"
        ? await walletActions.approvalReceipt(getWallet(), pending, signal)
        : (await client.status(pending.from, pending.to, pending.hash, signal))
            .state;
    signal.throwIfAborted();
    if (state === "completed" || state === "failed") {
      walletActions.savePending(workspace, null);
      setPending(null);
      setNotice(
        state === "failed"
          ? p.failed
          : pending.kind === "approval"
            ? p.approvalDone
            : p.completed,
      );
    } else setNotice(state === "pending" ? p.pending : p.unknown);
  }

  const connect = () =>
    run(async (signal) => {
      const w = window.ethereum;
      if (!w) throw new Error("wallet_missing");
      const a = await walletActions.connect(w);
      signal.throwIfAborted();
      wallet.current = w;
      setAddress(a);
      clearQuote();
    });
  const checkAllowance = () =>
    run(async (signal) => {
      if (quote)
        setAllowed(await walletActions.allowance(getWallet(), quote, signal));
    });
  const switchChain = () =>
    run(async (signal) => {
      if (!quote) return;
      await getWallet().request({
        method: "wallet_switchEthereumChain",
        params: [
          {
            chainId:
              "0x" +
              BigInt(quote.request.from_network.split(":")[1]).toString(16),
          },
        ],
      });
      setAllowed(await walletActions.allowance(getWallet(), quote, signal));
    });
  const submit = () =>
    run(async (signal) => {
      if (!quote || !kind) return;
      try {
        await walletActions.submit(
          getWallet(),
          workspace,
          quote,
          kind,
          signal,
          (value) => {
            if (mounted.current) setPending(value);
          },
        );
      } finally {
        if (mounted.current) {
          setQuote(undefined);
          setAllowed(undefined);
          setConsent(false);
        }
      }
    });
  const recover = (hash: string) =>
    run(async () => {
      if (!pending) return;
      const next = { ...pending, hash, state: "submitted" as const };
      walletActions.savePending(workspace, next);
      setPending(next);
    });
  const clear = () =>
    run(async () => {
      walletActions.savePending(workspace, null);
      setPending(null);
    });
  return {
    p,
    from,
    setFrom,
    to,
    setTo,
    fromToken,
    setFromToken,
    toToken,
    setToToken,
    catalog,
    catalogBusy,
    setReload,
    amount,
    setAmount,
    slippage,
    setSlippage,
    address,
    quote,
    consent,
    setConsent,
    busy,
    err,
    setErr,
    errorText,
    notice,
    pending,
    expired,
    blocked,
    kind,
    source,
    clearQuote,
    connect,
    checkAllowance,
    switchChain,
    submit,
    recover,
    clear,
    refresh: () => run(getQuote),
    track: () => run(track),
    locked: walletActions.isBusy(workspace),
  };
}
