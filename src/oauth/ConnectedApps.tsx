import { useCallback, useState } from "react";
import { api, result } from "../api/client";
import { useLocale } from "../i18n/Locale";
import { useRemote, Remote } from "../components/Remote";
import { oauthCopy } from "./copy";
export function ConnectedApps() {
  const { lang, error } = useLocale();
  const p = oauthCopy[lang];
  const load = useCallback(
    async () => result(await api.GET("/v1/oauth/grants")),
    [],
  );
  const grants = useRemote(load);
  const [busy, setBusy] = useState<string>();
  const [err, setErr] = useState<unknown>(null);
  return (
    <section className="panel">
      <div className="panel-head">
        <h2>{p.grants}</h2>
      </div>
      <div className="panel-body fields">
        <p>{p.note}</p>
        <Remote busy={grants.busy} err={grants.err} retry={grants.refresh}>
          {grants.data?.length === 0 && <p>{p.empty}</p>}
          {grants.data?.map((g) => (
            <article className="panel panel-body fields" key={g.id}>
              <strong>{g.client_name}</strong>
              <code>{g.scope}</code>
              {g.wallet && <code>{g.wallet}</code>}
              <small>
                {p.expiry}: {new Date(g.expires_at).toLocaleString(lang)}
              </small>
              <button
                className="btn small"
                disabled={Boolean(busy)}
                onClick={async () => {
                  if (!confirm(p.confirm)) return;
                  setBusy(g.id);
                  setErr(null);
                  try {
                    result(
                      await api.DELETE("/v1/oauth/grants/{id}", {
                        params: { path: { id: g.id } },
                      }),
                    );
                    grants.refresh();
                  } catch (e) {
                    setErr(e);
                  } finally {
                    setBusy(undefined);
                  }
                }}
              >
                {p.revoke}
              </button>
            </article>
          ))}
        </Remote>
        {err != null && (
          <div role="alert" className="notice error">
            {error(err)}
          </div>
        )}
      </div>
    </section>
  );
}
