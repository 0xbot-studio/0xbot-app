import { useState } from "react";
import { api, result } from "../api/client";
import type { components } from "../api/schema";
import { useLocale } from "../i18n/Locale";
import { useQuery } from "../playground/execution/useQuery";
import { WalletBoundary } from "./WalletBoundary";
import { messageCopy } from "./copy";
export function SendMessagePage() {
  const [revision, setRevision] = useState(0);
  return (
    <WalletBoundary>
      {(wallet) => (
        <SendForm
          key={revision}
          wallet={wallet}
          onReset={() => setRevision((v) => v + 1)}
        />
      )}
    </WalletBoundary>
  );
}
export function SendForm({
  wallet,
  onReset,
}: {
  wallet: string;
  onReset: () => void;
}) {
  const { lang, error } = useLocale();
  const p = messageCopy[lang];
  const [to, setTo] = useState("");
  const [body, setBody] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [pending, setPending] =
    useState<components["schemas"]["MessageSendInput"]>();
  const q = useQuery<components["schemas"]["MessageResult"]>();
  const ready =
    /^0x[0-9a-fA-F]{40}$/.test(to) &&
    !/^0x0{40}$/.test(to) &&
    body.trim() !== "" &&
    new TextEncoder().encode(body).length <= 4096 &&
    confirmed;
  const err =
    q.err instanceof Error
      ? p.errors[q.err.message] || error(q.err)
      : error(q.err);
  return (
    <form
      className="panel panel-body fields"
      onSubmit={(e) => {
        e.preventDefault();
        if (q.busy || q.out || (!pending && !ready)) return;
        const request = pending || {
          from: wallet,
          to,
          body,
          idempotency_key: crypto.randomUUID(),
          provider: "padin-inbox",
        };
        setPending(request);
        void q.run(JSON.stringify(request), async (signal) =>
          result(
            await api.POST("/v1/messages/send", { body: request, signal }),
          ),
        );
      }}
    >
      <h3>{p.send}</h3>
      <fieldset disabled={q.busy || Boolean(pending)} className="query-fields">
        <label>
          {p.to}
          <input
            value={to}
            onChange={(e) => {
              setTo(e.target.value);
              setConfirmed(false);
            }}
          />
        </label>
        <label>
          {p.body}
          <textarea
            rows={6}
            value={body}
            onChange={(e) => {
              setBody(e.target.value);
              setConfirmed(false);
            }}
          />
        </label>
        <label>
          <input
            type="checkbox"
            checked={confirmed}
            onChange={(e) => setConfirmed(e.target.checked)}
          />
          {p.confirm}
        </label>
      </fieldset>
      <button
        className="btn primary"
        disabled={q.busy || Boolean(q.out) || (!pending && !ready)}
      >
        {q.busy ? p.loading : pending ? p.retry : p.run}
      </button>
      {q.busy && (
        <button type="button" className="btn" onClick={q.cancel}>
          {p.cancel}
        </button>
      )}
      {pending && (
        <>
          <label>
            {p.key}
            <code>{pending.idempotency_key}</code>
          </label>
          <pre className="query-snapshot">
            {JSON.stringify(pending, null, 2)}
          </pre>
        </>
      )}
      {q.err != null && <p role="alert">{err}</p>}
      {pending && !q.out && !q.busy && <p className="notice">{p.unknown}</p>}
      {q.out && (
        <div role="status">
          <p>{p.stored}</p>
          <code>{q.out.value.data.id}</code>
        </div>
      )}
      {pending && !q.busy && (
        <button
          type="button"
          className="btn"
          onClick={() => {
            if (!q.out && !confirm(p.resetWarning)) return;
            onReset();
          }}
        >
          {p.reset}
        </button>
      )}
    </form>
  );
}
