import { useLayoutEffect, useRef, useState } from "react";

export function useTranscriptScroll(messageCount: number) {
  const ref = useRef<HTMLDivElement>(null);
  const nearBottom = useRef(true);
  const previousCount = useRef(0);
  const [unread, setUnread] = useState(false);
  function latest() {
    if (ref.current) ref.current.scrollTop = ref.current.scrollHeight;
    nearBottom.current = true;
    setUnread(false);
  }
  useLayoutEffect(() => {
    if (messageCount > previousCount.current) {
      if (nearBottom.current) latest();
      else setUnread(true);
    }
    previousCount.current = messageCount;
  }, [messageCount]);
  function onScroll() {
    const el = ref.current;
    if (!el) return;
    nearBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80;
    if (nearBottom.current) setUnread(false);
  }
  return { ref, onScroll, unread, latest };
}
