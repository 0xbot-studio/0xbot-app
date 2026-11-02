import type { ReactNode } from "react";
import { useLocale } from "../../i18n/Locale";
import { useQuery } from "../execution/useQuery";
import { RequestExamples } from "../components/RequestExamples";
import { playgroundCopy } from "../copy";
import { nftCopy } from "./copy";
type ReadResult = { id: string; latency_ms: number; data: object };
export function ReadQueryFrame<T extends ReadResult>({
  title,
  note,
  capability,
  endpoint,
  tool,
  body,
  ready,
  execute,
  children,
}: {
  title: string;
  note: string;
  capability: string;
  endpoint: string;
  tool: string;
  body: object;
  ready: boolean;
  execute: (signal: AbortSignal) => Promise<T>;
  children: ReactNode;
}) {
  const { lang, t, error } = useLocale();
  const n = nftCopy[lang];
  const query = useQuery<T>();
  const snapshot = JSON.stringify(body);
  const key = query.err instanceof Error ? query.err.message : "";
  const message = n.errors[key as keyof typeof n.errors] || error(query.err);
  return (
    <div className="stack">
      <div className="row between">
        <h2>{title}</h2>
        <span className="badge green">{t.readOnly}</span>
      </div>
      <p className="notice">{note}</p>
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
            <fieldset className="query-fields" disabled={query.busy}>
              {children}
            </fieldset>
            <small>{n.automatic}</small>
            <button className="btn primary" disabled={!ready || query.busy}>
              {query.busy ? t.running : t.run}
            </button>
            {query.busy && (
              <button type="button" className="btn" onClick={query.cancel}>
                {t.cancel}
              </button>
            )}
            {query.err != null && (
              <div className="notice error" role="alert">
                {message}
              </div>
            )}
            {query.cancelled && (
              <p role="status">{playgroundCopy[lang].cancelNote}</p>
            )}
          </form>
        </section>
        <section className="panel result-panel">
          <div className="panel-head">
            <h2>{n.status}</h2>
            {query.out && <span>{query.out.value.latency_ms} ms</span>}
          </div>
          {query.out ? (
            <div className="panel-body fields">
              {snapshot !== query.out.snapshot && (
                <p className="notice">{n.changed}</p>
              )}
              <small>{n.sourceNote}</small>
              <h3>{n.summary}</h3>
              <pre className="result-json">
                {JSON.stringify(query.out.value, null, 2)}
              </pre>
              <strong>{n.snapshot}</strong>
              <pre className="query-snapshot">
                {JSON.stringify(JSON.parse(query.out.snapshot), null, 2)}
              </pre>
            </div>
          ) : (
            <div className="empty" role="status">
              {query.busy ? t.running : t.resultEmpty}
            </div>
          )}
        </section>
      </div>
      <RequestExamples endpoint={endpoint} tool={tool} body={body} />
    </div>
  );
}
