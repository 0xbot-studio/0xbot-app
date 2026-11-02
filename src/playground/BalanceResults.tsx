import type { BalanceResult } from "../api/client";
import { useLocale } from "../i18n/Locale";
import { formatAmount } from "./amount";

export function BalanceResults({ rows }: { rows: BalanceResult["data"][] }) {
  const { t } = useLocale();
  return (
    <div className="fields panel-body">
      {rows.map((b) => (
        <article key={b.asset} className="panel panel-body fields">
          <div className="row between">
            <strong>{b.name || b.symbol}</strong>
            <span className="badge">{b.variant || t.nativeAsset}</span>
          </div>
          <strong className="mono" style={{ overflowWrap: "anywhere" }}>
            {formatAmount(b.amount, b.decimals)} {b.symbol}
          </strong>
          <small className="muted">
            {t.baseUnits}: {b.amount} · {t.decimals}: {b.decimals}
          </small>
          {b.contract && (
            <code style={{ overflowWrap: "anywhere" }}>
              {t.contract}: {b.contract}
            </code>
          )}
          <small className="muted">
            {b.network} · {t.block}: {b.block_number}
          </small>
        </article>
      ))}
    </div>
  );
}
