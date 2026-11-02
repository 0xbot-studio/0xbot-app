// Streaming parser independent of React and authentication. Frames may cross any byte boundary.
export async function readRoomStream(
  body: ReadableStream<Uint8Array>,
  onEvent: (event: string, data: string) => void,
) {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";
  try {
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      buffer += decoder.decode(value, { stream: true });
      if (buffer.length > 4 * 1024 * 1024)
        throw new Error("invalid_room_stream");
      let match: RegExpExecArray | null;
      while ((match = /\r?\n\r?\n/.exec(buffer))) {
        const frame = buffer.slice(0, match.index);
        buffer = buffer.slice(match.index + match[0].length);
        let event = "message";
        const data: string[] = [];
        for (const line of frame.split(/\r?\n/)) {
          if (line.startsWith("event:")) event = line.slice(6).trim();
          if (line.startsWith("data:"))
            data.push(line.slice(5).replace(/^ /, ""));
        }
        if (data.length) onEvent(event, data.join("\n"));
      }
    }
  } finally {
    await reader.cancel().catch(() => {});
    reader.releaseLock();
  }
}

export function retryDelay(error: unknown, failures: number): number | null {
  const code = error instanceof Error ? error.message : "";
  if (
    failures > 6 ||
    /authentication_required|invalid_api_key|permission|stream_40[0134]|invalid_room_stream/.test(
      code,
    )
  )
    return null;
  return code === "stream_429"
    ? 60_000
    : Math.min(30_000, 1000 * 2 ** (failures - 1));
}

export function delay(ms: number, signal: AbortSignal) {
  return new Promise<void>((resolve, reject) => {
    if (signal.aborted) {
      reject(signal.reason);
      return;
    }
    const abort = () => {
      clearTimeout(timer);
      reject(signal.reason);
    };
    const timer = setTimeout(() => {
      signal.removeEventListener("abort", abort);
      resolve();
    }, ms);
    signal.addEventListener("abort", abort, { once: true });
  });
}
