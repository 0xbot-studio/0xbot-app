import { useLocale } from "../../i18n/Locale";
import type { QueryEntry } from "../catalog";
import { playgroundCopy } from "../copy";
const descriptions = {
  nftTransfers: "nftTransfersText",
  transaction: "transactionText",
  receipt: "receiptText",
  nft: "nftText",
  walletNFTs: "walletNFTsText",
} as const;
export function PlannedQueryPage({ entry }: { entry: QueryEntry }) {
  const { lang } = useLocale();
  const p = playgroundCopy[lang];
  return (
    <section className="panel panel-body fields">
      <span className="badge orange">{p.planned}</span>
      <h2>{p[entry.label]}</h2>
      <p>{p.plannedText}</p>
      {entry.label in descriptions && (
        <p>{p[descriptions[entry.label as keyof typeof descriptions]]}</p>
      )}
    </section>
  );
}
