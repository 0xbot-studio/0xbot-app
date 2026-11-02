import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { copy, type Locale } from "./copy";
import { normalizeLocale } from "./locales";
const Context = createContext<{ lang: Locale; setLang: (l: Locale) => void }>({
  lang: "en",
  setLang: () => {},
});
export function LocaleProvider({ children }: { children: ReactNode }) {
  const [lang, setLang] = useState<Locale>(() => {
    try {
      return normalizeLocale(localStorage.getItem("0xbot.locale"));
    } catch {
      return "en";
    }
  });
  useEffect(() => {
    document.documentElement.lang = lang;
    try {
      localStorage.setItem("0xbot.locale", lang);
    } catch {}
  }, [lang]);
  return (
    <Context.Provider value={{ lang, setLang }}>{children}</Context.Provider>
  );
}
export function useLocale() {
  const { lang, setLang } = useContext(Context);
  const t = copy[lang];
  function error(e: unknown) {
    const key = e instanceof Error ? e.message : "request_failed";
    return t.errors[key as keyof typeof t.errors] || t.errors.request_failed;
  }
  return { lang, setLang, t, error };
}
