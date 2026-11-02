import { useState, type ReactNode } from "react";
import { useLocale } from "../../i18n/Locale";
import type { BalanceResult, BalancesResult } from "../../api/client";
import { BalanceResults } from "../BalanceResults";
import { playgroundCopy } from "../copy";
import { useQuery } from "../execution/useQuery";
import { RequestExamples } from "../components/RequestExamples";
type Result = BalanceResult | BalancesResult;
export function BalanceQueryFrame({
  title,
  capability,
  endpoint,
  tool,
  body,
  ready,
  execute,
  children,
}: {
  title: string;
  capability: string;
  endpoint: string;
  tool: string;
  body: object;
  ready: boolean;
  execute: (signal: AbortSignal) => Promise<Result>;
  children: ReactNode;
}) {
  const { t, lang, error } = useLocale();
  const p = playgroundCopy[lang];
  const query = useQuery<Result>();
  const [tab, setTab] = useState<"overview" | "json" | "request">("overview");
  const snapshot = JSON.stringify(body);
  const result = query.out?.value;
  return (
    <div className="stack">
      <div className="row between">
        <h2>{title}</h2>
        <span className="badge green">{t.readOnly}</span>
      </div>
      <div className="playground-grid">
        <section className="panel query-panel">
          <div className="panel-head">
            <code>{capability}</code>
          </div>
          <form
            className="panel-body fields"
            onSubmit={(e) => {
              e.preventDefault();
              if (ready && !query.busy) void query.run(snapshot, execute);
            }}
          >
            <fieldset disabled={query.busy} className="query-fields">
              {children}
            </fieldset>
            <button className="btn primary" disabled={!ready || query.busy}>
              {query.busy ? t.running : t.run}
            </button>
            {query.busy && (
              <button type="button" className="btn" onClick={query.cancel}>
                {t.cancel}
              </button>
            )}
            <small className="muted">{t.freeNote}</small>
            {query.err != null && (
              <div className="notice error" role="alert">
                {error(query.err)}
              </div>
            )}
            {query.cancelled && (
              <div className="notice" role="status">
                {p.cancelNote}
              </div>
            )}
          </form>
        </section>
        <section className="panel result-panel">
          <div className="panel-head">
            <h2>{t.result}</h2>
            {result && (
              <span className="badge green">{result.latency_ms} ms</span>
            )}
          </div>
          {result ? (
            <>
              <div className="panel-body query-tabs">
                {(["overview", "json", "request"] as const).map((item) => (
                  <button
                    key={item}
                    className="btn small"
                    aria-pressed={tab === item}
                    onClick={() => setTab(item)}
                  >
                    {p[item]}
                  </button>
                ))}
              </div>
              {query.out?.snapshot !== snapshot && (
                <div className="notice" role="status">
                  {p.changed}
                </div>
              )}
              {tab === "overview" && (
                <BalanceResults
                  rows={
                    Array.isArray(result.data) ? result.data : [result.data]
                  }
                />
              )}
              {tab === "json" && (
                <pre className="result-json">
                  {JSON.stringify(result, null, 2)}
                </pre>
              )}
              {tab === "request" && (
                <div className="panel-body fields">
                  <code>{result.id}</code>
                  <small>
                    {t.provider}: {result.provider}
                  </small>
                  <small>
                    {p.fee}: {result.fee_usd}
                  </small>
                  <strong>{p.snapshot}</strong>
                  <pre className="query-snapshot">
                    {JSON.stringify(JSON.parse(query.out!.snapshot), null, 2)}
                  </pre>
                </div>
              )}
            </>
          ) : (
            <div className="empty" role="status">
              <h3>{query.busy ? t.running : t.resultEmpty}</h3>
              <p>{t.resultEmptyText}</p>
            </div>
          )}
        </section>
      </div>
      <RequestExamples endpoint={endpoint} tool={tool} body={body} />
    </div>
  );
}
