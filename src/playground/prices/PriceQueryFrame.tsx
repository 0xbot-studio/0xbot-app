import type { ReactNode } from "react";
import type { components } from "../../api/schema";
import { useLocale } from "../../i18n/Locale";
import { useQuery } from "../execution/useQuery";
import { RequestExamples } from "../components/RequestExamples";
import { playgroundCopy } from "../copy";
import { priceCopy } from "./copy";
type Result = components["schemas"]["PriceResult"];
export function PriceQueryFrame({
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
  const { lang, t, error } = useLocale();
  const p = priceCopy[lang],
    q = useQuery<Result>(),
    snapshot = JSON.stringify(body);
  const key = q.err instanceof Error ? q.err.message : "";
  const message = p.errors[key as keyof typeof p.errors] || error(q.err);
  return (
    <div className="stack">
      <h2>{title}</h2>
      <p className="notice">{p.note}</p>
      <div className="playground-grid">
        <section className="panel">
          <div className="panel-head">
            <code>{capability}</code>
            <span className="badge green">{t.readOnly}</span>
          </div>
          <form
            className="panel-body fields"
            onSubmit={(e) => {
              e.preventDefault();
              if (ready && !q.busy) void q.run(snapshot, execute);
            }}
          >
            <fieldset className="query-fields" disabled={q.busy}>
              {children}
            </fieldset>
            <button className="btn primary" disabled={!ready || q.busy}>
              {q.busy ? t.running : t.run}
            </button>
            {q.busy && (
              <button className="btn" type="button" onClick={q.cancel}>
                {t.cancel}
              </button>
            )}
            {q.err != null && (
              <p role="alert" className="notice error">
                {message}
              </p>
            )}
            {q.cancelled && (
              <p role="status">{playgroundCopy[lang].cancelNote}</p>
            )}
          </form>
        </section>
        <section className="panel panel-body fields">
          {q.out ? (
            <>
              {snapshot !== q.out.snapshot && (
                <p className="notice">{p.changed}</p>
              )}
              <span className="badge">
                {q.out.value.data.cached ? p.cached : p.fresh}
              </span>
              <h2>{q.out.value.data.price} USD</h2>
              <p>{q.out.value.data.asset || q.out.value.data.symbol}</p>
              <dl>
                <dt>{p.source}</dt>
                <dd>{q.out.value.data.source}</dd>
                <dt>{p.updated}</dt>
                <dd>{q.out.value.data.updated_at}</dd>
                <dt>{p.fetched}</dt>
                <dd>{q.out.value.data.fetched_at}</dd>
                <dt>{p.confidence}</dt>
                <dd>{q.out.value.data.confidence}</dd>
              </dl>
              <pre className="result-json">
                {JSON.stringify(q.out.value, null, 2)}
              </pre>
              <strong>{p.snapshot}</strong>
              <pre className="query-snapshot">
                {JSON.stringify(JSON.parse(q.out.snapshot), null, 2)}
              </pre>
            </>
          ) : (
            <div className="empty" role="status">
              {q.busy ? t.running : t.resultEmpty}
            </div>
          )}
        </section>
      </div>
      <RequestExamples endpoint={endpoint} tool={tool} body={body} />
    </div>
  );
}
