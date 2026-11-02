export const supportedLocales = ["en", "zh"] as const;
export const defaultLocale = "en";
export type SupportedLocale = (typeof supportedLocales)[number];

// Honor supported preferences; new users and unsupported locales use English.
export function normalizeLocale(value: string | null): SupportedLocale {
  return supportedLocales.find((locale) => locale === value) ?? defaultLocale;
}
