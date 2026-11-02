import { useState } from "react";
import { useLocale } from "../i18n/Locale";
import * as client from "./client";
import { swapCopy } from "./copy";

export function TokenSide({
  title,
  network,
  onNetwork,
  token,
  onToken,
  tokens,
  loading,
}: {
  title: string;
  network: string;
  onNetwork(v: string): void;
  token: string;
  onToken(v: string): void;
  tokens: client.Token[];
  loading: boolean;
}) {
  const { lang } = useLocale();
  const p = swapCopy[lang];
  const [search, setSearch] = useState("");
  const visible = tokens.filter(
    (t) =>
      t.address === token ||
      (t.symbol + " " + t.name + " " + t.address)
        .toLowerCase()
        .includes(search.toLowerCase()),
  );
  return (
    <div className="stack swap-side">
      <h3>{title}</h3>
      <label>
        {p.network}
        <select
          value={network}
          onChange={(e) => {
            setSearch("");
            onNetwork(e.target.value);
          }}
        >
          {client.networks.map(([id, name]) => (
            <option value={id} key={id}>
              {name}
            </option>
          ))}
        </select>
      </label>
      <label>
        {p.search}
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </label>
      <label>
        {p.token}
        <select
          value={token}
          disabled={loading}
          onChange={(e) => onToken(e.target.value)}
        >
          <option value="">
            {loading ? p.loading : tokens.length ? p.choose : p.empty}
          </option>
          {visible.map((t) => (
            <option key={t.address} value={t.address}>
              {t.symbol} · {t.address}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
