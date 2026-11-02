import { useCallback, useEffect, useState, type ReactNode } from "react";
import { LoaderCircle } from "lucide-react";
import { useLocale } from "../i18n/Locale";
export function useRemote<T>(load: () => Promise<T>) {
  const [data, setData] = useState<T>();
  const [err, setErr] = useState<unknown>(null);
  const [busy, setBusy] = useState(true);
  const [version, setVersion] = useState(0);
  const refresh = useCallback(() => setVersion((v) => v + 1), []);
  useEffect(() => {
    let active = true;
    setBusy(true);
    setErr(null);
    load()
      .then((d) => {
        if (active) setData(d);
      })
      .catch((e) => {
        if (active) setErr(e);
      })
      .finally(() => {
        if (active) setBusy(false);
      });
    return () => {
      active = false;
    };
  }, [load, version]);
  return { data, err, busy, refresh };
}
export function Remote({
  busy,
  err,
  retry,
  children,
}: {
  busy: boolean;
  err: unknown;
  retry: () => void;
  children: ReactNode;
}) {
  const { t, error } = useLocale();
  if (busy)
    return (
      <div className="loading row">
        <LoaderCircle size={17} className="spin" />
        {t.loading}
      </div>
    );
  if (err)
    return (
      <div className="notice error" role="alert">
        {error(err)}{" "}
        <button className="btn small" onClick={retry}>
          {t.retry}
        </button>
      </div>
    );
  return <>{children}</>;
}
