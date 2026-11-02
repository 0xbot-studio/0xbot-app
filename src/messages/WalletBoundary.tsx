import { useCallback, useState, type ReactNode } from "react";
import { api, result } from "../api/client";
import { Remote, useRemote } from "../components/Remote";
import { useLocale } from "../i18n/Locale";
import { messageCopy } from "./copy";
export function WalletBoundary({
  children,
}: {
  children: (wallet: string) => ReactNode;
}) {
  const { lang } = useLocale();
  const p = messageCopy[lang];
  const load = useCallback(
    async () => result(await api.GET("/v1/auth/me")),
    [],
  );
  const state = useRemote(load);
  const [selected, setSelected] = useState("");
  const wallets =
    state.data?.identities
      .filter((i) => i.kind === "wallet")
      .map((i) => i.subject) || [];
  const wallet = wallets.includes(selected) ? selected : wallets[0] || "";
  return (
    <section className="stack">
      <h2>PADIN Inbox</h2>
      <p className="notice">{p.note}</p>
      <p>{p.permission}</p>
      <Remote busy={state.busy} err={state.err} retry={state.refresh}>
        {wallet ? (
          <>
            <label>
              {p.wallet}
              <select
                value={wallet}
                onChange={(e) => setSelected(e.target.value)}
              >
                {wallets.map((w) => (
                  <option key={w}>{w}</option>
                ))}
              </select>
            </label>
            <div key={state.data?.id + wallet}>{children(wallet)}</div>
          </>
        ) : (
          <p>
            {p.needWallet} <a href="#settings">{p.account}</a>
          </p>
        )}
      </Remote>
    </section>
  );
}
