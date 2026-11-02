import { useState } from "react";
import { RoomsPage } from "../rooms/RoomsPage";
import { SendMessagePage } from "../messages/SendMessagePage";
import { InboxPage } from "../messages/InboxPage";
import { MessageDetailPage } from "../messages/MessageDetailPage";
import { usePage } from "../components/Shell";
import { useLocale } from "../i18n/Locale";
import { entries, parsePlaygroundRoute } from "./catalog";
import { playgroundCopy } from "./copy";
import { NativeBalancePage } from "./pages/NativeBalancePage";
import { TokenBalancePage } from "./pages/TokenBalancePage";
import { CommonBalancesPage } from "./pages/CommonBalancesPage";
import { PlannedQueryPage } from "./pages/PlannedQueryPage";
import "./playground.css";
import { AssetPricePage } from "./pages/AssetPricePage";
import { TokenPricePage } from "./pages/TokenPricePage";
import { NFTDetailPage } from "./pages/NFTDetailPage";
import { NFTOwnerPage } from "./pages/NFTOwnerPage";
import { NFTBalancePage } from "./pages/NFTBalancePage";
import { TokenBoundResolvePage } from "./pages/TokenBoundResolvePage";
import { TokenBoundInspectPage } from "./pages/TokenBoundInspectPage";

const pages = {
  rooms: RoomsPage,
  "send-message": SendMessagePage,
  inbox: InboxPage,
  "message-detail": MessageDetailPage,
  "asset-price": AssetPricePage,
  "token-price": TokenPricePage,
  "nft-detail": NFTDetailPage,
  "nft-owner": NFTOwnerPage,
  "nft-balance": NFTBalancePage,
  "token-bound-resolve": TokenBoundResolvePage,
  "token-bound-account": TokenBoundInspectPage,
  "native-balance": NativeBalancePage,
  "token-balance": TokenBalancePage,
  "common-balances": CommonBalancesPage,
};

export function Playground() {
  const route = parsePlaygroundRoute(usePage());
  const { lang } = useLocale();
  const p = playgroundCopy[lang];
  const [showPlanned, setShowPlanned] = useState(false);
  const [search, setSearch] = useState("");
  const selected = entries.find((entry) => entry.slug === route);
  const Page = Object.hasOwn(pages, route)
    ? pages[route as keyof typeof pages]
    : undefined;
  const visible = entries.filter(
    (entry) =>
      (!entry.planned || showPlanned || entry.slug === route) &&
      (p[entry.label] + entry.id).toLowerCase().includes(search.toLowerCase()),
  );
  return (
    <div className="query-workbench">
      <aside className="panel capability-menu">
        <label>
          {p.find}
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </label>
        <label className="planned-toggle">
          <input
            type="checkbox"
            checked={showPlanned}
            onChange={(e) => setShowPlanned(e.target.checked)}
          />
          {p.showPlanned}
        </label>
        <nav aria-label={p.find}>
          {visible.map((entry) => (
            <a
              key={entry.slug}
              href={"#playground/" + entry.slug}
              aria-current={route === entry.slug ? "page" : undefined}
            >
              <span>{p[entry.label]}</span>
              <small>{entry.planned ? p.planned : entry.id}</small>
            </a>
          ))}
        </nav>
      </aside>
      <div className="query-page" key={route}>
        {Page ? (
          <Page />
        ) : selected ? (
          <PlannedQueryPage entry={selected} />
        ) : (
          <section className="panel panel-body">
            <h2>{p.notFound}</h2>
            <a href="#playground/native-balance">{p.native}</a>
          </section>
        )}
      </div>
    </div>
  );
}
