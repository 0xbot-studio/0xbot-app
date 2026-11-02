import { useLocale } from "../../i18n/Locale";
import { networks, type BalanceInput } from "../../api/networks";
import { Remote } from "../../components/Remote";
import { playgroundCopy } from "../copy";
import type { BalanceForm } from "./useBalanceForm";
export function BalanceFields({
  form,
  onNetworkChange,
}: {
  form: BalanceForm;
  onNetworkChange?: () => void;
}) {
  const { t, lang } = useLocale();
  const { input, setInput, routes, providers } = form;
  return (
    <>
      <label>
        {t.network}
        <select
          value={input.network}
          onChange={(e) => {
            setInput({
              ...input,
              network: e.target.value as BalanceInput["network"],
              provider: "auto",
            });
            onNetworkChange?.();
          }}
        >
          {networks.map((n) => (
            <option key={n.id} value={n.id}>
              {n.name} · {n.symbol}
            </option>
          ))}
        </select>
      </label>
      <Remote busy={routes.busy} err={routes.err} retry={routes.refresh}>
        <label>
          {t.provider}
          <select
            value={input.provider}
            onChange={(e) =>
              setInput({
                ...input,
                provider: e.target.value as BalanceInput["provider"],
              })
            }
          >
            <option value="auto">{t.auto}</option>
            {providers.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} · {t.freePublic}
              </option>
            ))}
          </select>
        </label>
        {!form.ready && (
          <div className="notice" role="status">
            {playgroundCopy[lang].unavailable}
          </div>
        )}
      </Remote>
      <button className="text-link" type="button" onClick={routes.refresh}>
        {t.refresh}
      </button>
      <label>
        {t.address}
        <input
          value={input.address}
          onChange={(e) => setInput({ ...input, address: e.target.value })}
          placeholder="0x…"
          pattern="0x[0-9a-fA-F]{40}"
          maxLength={42}
          required
          autoComplete="off"
          spellCheck={false}
        />
      </label>
      <button
        type="button"
        className="text-link example-address"
        onClick={() =>
          setInput({
            ...input,
            address: "0x0000000000000000000000000000000000000000",
          })
        }
      >
        {t.exampleAddress}
      </button>
    </>
  );
}
