const publicPages = [
  "overview",
  "playground",
  "rooms",
  "swaps",
  "keys",
  "requests",
  "usage",
  "settings",
];
export function resolvePublicPage(page: string) {
  return publicPages.includes(page) ? page : "overview";
}
