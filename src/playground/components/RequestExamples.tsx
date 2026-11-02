import { useState } from "react";
import { useLocale } from "../../i18n/Locale";
import { Code } from "../../components/Code";
import { requestExamples } from "./examples";
export function RequestExamples({
  endpoint,
  tool,
  body,
}: {
  endpoint: string;
  tool: string;
  body: object;
}) {
  const [tab, setTab] = useState<"curl" | "mcp" | "json">("curl");
  const { t } = useLocale();
  const examples = requestExamples(endpoint, tool, body);
  return (
    <section className="stack">
      <div className="query-tabs" aria-label={t.code}>
        {(["curl", "mcp", "json"] as const).map((item) => (
          <button
            key={item}
            className="btn small"
            aria-pressed={tab === item}
            onClick={() => setTab(item)}
          >
            {item === "curl" ? "cURL" : item.toUpperCase()}
          </button>
        ))}
      </div>
      <Code label={t.code + " · " + tab} value={examples[tab]} />
    </section>
  );
}
