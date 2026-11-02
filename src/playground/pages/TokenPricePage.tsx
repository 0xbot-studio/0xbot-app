import { useState } from "react";
import { api, result } from "../../api/client";
import { useLocale } from "../../i18n/Locale";
import { priceCopy } from "../prices/copy";
import { PriceQueryFrame } from "../prices/PriceQueryFrame";
export function TokenPricePage() {
  const { lang } = useLocale();
  const p = priceCopy[lang];
  const [network, setNetwork] = useState<
      "eip155:1" | "eip155:56" | "eip155:137"
    >("eip155:1"),
    [contract, setContract] = useState("");
  const body = { network, contract };
  const ready =
    /^0x[0-9a-fA-F]{40}$/.test(contract) && !/^0x0{40}$/.test(contract);
  return (
    <PriceQueryFrame
      title={p.token}
      capability="market.token_price"
      endpoint="/v1/prices/token"
      tool="get_token_price"
      body={body}
      ready={ready}
      execute={async (signal) =>
        result(await api.POST("/v1/prices/token", { body, signal }))
      }
    >
      <label>
        {p.network}
        <select
          value={network}
          onChange={(e) => setNetwork(e.target.value as typeof network)}
        >
          <option value="eip155:1">Ethereum</option>
          <option value="eip155:56">BNB Smart Chain</option>
          <option value="eip155:137">Polygon PoS</option>
        </select>
      </label>
      <label>
        {p.contract}
        <input
          required
          pattern="0x[0-9a-fA-F]{40}"
          value={contract}
          onChange={(e) => setContract(e.target.value)}
          placeholder="0x…"
          autoComplete="off"
        />
      </label>
    </PriceQueryFrame>
  );
}
