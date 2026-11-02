import { api, result } from "../../api/client";
import { useLocale } from "../../i18n/Locale";
import { Remote } from "../../components/Remote";
import { playgroundCopy } from "../copy";
import { useBalanceForm, useTokens } from "../balances/useBalanceForm";
import { BalanceFields } from "../balances/BalanceFields";
import { BalanceQueryFrame } from "../balances/BalanceQueryFrame";
export function CommonBalancesPage() {
  const { t, lang } = useLocale();
  const form = useBalanceForm("data.balances");
  const tokens = useTokens();
  const options =
    tokens.data?.filter((token) => token.network === form.input.network) || [];
  return (
    <BalanceQueryFrame
      title={playgroundCopy[lang].common}
      capability="data.balances"
      endpoint="/v1/data/balances"
      tool="get_common_balances"
      body={form.input}
      ready={form.ready && !tokens.busy && !tokens.err && options.length === 2}
      execute={async (signal) =>
        result(
          await api.POST("/v1/data/balances", { body: form.input, signal }),
        )
      }
    >
      <BalanceFields form={form} />
      <Remote busy={tokens.busy} err={tokens.err} retry={tokens.refresh}>
        <small>
          {t.nativeAsset} +{" "}
          {options
            .map((token) => token.symbol + " (" + token.variant + ")")
            .join(" + ")}
        </small>
      </Remote>
      <small className="muted">{t.tokenWarning}</small>
    </BalanceQueryFrame>
  );
}
