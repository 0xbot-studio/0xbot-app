import { useLocale } from "./i18n/Locale";
import { useAccount } from "./auth/useAccount";
import { Login } from "./auth/Login";
import { Shell, usePage } from "./components/Shell";
import { Remote } from "./components/Remote";
import { Overview, Metrics } from "./overview/Overview";
import { Playground } from "./playground/Playground";
import { Keys } from "./keys/Keys";
import { Requests } from "./operations/Requests";
import { Account } from "./account/Account";
import { playgroundCopy } from "./playground/copy";
import { ConsentPage } from "./oauth/ConsentPage";
import { oauthCopy } from "./oauth/copy";
import { resolvePublicPage } from "./navigation";
import { RoomsPage } from "./rooms/RoomsPage";
import { roomCopy } from "./rooms/copy";
import { SwapPage } from "./swaps/SwapPage";
import { swapCopy } from "./swaps/copy";
export default function App() {
  const account = useAccount();
  const route = usePage();
  const page = route.split("/")[0];
  const { t, lang } = useLocale();
  if (account.loading || account.error)
    return (
      <Remote busy={account.loading} err={account.error} retry={account.reload}>
        {null}
      </Remote>
    );
  if (!account.user)
    return (
      <>
        {page === "oauth" && (
          <div className="notice" role="status">
            {oauthCopy[lang].pending}
          </div>
        )}
        <Login onLogin={account.reload} />
      </>
    );
  if (page === "oauth")
    return (
      <ConsentPage
        key={route}
        id={route.split("/")[1] || ""}
        user={account.user}
      />
    );
  const subtitles: Record<string, string> = {
    overview: t.overviewIntro,
    swaps: swapCopy[lang].intro,
    playground: playgroundCopy[lang].intro,
    rooms: roomCopy[lang].intro,
    keys: t.keysIntro,
    requests: t.requestsIntro,
    usage: t.usageIntro,
    settings: t.accountIntro,
  };
  const active = resolvePublicPage(page);
  return (
    <Shell user={account.user} page={active} onLogout={account.logout}>
      <div className="page-heading">
        <div>
          <h1>
            {active === "overview"
              ? t.welcomeBack + ", " + account.user.name
              : t[active as "overview"]}
          </h1>
          <p>{subtitles[active]}</p>
        </div>
        {active === "overview" && (
          <span className="preview-caption">{t.month}</span>
        )}
      </div>
      {active === "overview" ? (
        <Overview />
      ) : active === "playground" ? (
        <Playground />
      ) : active === "swaps" ? (
        <SwapPage
          key={account.user.workspace_id}
          workspace={account.user.workspace_id}
        />
      ) : active === "rooms" ? (
        <RoomsPage />
      ) : active === "keys" ? (
        <Keys />
      ) : active === "requests" ? (
        <Requests />
      ) : active === "usage" ? (
        <Metrics usage />
      ) : (
        <Account user={account.user} reload={account.reload} />
      )}
    </Shell>
  );
}
