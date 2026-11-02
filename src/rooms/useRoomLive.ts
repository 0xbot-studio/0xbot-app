import { useEffect, useState } from "react";
import { watchRoom, type RoomResult } from "./client";
import { delay, retryDelay } from "./liveStream";

export function useRoomLive(
  id: string,
  initialized: boolean,
  accept: (value: RoomResult) => void,
) {
  const [status, setStatus] = useState<
    "connecting" | "connected" | "reconnecting" | "stopped"
  >("connecting");
  const [error, setError] = useState<unknown>(null);
  const [generation, setGeneration] = useState(0);
  useEffect(() => {
    if (!initialized) return;
    const controller = new AbortController();
    const { signal } = controller;
    let terminal = false;
    const restore = () => {
      if (
        !terminal &&
        document.visibilityState === "visible" &&
        navigator.onLine
      ) {
        controller.abort();
        setGeneration((n) => n + 1);
      }
    };
    window.addEventListener("online", restore);
    document.addEventListener("visibilitychange", restore);
    setStatus("connecting");
    setError(null);
    async function follow() {
      let seq = 0,
        failures = 0;
      while (!signal.aborted) {
        try {
          const started = Date.now();
          await watchRoom(id, seq, signal, (out) => {
            if (signal.aborted) return;
            seq = Math.max(seq, out.data.room.seq);
            accept(out);
            setStatus("connected");
            setError(null);
          });
          // Only a healthy renewal resets the budget: a server sending one frame
          // and then failing must not create an unlimited reconnect loop.
          if (Date.now() - started < 1000)
            throw new Error("room_stream_disconnected");
          failures = 0;
          await delay(250, signal);
        } catch (e) {
          if (signal.aborted) return;
          const ms = retryDelay(e, ++failures);
          setError(e);
          if (ms === null) {
            terminal = true;
            setStatus("stopped");
            return;
          }
          setStatus("reconnecting");
          try {
            await delay(ms + Math.random() * 500, signal);
          } catch {
            return;
          }
        }
      }
    }
    void follow();
    return () => {
      controller.abort();
      window.removeEventListener("online", restore);
      document.removeEventListener("visibilitychange", restore);
    };
  }, [id, initialized, generation, accept]);
  return { status, error, retry: () => setGeneration((n) => n + 1) };
}
