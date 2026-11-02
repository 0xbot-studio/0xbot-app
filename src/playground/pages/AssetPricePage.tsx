import { useState } from "react";
import { api, result } from "../../api/client";
import { useLocale } from "../../i18n/Locale";
import { priceCopy } from "../prices/copy";
import { PriceQueryFrame } from "../prices/PriceQueryFrame";
export function AssetPricePage() {
  const { lang } = useLocale();
  const [asset, setAsset] = useState<"BTC" | "ETH" | "BNB">("BTC");
  const body = { asset };
  const p = priceCopy[lang];
  return (
    <PriceQueryFrame
      title={p.asset}
      capability="market.asset_price"
      endpoint="/v1/prices/asset"
      tool="get_asset_price"
      body={body}
      ready={true}
      execute={async (signal) =>
        result(await api.POST("/v1/prices/asset", { body, signal }))
      }
    >
      <label>
        {p.coin}
        <select
          value={asset}
          onChange={(e) => setAsset(e.target.value as typeof asset)}
        >
          <option>BTC</option>
          <option>ETH</option>
          <option>BNB</option>
        </select>
      </label>
    </PriceQueryFrame>
  );
}
