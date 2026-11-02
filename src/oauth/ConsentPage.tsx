import { useCallback, useState } from "react";
import { api, result, type User } from "../api/client";
import { useLocale } from "../i18n/Locale";
import { Remote, useRemote } from "../components/Remote";
import { oauthCopy } from "./copy";
export function ConsentPage({ id, user }: { id: string; user: User }) {
  const { lang, setLang, t, error } = useLocale();
  const p = oauthCopy[lang];
  const load = useCallback(
    async () =>
      result(
        await api.GET("/v1/oauth/requests/{id}", { params: { path: { id } } }),
      ),
    [id],
  );
  const request = useRemote(load);
  const [busy, setBusy] = useState(false);
  const wallets = user.identities
    .filter((i) => i.kind === "wallet")
    .map((i) => i.subject);
  const [wallet, setWallet] = useState(wallets[0] || "");
  const privateMessages = request.data?.scope.includes("messages:");
  const [err, setErr] = useState<unknown>(null);
  async function decide(approve: boolean) {
    if (busy) return;
    setBusy(true);
    setErr(null);
    try {
      const out = result(
        await api.POST("/v1/oauth/requests/{id}", {
          params: { path: { id } },
          body: { approve, wallet: privateMessages ? wallet : undefined },
        }),
      );
      const target = new URL(out.redirect_uri);
      if (!["https:", "http:"].includes(target.protocol))
        throw new Error("invalid_request");
      location.assign(target.href);
    } catch (e) {
      setErr(e);
      setBusy(false);
    }
  }
  return (
    <main className="oauth-consent">
      <section className="panel panel-body fields">
        <div className="row between">
          <a className="brand" href="https://0xbot.org">
            0xbot
          </a>
          <button
            className="btn small"
            onClick={() => setLang(lang === "zh" ? "en" : "zh")}
          >
            {t.language}
          </button>
        </div>
        <h1>{p.title}</h1>
        <p>{p.intro}</p>
        {request.err ? (
          <div className="notice error" role="alert">
            {p.expired}
          </div>
        ) : (
          <Remote busy={request.busy} err={null} retry={request.refresh}>
            {request.data && (
              <>
                <div className="notice">{p.warning}</div>
                <label>
                  {p.client}
                  <strong>{request.data.client_name}</strong>
                  <code className="query-snapshot">
                    {request.data.client_id}
                  </code>
                </label>
                <label>
                  {p.callback}
                  <code className="query-snapshot">
                    {request.data.redirect_uri}
                  </code>
                </label>
                <label>
                  {p.account}
                  <strong>
                    {user.name} · {user.workspace_name}
                  </strong>
                  <code>{user.workspace_id}</code>
                </label>
                <strong>{p.permission}</strong>
                <code>{request.data.scope}</code>
                {request.data.scope.includes("rooms:") && (
                  <p className="notice">
                    {lang === "zh"
                      ? "讨论区权限：rooms:read 可读取公开讨论；rooms:write 可代表此工作区加入、提问，并在获邀轮次公开发言。不授予创建、控场或发布最终总结等后台权限。不是私密消息或端到端加密。"
                      : "Room permissions: rooms:read reads public discussions. rooms:write can join, ask questions and publish on an assigned turn as this workspace. It does not grant creation, moderation or final-summary administration. Discussions are not private or end-to-end encrypted."}
                  </p>
                )}
                {privateMessages && (
                  <>
                    <p className="notice">
                      {lang === "zh"
                        ? "此客户端将获得下列私信权限，只限选定的已验证钱包。PADIN Inbox 非端到端加密；AI及服务端可读取获授权的内容。"
                        : "This client receives the private-message permissions below for the selected verified wallet only. PADIN Inbox is not end-to-end encrypted; the authorized AI and service can read content."}
                    </p>
                    {request.data.scope.includes("messages:read") && (
                      <p>
                        {lang === "zh"
                          ? "读取收件列表与私信正文"
                          : "Read inbox and private message bodies"}
                      </p>
                    )}
                    {request.data.scope.includes("messages:send") && (
                      <p>
                        {lang === "zh"
                          ? "以选定钱包身份发送消息（写操作）"
                          : "Send messages as this wallet (write access)"}
                      </p>
                    )}
                    <label>
                      {lang === "zh" ? "授权钱包" : "Authorized wallet"}
                      <select
                        value={wallet}
                        onChange={(e) => setWallet(e.target.value)}
                        disabled={busy}
                      >
                        {wallets.map((w) => (
                          <option key={w}>{w}</option>
                        ))}
                      </select>
                    </label>
                    {!wallet && (
                      <a href="#settings">
                        {lang === "zh"
                          ? "先绑定并签名验证钱包"
                          : "Link and verify a wallet first"}
                      </a>
                    )}
                  </>
                )}
                <code>{request.data.resource}</code>
                <small className="muted">{p.limits}</small>
                <div className="row">
                  <button
                    className="btn primary"
                    disabled={busy || Boolean(privateMessages && !wallet)}
                    onClick={() => decide(true)}
                  >
                    {busy ? t.loading : p.approve}
                  </button>
                  <button
                    className="btn"
                    disabled={busy}
                    onClick={() => decide(false)}
                  >
                    {p.deny}
                  </button>
                </div>
              </>
            )}
          </Remote>
        )}
        {err != null && (
          <div className="notice error" role="alert">
            {err instanceof Error && err.message === "authorization_expired"
              ? p.expired
              : error(err)}
          </div>
        )}
        <a href="#settings">{p.return}</a>
      </section>
    </main>
  );
}
