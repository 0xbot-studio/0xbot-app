import { useCallback } from "react";
import {
  Activity,
  Check,
  TriangleAlert,
  Coins,
  ArrowUpRight,
  ArrowRight,
  KeyRound,
  Terminal,
  Layers,
} from "lucide-react";
import { api, result } from "../api/client";
import { Remote, useRemote } from "../components/Remote";
import { RequestTable } from "../operations/Requests";
import { useLocale } from "../i18n/Locale";
import { Code } from "../components/Code";
export function Metrics({ usage = false }: { usage?: boolean }) {
  const { t, lang } = useLocale();
  const load = useCallback(async () => result(await api.GET("/v1/usage")), []);
  const state = useRemote(load);
  const d = state.data;
  return (
    <Remote busy={state.busy} err={state.err} retry={state.refresh}>
      <div className="metrics">
        {[
          { label: t.totalRequests, value: d?.requests, Icon: Activity },
          { label: t.successful, value: d?.succeeded, Icon: Check },
          { label: t.failed, value: d?.failed, Icon: TriangleAlert },
          { label: t.fees, value: "$" + (d?.fee_usd || "0"), Icon: Coins },
        ].map(({ label, value, Icon }) => (
          <article className="metric" key={label}>
            <div className="metric-label">
              {label}
              <Icon size={14} />
            </div>
            <strong>
              {typeof value === "number" ? value.toLocaleString(lang) : value}
            </strong>
            <small>{t.month}</small>
          </article>
        ))}
      </div>
      {usage && (
        <section className="panel panel-body stack">
          <h2>{t.billing}</h2>
          <p className="muted">{t.billingText}</p>
          <span className="badge">{t.rateLimit}</span>
        </section>
      )}
    </Remote>
  );
}
export function Overview() {
  const { t } = useLocale();
  const load = useCallback(
    async () =>
      result(
        await api.GET("/v1/operations", { params: { query: { limit: 5 } } }),
      ),
    [],
  );
  const state = useRemote(load);
  return (
    <>
      <Metrics />
      <div className="quickstart">
        <div>
          <div className="eyebrow">QUICKSTART</div>
          <h2 style={{ marginTop: 12 }}>{t.quickstart}</h2>
          <p>{t.quickstartText}</p>
        </div>
        <div className="row">
          <a className="btn primary" href="#keys">
            <KeyRound size={14} />
            {t.createKey}
          </a>
          <a className="btn ghost" href="#playground">
            {t.openPlayground}
            <ArrowUpRight size={14} />
          </a>
        </div>
      </div>
      <div className="overview-grid">
        <section className="panel">
          <div className="panel-head">
            <h2>{t.recent}</h2>
            <a href="#requests" className="text-link row">
              {t.viewAll}
              <ArrowRight size={13} />
            </a>
          </div>
          <Remote busy={state.busy} err={state.err} retry={state.refresh}>
            <RequestTable data={state.data || []} />
          </Remote>
        </section>
        <section className="panel">
          <div className="panel-head">
            <h2>{t.mcp}</h2>
            <Terminal size={17} />
          </div>
          <div className="panel-body stack">
            <p className="muted" style={{ fontSize: 12 }}>
              {t.mcpText}
            </p>
            <Code
              label="Streamable HTTP"
              value={
                "https://api.0xbot.org/mcp\n\nAuthorization:\nBearer <YOUR_API_KEY>"
              }
            />
            <a
              href="https://0xbot.org/en/docs/"
              className="text-link row"
              target="_blank"
              rel="noreferrer"
            >
              {t.docs}
              <ArrowUpRight size={13} />
            </a>
          </div>
        </section>
      </div>
      <section className="panel panel-body row">
        <span className="icon-tile">
          <Layers size={20} />
        </span>
        <div>
          <h3 style={{ fontSize: 13, marginBottom: 5 }}>{t.roadmap}</h3>
          <p className="muted" style={{ fontSize: 12 }}>
            {t.roadmapText}
          </p>
        </div>
      </section>
    </>
  );
}
