import type { Quote } from "./client";
import { useLocale } from "../i18n/Locale";
import { formatAmount } from "../playground/amount";
import { swapCopy } from "./copy";
export function QuoteReview({
  quote,
  expired,
  blocked,
  consent,
  kind,
  onConsent,
  onSwitch,
  onCheck,
  onSubmit,
}: {
  quote: Quote;
  expired: boolean;
  blocked: boolean;
  consent: boolean;
  kind?: "reset" | "approval" | "swap";
  onConsent(v: boolean): void;
  onSwitch(): Promise<void>;
  onCheck(): Promise<void>;
  onSubmit(): Promise<void>;
}) {
  const { lang } = useLocale();
  const p = swapCopy[lang];
  return (
    <section className="panel panel-body stack swap-review">
      <h2>{p.review}</h2>
      <div className="swap-output">
        <small>{p.estimate}</small>
        <strong>
          {formatAmount(quote.to_amount, quote.to_token.decimals)}{" "}
          {quote.to_token.symbol}
        </strong>
      </div>
      <dl className="swap-details">
        <dt>{p.minimum}</dt>
        <dd>
          {formatAmount(quote.minimum_amount, quote.to_token.decimals)}{" "}
          {quote.to_token.symbol}
        </dd>
        <dt>{p.route}</dt>
        <dd>LI.FI / {quote.tool}</dd>
        <dt>{p.from}</dt>
        <dd>
          {quote.from_token.network} ·{" "}
          {formatAmount(quote.request.amount, quote.from_token.decimals)}{" "}
          {quote.from_token.symbol}
          <code>{quote.from_token.address}</code>
        </dd>
        <dt>{p.to}</dt>
        <dd>
          {quote.to_token.network} · {quote.to_token.symbol}
          <code>{quote.to_token.address}</code>
        </dd>
        <dt>{p.recipient}</dt>
        <dd>
          <code>{quote.request.wallet}</code>
        </dd>
        <dt>{p.target}</dt>
        <dd>
          <code>{quote.transaction.to}</code>
        </dd>
        {quote.approval_address && (
          <>
            <dt>{p.spender}</dt>
            <dd>
              <code>{quote.approval_address}</code>
            </dd>
          </>
        )}
        <dt>{p.value}</dt>
        <dd>{quote.transaction.value}</dd>
        <dt>{p.expiry}</dt>
        <dd>{new Date(quote.expires_at).toLocaleTimeString(lang)}</dd>
      </dl>
      <div>
        <h3>{p.costs}</h3>
        <ul>
          {(quote.costs || []).map((c, i) => (
            <li key={i}>
              {c.name}: {formatAmount(c.amount, c.token.decimals)}{" "}
              {c.token.symbol} · {c.included ? p.included : p.extra}
            </li>
          ))}
        </ul>
      </div>
      {expired && (
        <div className="notice" role="status">
          {p.expired}
        </div>
      )}
      <div className="row">
        <button
          className="btn small"
          disabled={blocked || expired}
          onClick={() => void onSwitch()}
        >
          {p.switch}
        </button>
        <button
          className="btn small"
          disabled={blocked || expired}
          onClick={() => void onCheck()}
        >
          {p.check}
        </button>
      </div>
      <label className="swap-checkbox">
        <input
          type="checkbox"
          checked={consent}
          disabled={blocked || expired}
          onChange={(e) => onConsent(e.target.checked)}
        />
        <span>{p.consent}</span>
      </label>
      <button
        className="btn primary"
        disabled={blocked || expired || !consent || !kind}
        onClick={() => void onSubmit()}
      >
        {kind === "reset"
          ? p.reset
          : kind === "approval"
            ? p.approve
            : p.execute}
      </button>
    </section>
  );
}
