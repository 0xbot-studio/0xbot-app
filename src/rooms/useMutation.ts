import { useEffect, useRef, useState } from "react";
import type { RoomResult } from "./client";
// Keep the exact closure (including key and payload) after errors. Never retry a changed form.
export function useRoomMutation(onSuccess: (out: RoomResult) => void) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<unknown>(null);
  const [pending, setPending] = useState<
    ((signal: AbortSignal) => Promise<RoomResult>) | null
  >(null);
  const controller = useRef<AbortController | null>(null);
  const locked = useRef(false);
  useEffect(
    () => () => {
      controller.current?.abort();
    },
    [],
  );
  async function execute(fn: (signal: AbortSignal) => Promise<RoomResult>) {
    if (locked.current) return;
    locked.current = true;
    controller.current?.abort();
    const c = new AbortController();
    controller.current = c;
    setBusy(true);
    setErr(null);
    setPending(() => fn);
    try {
      const out = await fn(c.signal);
      if (!c.signal.aborted) {
        setPending(null);
        onSuccess(out);
      }
    } catch (e) {
      if (!c.signal.aborted) setErr(e);
    } finally {
      locked.current = false;
      if (!c.signal.aborted) setBusy(false);
    }
  }
  return {
    busy,
    err,
    pending,
    run: (fn: (signal: AbortSignal) => Promise<RoomResult>) => {
      if (!pending && !busy) void execute(fn);
    },
    retry: () => {
      if (pending && !busy) void execute(pending);
    },
    discard: () => {
      if (!busy) {
        setPending(null);
        setErr(null);
      }
    },
  };
}
