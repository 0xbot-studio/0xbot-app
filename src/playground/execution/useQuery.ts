import { useEffect, useRef, useState } from "react";
import { createRequestGate } from "./requestGate";
export function useQuery<T>() {
  const gate = useRef(createRequestGate());
  const [busy, setBusy] = useState(false);
  const [out, setOut] = useState<{ value: T; snapshot: string }>();
  const [err, setErr] = useState<unknown>(null);
  const [cancelled, setCancelled] = useState(false);
  useEffect(() => {
    const current = gate.current;
    return () => current.cancel();
  }, []);
  async function run(
    snapshot: string,
    execute: (signal: AbortSignal) => Promise<T>,
  ) {
    const signal = gate.current.begin();
    setBusy(true);
    setErr(null);
    setOut(undefined);
    setCancelled(false);
    try {
      const value = await execute(signal);
      if (gate.current.accepts(signal)) setOut({ value, snapshot });
    } catch (e) {
      if (gate.current.accepts(signal)) setErr(e);
    } finally {
      if (gate.current.accepts(signal)) setBusy(false);
    }
  }
  function cancel() {
    gate.current.cancel();
    setBusy(false);
    setCancelled(true);
  }
  return { busy, out, err, cancelled, run, cancel };
}
