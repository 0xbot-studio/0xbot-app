import { useState } from "react";
import { useLocale } from "../i18n/Locale";
import { swapCopy } from "./copy";
import { hashPattern } from "./amount";
import type { Pending } from "./wallet";
export function PendingTransaction({
  pending,
  busy,
  locked,
  onTrack,
  onRecover,
  onClear,
}: {
  pending: Pending;
  busy: boolean;
  locked: boolean;
  onTrack(): Promise<void>;
  onRecover(hash: string): Promise<void>;
  onClear(): Promise<void>;
}) {
  const { lang } = useLocale();
  const p = swapCopy[lang];
  const [verified, setVerified] = useState(false);
  const [hash, setHash] = useState("");
  return (
    <section className="panel panel-body stack" aria-live="polite">
      <h2>{p.tracking}</h2>
      <p>{pending.state === "submitted" ? p.pending : p.unknown}</p>
      <code className="swap-hash">{pending.hash || "—"}</code>
      {pending.hash ? (
        <button className="btn" disabled={busy} onClick={() => void onTrack()}>
          {p.checkStatus}
        </button>
      ) : (
        <>
          <label>
            {p.hash}
            <input
              value={hash}
              onChange={(e) => setHash(e.target.value)}
              autoComplete="off"
            />
          </label>
          <button
            className="btn"
            disabled={busy || !hashPattern.test(hash)}
            onClick={() => void onRecover(hash)}
          >
            {p.recover}
          </button>
        </>
      )}
      <label className="swap-checkbox">
        <input
          type="checkbox"
          checked={verified}
          disabled={busy}
          onChange={(e) => setVerified(e.target.checked)}
        />
        <span>{p.verified}</span>
      </label>
      <button
        className="btn small"
        disabled={busy || !verified || locked}
        onClick={() => void onClear()}
      >
        {p.clear}
      </button>
    </section>
  );
}
