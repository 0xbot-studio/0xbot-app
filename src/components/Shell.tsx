import { useEffect, useState, type ReactNode } from "react";
import {
  LayoutDashboard,
  ArrowDownUp,
  Terminal,
  KeyRound,
  Activity,
  ChartNoAxesColumn,
  Layers,
  Settings,
  BookOpen,
  LogOut,
  ArrowUpRight,
  Menu,
  X,
  ScrollText,
} from "lucide-react";
import { useLocale } from "../i18n/Locale";
import type { User } from "../api/client";
export function usePage(fallback = "overview") {
  const [page, setPage] = useState(() => location.hash.slice(1) || fallback);
  useEffect(() => {
    const fn = () => setPage(location.hash.slice(1) || fallback);
    addEventListener("hashchange", fn);
    return () => removeEventListener("hashchange", fn);
  }, [fallback]);
  return page;
}
export function Shell({
  user,
  page,
  admin = false,
  onLogout,
  children,
}: {
  user: User;
  page: string;
  admin?: boolean;
  onLogout: () => Promise<void>;
  children: ReactNode;
}) {
  const { t, lang, setLang, error } = useLocale();
  const [open, setOpen] = useState(false);
  const [err, setErr] = useState<unknown>(null);
  const nav = admin
    ? ([
        ["providers", Layers],
        ["audit", ScrollText],
      ] as const)
    : ([
        ["overview", LayoutDashboard],
        ["playground", Terminal],
        ["rooms", ScrollText],
        ["swaps", ArrowDownUp],
        ["keys", KeyRound],
        ["requests", Activity],
        ["usage", ChartNoAxesColumn],
        ["settings", Settings],
      ] as const);
  return (
    <div className="console-layout">
      <aside className={open ? "sidebar visible" : "sidebar"}>
        <a className="brand" href="https://0xbot.org">
          <span className="brand-mark">0x</span>0xbot
        </a>
        <div className="workspace-switch">
          <span className="workspace-avatar">{admin ? "A" : "P"}</span>
          <div>
            <strong>{admin ? t.admin : t.workspace}</strong>
            <small>{user.name}</small>
          </div>
          <span className="badge">{admin ? "ADMIN" : "FREE"}</span>
        </div>
        <div className="nav-label">{admin ? t.admin : t.workspace}</div>
        <nav>
          {nav.map(([id, Icon]) => (
            <a
              href={"#" + id}
              className={page === id ? "selected" : ""}
              key={id}
              onClick={() => setOpen(false)}
            >
              <Icon size={17} />
              {t[id]}
              {id === "playground" && <span className="nav-dot" />}
            </a>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <div className="preview-note">
            <span className="eyebrow">
              <span className="dot" />
              {t.preview}
            </span>
            <p>{t.freeNote}</p>
          </div>
          <a
            className="sidebar-docs"
            href={"https://0xbot.org/" + lang + "/docs/"}
            target="_blank"
            rel="noreferrer"
          >
            <BookOpen size={16} />
            {t.docs}
            <ArrowUpRight size={13} />
          </a>
          <button
            className="logout"
            onClick={async () => {
              try {
                await onLogout();
              } catch (e) {
                setErr(e);
              }
            }}
          >
            <LogOut size={15} />
            {t.logout}
          </button>
        </div>
      </aside>
      {open && (
        <button
          className="sidebar-overlay"
          aria-label={t.cancel}
          onClick={() => setOpen(false)}
        />
      )}
      <div className="console-main">
        <header className="console-topbar">
          <div className="row">
            <button
              className="btn small mobile-nav"
              aria-label={t.workspace}
              onClick={() => setOpen(!open)}
            >
              {open ? <X size={17} /> : <Menu size={17} />}
            </button>
            <span className="muted">{admin ? "0xbot admin" : "0xbot"}</span>
            <span className="muted">/</span>
            <span>{t[page as "overview"] || page}</span>
          </div>
          <div className="row">
            <span className="badge green">
              <span className="dot" />
              {t.preview}
            </span>
            <button
              className="btn small locale-button"
              onClick={() => setLang(lang === "en" ? "zh" : "en")}
            >
              {t.language}
            </button>
            <span className="user-avatar">
              {user.name.charAt(0).toUpperCase()}
            </span>
          </div>
        </header>
        <main className="console-content">
          {err != null && <div className="notice error">{error(err)}</div>}
          {children}
        </main>
        <footer className="console-footer">
          <span>0xbot · {t.preview}</span>
          <span>API + MCP / v0.1</span>
        </footer>
      </div>
    </div>
  );
}
