import { api, result } from "../../api/client";
import { useLocale } from "../../i18n/Locale";
import { playgroundCopy } from "../copy";
import { useBalanceForm } from "../balances/useBalanceForm";
import { BalanceFields } from "../balances/BalanceFields";
import { BalanceQueryFrame } from "../balances/BalanceQueryFrame";
export function NativeBalancePage() {
  const { lang } = useLocale();
  const form = useBalanceForm("data.balance");
  return (
    <BalanceQueryFrame
      title={playgroundCopy[lang].native}
      capability="data.balance"
      endpoint="/v1/data/balance"
      tool="get_native_balance"
      body={form.input}
      ready={form.ready}
      execute={async (signal) =>
        result(await api.POST("/v1/data/balance", { body: form.input, signal }))
      }
    >
      <BalanceFields form={form} />
    </BalanceQueryFrame>
  );
}
