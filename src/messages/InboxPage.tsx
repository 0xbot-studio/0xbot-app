import { useState } from "react";
import { api, result } from "../api/client";
import type { components } from "../api/schema";
import { useLocale } from "../i18n/Locale";
import { useQuery } from "../playground/execution/useQuery";
import { WalletBoundary } from "./WalletBoundary";
import { messageCopy } from "./copy";
import { MessageDetail } from "./MessageDetailPage";
export function InboxPage() {
  return (
    <WalletBoundary>{(wallet) => <Inbox wallet={wallet} />}</WalletBoundary>
  );
}
function Inbox({ wallet }: { wallet: string }) {
  const { lang, error } = useLocale();
  const p = messageCopy[lang];
  const q = useQuery<components["schemas"]["MessageListResult"]>();
  const [selected, setSelected] = useState("");
  function load(cursor = "") {
    if (q.busy) return;
    setSelected("");
    void q.run(cursor, async (signal) =>
      result(
        await api.POST("/v1/messages/list", {
          body: { address: wallet, cursor, limit: 20, provider: "padin-inbox" },
          signal,
        }),
      ),
    );
  }
  return (
    <div className="stack">
      <section className="panel panel-body fields">
        <h3>{p.inbox}</h3>
        <button className="btn" disabled={q.busy} onClick={() => load()}>
          {q.busy ? p.loading : p.list}
        </button>
        {q.err != null && (
          <p role="alert">
            {q.err instanceof Error
              ? p.errors[q.err.message] || error(q.err)
              : error(q.err)}
          </p>
        )}
        {q.out?.value.data.messages?.length === 0 && <p>{p.empty}</p>}
        {q.out?.value.data.messages?.map((m) => (
          <article className="panel panel-body fields" key={m.id}>
            <code>{m.from}</code>
            <small>{m.created_at}</small>
            <code>{m.id}</code>
            <button className="btn" onClick={() => setSelected(m.id)}>
              {p.read}
            </button>
          </article>
        ))}
        {q.out?.value.data.next_cursor && (
          <button
            className="btn"
            disabled={q.busy}
            onClick={() => load(q.out?.value.data.next_cursor)}
          >
            {p.next}
          </button>
        )}
      </section>
      {selected && (
        <MessageDetail key={selected} wallet={wallet} initialID={selected} />
      )}
    </div>
  );
}
