import { useState } from "react";
import { api, result } from "../api/client";
import type { components } from "../api/schema";
import { useLocale } from "../i18n/Locale";
import { useQuery } from "../playground/execution/useQuery";
import { WalletBoundary } from "./WalletBoundary";
import { messageCopy } from "./copy";
export function MessageDetailPage() {
  return (
    <WalletBoundary>
      {(wallet) => <MessageDetail wallet={wallet} />}
    </WalletBoundary>
  );
}
export function MessageDetail({
  wallet,
  initialID = "",
}: {
  wallet: string;
  initialID?: string;
}) {
  const { lang, error } = useLocale();
  const p = messageCopy[lang];
  const [id, setID] = useState(initialID);
  const q = useQuery<components["schemas"]["MessageResult"]>();
  return (
    <form
      className="panel panel-body fields"
      onSubmit={(e) => {
        e.preventDefault();
        if (q.busy || !/^[a-f0-9]{64}$/.test(id)) return;
        void q.run(id, async (signal) =>
          result(
            await api.POST("/v1/messages/get", {
              body: { address: wallet, id, provider: "padin-inbox" },
              signal,
            }),
          ),
        );
      }}
    >
      <h3>{p.detail}</h3>
      <label>
        {p.id}
        <input
          value={id}
          onChange={(e) => setID(e.target.value)}
          disabled={q.busy}
        />
      </label>
      <button className="btn" disabled={q.busy || !/^[a-f0-9]{64}$/.test(id)}>
        {q.busy ? p.loading : p.read}
      </button>
      {q.err != null && (
        <p role="alert">
          {q.err instanceof Error
            ? p.errors[q.err.message] || error(q.err)
            : error(q.err)}
        </p>
      )}
      {q.out && (
        <article>
          <p className="notice">{p.untrusted}</p>
          {id !== q.out.snapshot && <p>{p.changed}</p>}
          <code>{q.out.value.data.from}</code>
          <p>{q.out.value.data.created_at}</p>
          <pre className="query-snapshot">{q.out.value.data.body}</pre>
        </article>
      )}
    </form>
  );
}
