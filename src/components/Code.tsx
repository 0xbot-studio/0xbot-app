import { useState } from "react";
import { Copy, Check } from "lucide-react";
import { useLocale } from "../i18n/Locale";
export function Code({ value, label }: { value: string; label: string }) {
  const { t } = useLocale();
  const [done, setDone] = useState(false);
  const [err, setErr] = useState(false);
  return (
    <div className="codebox">
      <div className="code-head">
        <span>{label}</span>
        <button
          className="btn small"
          onClick={async () => {
            try {
              await navigator.clipboard.writeText(value);
              setDone(true);
              setTimeout(() => setDone(false), 1500);
            } catch {
              setErr(true);
            }
          }}
        >
          {done ? <Check size={12} /> : <Copy size={12} />}{" "}
          {done ? t.copied : t.copy}
        </button>
      </div>
      <pre>{value}</pre>
      {err && (
        <p className="copy-error" role="alert">
          {t.copyFail}
        </p>
      )}
    </div>
  );
}
