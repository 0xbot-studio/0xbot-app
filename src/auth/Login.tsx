import { useEffect, useState } from "react";
import { ArrowUpRight, Wallet, ShieldCheck, LoaderCircle } from "lucide-react";
import { api, API_URL, result } from "../api/client";
import { walletLogin } from "./wallet";
import { useLocale } from "../i18n/Locale";
export function Login({ onLogin }: { onLogin: () => Promise<void> }) {
  const { t, lang, setLang, error } = useLocale();
  const [busy, setBusy] = useState(false);
  const [x, setX] = useState(false);
  const [err, setErr] = useState<unknown>(null);
  useEffect(() => {
    api
      .GET("/v1/auth/options")
      .then(result)
      .then((o) => setX(o.x))
      .catch(setErr);
    const code = new URLSearchParams(location.search).get("auth_error");
    if (code) {
      setErr(new Error(code));
      history.replaceState(null, "", location.pathname);
    }
  }, []);
  return (
    <div className="login-layout">
      <section className="login-story">
        <a className="brand" href="https://0xbot.org">
          <span className="brand-mark">0x</span>0xbot
        </a>
        <div>
          <div className="eyebrow">WEB3 PROVIDER GATEWAY</div>
          <h1>{t.welcome}</h1>
          <p>{t.loginSubtitle}</p>
          <div className="login-path">
            <span>YOUR APP</span>
            <i />
            <span className="login-path-brand">0xbot</span>
            <i />
            <span>WEB3</span>
          </div>
        </div>
        <small>{t.signatureNote}</small>
      </section>
      <section className="login-form-side">
        <button
          className="btn small locale-float"
          onClick={() => setLang(lang === "en" ? "zh" : "en")}
        >
          {t.language}
        </button>
        <div className="login-form">
          <div className="icon-tile">
            <Wallet size={22} />
          </div>
          <h2>{t.loginTitle}</h2>
          <p>{t.loginIntro}</p>
          <div className="stack">
            <button
              className="btn primary"
              disabled={busy}
              onClick={async () => {
                setBusy(true);
                setErr(null);
                try {
                  await walletLogin();
                  await onLogin();
                } catch (e) {
                  setErr(e);
                } finally {
                  setBusy(false);
                }
              }}
            >
              {busy ? (
                <LoaderCircle className="spin" size={17} />
              ) : (
                <Wallet size={17} />
              )}{" "}
              {busy ? t.walletBusy : t.wallet}
            </button>
            <button
              className="btn"
              disabled={!x || busy}
              onClick={() => {
                location.href =
                  API_URL +
                  "/v1/auth/x/start?origin=" +
                  encodeURIComponent(location.origin);
              }}
            >
              <span className="x-mark">𝕏</span>
              {t.x}
              <ArrowUpRight size={15} />
            </button>
            {!x && <small className="muted">{t.xUnavailable}</small>}
          </div>
          {err != null && (
            <div className="notice error" role="alert">
              {error(err)}
            </div>
          )}
          <div className="login-foot">
            <ShieldCheck size={16} />
            <span>{t.loginNote}</span>
          </div>
        </div>
        <a
          className="text-link login-back"
          href={"https://0xbot.org/" + lang + "/"}
        >
          {t.backSite}
          <ArrowUpRight size={13} />
        </a>
      </section>
    </div>
  );
}
