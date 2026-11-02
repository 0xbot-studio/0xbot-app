import { useCallback, useState } from "react";
import { KeyRound, Plus } from "lucide-react";
import { api, result } from "../api/client";
import { useLocale } from "../i18n/Locale";
import { Remote, useRemote } from "../components/Remote";
import { Code } from "../components/Code";
export function Keys() {
  const { t, error, lang } = useLocale();
  const [name, setName] = useState("");
  const [secret, setSecret] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<unknown>(null);
  const load = useCallback(async () => result(await api.GET("/v1/keys")), []);
  const state = useRemote(load);
  return (
    <div className="stack">
      <section className="panel panel-body">
        <form
          className="form-actions"
          onSubmit={async (e) => {
            e.preventDefault();
            setBusy(true);
            setErr(null);
            setSecret("");
            try {
              const d = result(await api.POST("/v1/keys", { body: { name } }));
              setSecret(d.secret);
              setName("");
              state.refresh();
            } catch (e) {
              setErr(e);
            } finally {
              setBusy(false);
            }
          }}
        >
          <label>
            {t.keyName}
            <input
              required
              maxLength={80}
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder={t.keyPlaceholder}
            />
          </label>
          <button className="btn primary" disabled={busy || !!secret}>
            <Plus size={15} />
            {t.createKey}
          </button>
        </form>
      </section>
      {secret && (
        <div className="secret-box">
          <strong>{t.keySecret}</strong>
          <Code label="API key · data:read" value={secret} />
          <button className="btn small" onClick={() => setSecret("")}>
            {t.dismiss}
          </button>
        </div>
      )}
      {err != null && (
        <div role="alert" className="notice error">
          {error(err)}
        </div>
      )}
      <section className="panel">
        <div className="panel-head">
          <h2>{t.keys}</h2>
          <span className="badge">data:read</span>
        </div>
        <Remote busy={state.busy} err={state.err} retry={state.refresh}>
          {state.data?.length ? (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>{t.name}</th>
                    <th>{t.prefix}</th>
                    <th>{t.status}</th>
                    <th>{t.created}</th>
                    <th>{t.actions}</th>
                  </tr>
                </thead>
                <tbody>
                  {state.data.map((k) => (
                    <tr key={k.id}>
                      <td>
                        {k.name}
                        <small className="block muted">{k.scope}</small>
                      </td>
                      <td>
                        <code>{k.prefix}…</code>
                      </td>
                      <td>
                        <span
                          className={"badge " + (!k.revoked_at ? "green" : "")}
                        >
                          {k.revoked_at ? t.revoked : t.active}
                        </span>
                      </td>
                      <td>{new Date(k.created_at).toLocaleDateString(lang)}</td>
                      <td>
                        <button
                          className="btn small"
                          disabled={!!k.revoked_at || busy}
                          onClick={async () => {
                            if (!confirm(t.revokeConfirm)) return;
                            setBusy(true);
                            setErr(null);
                            try {
                              result(
                                await api.DELETE("/v1/keys/{id}", {
                                  params: { path: { id: k.id } },
                                }),
                              );
                              state.refresh();
                            } catch (e) {
                              setErr(e);
                            } finally {
                              setBusy(false);
                            }
                          }}
                        >
                          {t.revoke}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="empty">
              <span className="icon-tile">
                <KeyRound size={21} />
              </span>
              <h3>{t.emptyKeys}</h3>
              <p>{t.emptyKeysText}</p>
            </div>
          )}
        </Remote>
      </section>
    </div>
  );
}
