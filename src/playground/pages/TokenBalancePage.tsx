import { useState } from "react";
import { api, result } from "../../api/client";
import { useLocale } from "../../i18n/Locale";
import { Remote } from "../../components/Remote";
import { playgroundCopy } from "../copy";
import { useBalanceForm, useTokens } from "../balances/useBalanceForm";
import { BalanceFields } from "../balances/BalanceFields";
import { BalanceQueryFrame } from "../balances/BalanceQueryFrame";
export function TokenBalancePage() {
  const { t, lang } = useLocale();
  const form = useBalanceForm("data.token_balance");
  const tokens = useTokens();
  const [contract, setContract] = useState("");
  const options =
    tokens.data?.filter(
      (token) =>
        token.network === form.input.network &&
        token.asset_class === "stablecoin",
    ) || [];
  const selected = options.find((token) => token.contract === contract);
  const body = { ...form.input, contract };
  return (
    <BalanceQueryFrame
      title={playgroundCopy[lang].token}
      capability="data.token_balance"
      endpoint="/v1/data/token-balance"
      tool="get_token_balance"
      body={body}
      ready={form.ready && !tokens.busy && !tokens.err && Boolean(selected)}
      execute={async (signal) =>
        result(await api.POST("/v1/data/token-balance", { body, signal }))
      }
    >
      <BalanceFields form={form} onNetworkChange={() => setContract("")} />
      <Remote busy={tokens.busy} err={tokens.err} retry={tokens.refresh}>
        <label>
          {t.asset}
          <select
            value={contract}
            required
            onChange={(e) => setContract(e.target.value)}
          >
            <option value="" disabled>
              —
            </option>
            {options.map((token) => (
              <option key={token.contract} value={token.contract}>
                {token.symbol} · {token.name} · {token.variant}
              </option>
            ))}
          </select>
        </label>
      </Remote>
      {selected && <code className="query-snapshot">{selected.contract}</code>}
      <small className="muted">{t.tokenWarning}</small>
    </BalanceQueryFrame>
  );
}
