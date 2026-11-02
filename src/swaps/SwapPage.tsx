import { ArrowDownUp, Wallet as WalletIcon } from "lucide-react";
import { useSwap } from "./useSwap";
import { TokenSide } from "./TokenSide";
import { QuoteReview } from "./QuoteReview";
import { PendingTransaction } from "./PendingTransaction";
import "./swaps.css";
export function SwapPage({ workspace }: { workspace: string }) {
  const {
    p,
    from,
    setFrom,
    to,
    setTo,
    fromToken,
    setFromToken,
    toToken,
    setToToken,
    catalog,
    catalogBusy,
    setReload,
    amount,
    setAmount,
    slippage,
    setSlippage,
    address,
    quote,
    consent,
    setConsent,
    busy,
    err,
    setErr,
    errorText,
    notice,
    pending,
    expired,
    blocked,
    kind,
    source,
    clearQuote,
    connect,
    checkAllowance,
    switchChain,
    submit,
    recover,
    clear,
    refresh,
    track,
    locked,
  } = useSwap(workspace);
  return (
    <div className="swap-layout">
      <section className="panel panel-body stack swap-form">
        <div className="row">
          <ArrowDownUp size={22} />
          <h2>{p.title}</h2>
          <span className="badge">{p.service}</span>
        </div>
        <p className="muted">{p.permissions}</p>
        <button className="btn" disabled={busy} onClick={() => void connect()}>
          <WalletIcon size={16} />
          {p.connect}
        </button>
        {address && (
          <div className="swap-address">
            <small>{p.wallet}</small>
            <code>{address}</code>
          </div>
        )}
        <fieldset disabled={blocked} className="swap-fields">
          <TokenSide
            title={p.from}
            network={from}
            onNetwork={(v) => {
              clearQuote();
              setFrom(v);
            }}
            token={fromToken}
            onToken={(v) => {
              clearQuote();
              setFromToken(v);
            }}
            tokens={catalog[0]}
            loading={catalogBusy}
          />
          <label>
            {p.amount}
            <input
              inputMode="decimal"
              autoComplete="off"
              value={amount}
              placeholder="0.00"
              onChange={(e) => {
                clearQuote();
                setAmount(e.target.value);
              }}
            />
          </label>
          <div className="swap-divider">
            <ArrowDownUp size={18} />
          </div>
          <TokenSide
            title={p.to}
            network={to}
            onNetwork={(v) => {
              clearQuote();
              setTo(v);
            }}
            token={toToken}
            onToken={(v) => {
              clearQuote();
              setToToken(v);
            }}
            tokens={catalog[1]}
            loading={catalogBusy}
          />
          <label>
            {p.slippage}
            <select
              value={slippage}
              onChange={(e) => {
                clearQuote();
                setSlippage(Number(e.target.value));
              }}
            >
              <option value={10}>0.1%</option>
              <option value={50}>0.5%</option>
              <option value={100}>1%</option>
            </select>
          </label>
        </fieldset>
        {!catalogBusy && (!catalog[0].length || !catalog[1].length) && (
          <button
            className="btn"
            disabled={blocked}
            onClick={() => {
              setErr(undefined);
              clearQuote();
              setReload((n) => n + 1);
            }}
          >
            {p.retry}
          </button>
        )}
        <button
          className="btn primary"
          disabled={
            blocked || catalogBusy || !address || !source || !toToken || !amount
          }
          onClick={() => void refresh()}
        >
          {busy ? p.loading : quote ? p.refresh : p.quote}
        </button>
        {err != null && (
          <div className="notice error" role="alert">
            {errorText}
          </div>
        )}
        {notice && (
          <div className="notice" role="status">
            {notice}
          </div>
        )}
      </section>
      <div className="stack">
        {quote ? (
          <QuoteReview
            quote={quote}
            expired={expired}
            blocked={blocked}
            consent={consent}
            kind={kind}
            onConsent={setConsent}
            onSwitch={switchChain}
            onCheck={checkAllowance}
            onSubmit={submit}
          />
        ) : (
          <section className="panel panel-body swap-empty">
            <ArrowDownUp size={30} />
            <p>{p.noQuote}</p>
          </section>
        )}
        {pending && (
          <PendingTransaction
            pending={pending}
            busy={busy}
            locked={locked}
            onTrack={track}
            onRecover={recover}
            onClear={clear}
          />
        )}
        <p className="muted swap-note">{p.note}</p>
        <p className="muted swap-note">{p.journal}</p>
      </div>
    </div>
  );
}
