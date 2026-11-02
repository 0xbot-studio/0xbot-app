import { useEffect, useState } from "react";
import { Wallet, Link } from "lucide-react";
import { api, result, API_URL, type User } from "../api/client";
import { walletLogin } from "../auth/wallet";
import { useLocale } from "../i18n/Locale";
import { ConnectedApps } from "../oauth/ConnectedApps";
export function Account({
  user,
  reload,
}: {
  user: User;
  reload: () => Promise<void>;
}) {
  const { t, error } = useLocale();
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<unknown>(null);
  const [x, setX] = useState(false);
  useEffect(() => {
    api
      .GET("/v1/auth/options")
      .then(result)
      .then((o) => setX(o.x))
      .catch(setErr);
  }, []);
  return (
    <div className="stack">
      <ConnectedApps />
      <section className="panel">
        <div className="panel-head">
          <h2>{t.identities}</h2>
          <Link size={17} />
        </div>
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>{t.identityKind}</th>
                <th>{t.identitySubject}</th>
              </tr>
            </thead>
            <tbody>
              {user.identities.map((i) => (
                <tr key={i.kind + i.subject}>
                  <td>{i.kind === "wallet" ? "Wallet" : "X"}</td>
                  <td>
                    <code>{i.subject}</code>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="panel-body stack">
          <div className="row wrap">
            <button
              className="btn"
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                setErr(null);
                try {
                  await walletLogin(true);
                  await reload();
                } catch (e) {
                  setErr(e);
                } finally {
                  setBusy(false);
                }
              }}
            >
              <Wallet size={15} />
              {t.linkWallet}
            </button>
            <button
              className="btn"
              disabled={!x}
              onClick={() => {
                location.href =
                  API_URL +
                  "/v1/auth/x/start?link=true&origin=" +
                  encodeURIComponent(location.origin);
              }}
            >
              𝕏 {t.linkX}
            </button>
          </div>
          <small className="muted">{t.linkNote}</small>
          {err != null && (
            <div className="notice error" role="alert">
              {error(err)}
            </div>
          )}
        </div>
      </section>
      <section className="panel panel-body account-details">
        <div>
          <small>{t.accountID}</small>
          <code>{user.id}</code>
        </div>
        <div>
          <small>{t.workspaceID}</small>
          <code>{user.workspace_id}</code>
        </div>
      </section>
    </div>
  );
}
