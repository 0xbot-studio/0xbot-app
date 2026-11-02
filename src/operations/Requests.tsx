import { useCallback, useState } from "react";
import { Activity, ArrowRight, RefreshCw } from "lucide-react";
import { api, result, type Operation } from "../api/client";
import { Remote, useRemote } from "../components/Remote";
import { useLocale } from "../i18n/Locale";
export function RequestTable({ data }: { data: Operation[] }) {
  const { t, lang } = useLocale();
  if (!data.length)
    return (
      <div className="empty">
        <span className="icon-tile">
          <Activity size={21} />
        </span>
        <h3>{t.emptyRequests}</h3>
        <p>{t.emptyRequestsText}</p>
        <a href="#playground" className="text-link row">
          {t.openPlayground}
          <ArrowRight size={14} />
        </a>
      </div>
    );
  return (
    <div className="table-wrap">
      <table>
        <thead>
          <tr>
            <th>{t.requestID}</th>
            <th>{t.provider}</th>
            <th>{t.status}</th>
            <th>{t.latency}</th>
            <th>{t.created}</th>
          </tr>
        </thead>
        <tbody>
          {data.map((r) => (
            <tr key={r.id}>
              <td>
                <code title={r.id}>{r.id.slice(0, 12)}…</code>
                <small className="block muted">{r.capability}</small>
              </td>
              <td>{r.provider || "—"}</td>
              <td>
                <span
                  className={
                    "badge " + (r.status === "succeeded" ? "green" : "orange")
                  }
                >
                  {r.status === "succeeded" ? t.successful : t.failed}
                </span>
                {r.error_code && (
                  <small className="block muted">{r.error_code}</small>
                )}
              </td>
              <td>{r.latency_ms} ms</td>
              <td>{new Date(r.created_at).toLocaleString(lang)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
export function Requests() {
  const { t } = useLocale();
  const [offset, setOffset] = useState(0);
  const load = useCallback(
    async () =>
      result(
        await api.GET("/v1/operations", {
          params: { query: { limit: 25, offset } },
        }),
      ),
    [offset],
  );
  const state = useRemote(load);
  return (
    <>
      <section className="panel">
        <div className="panel-head">
          <h2>{t.requests}</h2>
          <button className="btn small" onClick={state.refresh}>
            <RefreshCw size={13} />
            {t.refresh}
          </button>
        </div>
        <Remote busy={state.busy} err={state.err} retry={state.refresh}>
          <RequestTable data={state.data || []} />
        </Remote>
      </section>
      <div className="pagination">
        <button
          className="btn small"
          disabled={offset === 0 || state.busy}
          onClick={() => setOffset(Math.max(0, offset - 25))}
        >
          {t.previous}
        </button>
        <button
          className="btn small"
          disabled={state.busy || !state.data || state.data.length < 25}
          onClick={() => setOffset(offset + 25)}
        >
          {t.next}
        </button>
      </div>
    </>
  );
}
