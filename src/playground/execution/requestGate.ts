// A cancelled or superseded response must never update the active page.
export function createRequestGate() {
  let active: AbortController | undefined;
  return {
    begin() {
      active?.abort();
      active = new AbortController();
      return active.signal;
    },
    cancel() {
      active?.abort();
    },
    accepts(signal: AbortSignal) {
      return active?.signal === signal && !signal.aborted;
    },
  };
}
