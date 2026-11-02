import { useCallback, useState } from "react";
import { ArrowUpRight, RefreshCw } from "lucide-react";
import { api, result, type Provider } from "../api/client";
import { useRemote, Remote } from "./Remote";
import { useLocale } from "../i18n/Locale";
import { networkLabel } from "../api/networks";
function ProviderRow({
  provider: p,
  admin,
  refresh,
}: {
  provider: Provider;
  admin: boolean;
  refresh: () => void;
}) {
  const { t, error } = useLocale();
  const [enabled, setEnabled] = useState(p.enabled);
  const [priority, setPriority] = useState(p.priority);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<unknown>(null);
  return (
    <tr>
      <td>
        <div className="row">
          <span className={"provider-mark " + (p.id === "drpc" ? "olive" : "")}>
            {p.id.startsWith("drpc")
              ? "d"
              : p.id.startsWith("bnbchain")
                ? "B"
                : "P"}
          </span>
          <div>
            <strong>{p.name}</strong>
            <small className="block muted">{p.id}</small>
          </div>
        </div>
      </td>
      <td>
        {p.capabilities.map((capability) => (
          <small key={capability} className="block">
            <code>{capability}</code>
          </small>
        ))}
        <small className="block muted">
          {p.networks.map(networkLabel).join(", ")}
        </small>
      </td>
      <td>
        <span className="badge">{t.freePublic}</span>
        <small className="block muted">
          {t.upstreamCost}: ${p.upstream_fee_usd}
        </small>
        <small className="block muted">
          {t.platformCost}: ${p.platform_fee_usd}
        </small>
      </td>
      <td>
        <span
          className={
            "badge " + (p.health === "healthy" && p.enabled ? "green" : "")
          }
        >
          {!p.enabled ? t.disabled : t[p.health as "healthy"] || p.health}
        </span>
      </td>
      {admin ? (
        <>
          <td>
            <input
              aria-label={t.priority + " " + p.name}
              className="priority-input"
              type="number"
              min="1"
              max="100"
              value={priority}
              onChange={(e) => setPriority(Number(e.target.value))}
            />
          </td>
          <td>
            <input
              aria-label={t.enabled + " " + p.name}
              type="checkbox"
              checked={enabled}
              onChange={(e) => setEnabled(e.target.checked)}
            />
          </td>
          <td>
            <button
              className="btn small"
              disabled={
                busy || (enabled === p.enabled && priority === p.priority)
              }
              onClick={async () => {
                setBusy(true);
                setErr(null);
                try {
                  result(
                    await api.PATCH("/v1/admin/providers/{id}", {
                      params: { path: { id: p.id } },
                      body: { enabled, priority },
                    }),
                  );
                  refresh();
                } catch (e) {
                  setErr(e);
                } finally {
                  setBusy(false);
                }
              }}
            >
              {t.save}
            </button>
            {err != null && <small role="alert">{error(err)}</small>}
          </td>
        </>
      ) : (
        <td>
          <a
            className="text-link"
            aria-label={p.name}
            href={p.website}
            target="_blank"
            rel="noreferrer"
          >
            <ArrowUpRight size={16} />
          </a>
        </td>
      )}
    </tr>
  );
}
export function Providers({ admin = false }: { admin?: boolean }) {
  const { t } = useLocale();
  const load = useCallback(
    async () =>
      result(await api.GET(admin ? "/v1/admin/providers" : "/v1/providers")),
    [admin],
  );
  const state = useRemote(load);
  return (
    <div className="stack">
      <div className="notice">{t.publicLimits}</div>
      {admin && <div className="notice">{t.providerWarning}</div>}
      <section className="panel">
        <div className="panel-head">
          <h2>{t.catalog}</h2>
          <button className="btn small" onClick={state.refresh}>
            <RefreshCw size={13} />
            {t.refresh}
          </button>
        </div>
        <Remote busy={state.busy} err={state.err} retry={state.refresh}>
          <div className="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>{t.provider}</th>
                  <th>{t.capability}</th>
                  <th>{t.pricing}</th>
                  <th>{t.health}</th>
                  {admin && (
                    <>
                      <th>{t.priority}</th>
                      <th>{t.enabled}</th>
                    </>
                  )}
                  <th>{t.actions}</th>
                </tr>
              </thead>
              <tbody>
                {state.data?.map((p) => (
                  <ProviderRow
                    key={p.id + ":" + p.enabled + ":" + p.priority}
                    provider={p}
                    admin={admin}
                    refresh={state.refresh}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </Remote>
      </section>
    </div>
  );
}
