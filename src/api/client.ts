import createClient from "openapi-fetch";
import type { paths, components } from "./schema";
export const API_URL =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? "http://localhost:8095" : "https://api.0xbot.org");
export const api = createClient<paths>({
  baseUrl: API_URL,
  credentials: "include",
});
export type User = components["schemas"]["User"];
export type Provider = components["schemas"]["Provider"];
export type Operation = components["schemas"]["Operation"];
export type Key = components["schemas"]["Key"];
export type BalanceResult = components["schemas"]["BalanceResult"];
export type BalancesResult = components["schemas"]["BalancesResult"];
export type Token = components["schemas"]["Token"];
export function result<T>(response: {
  data?: T;
  error?: unknown;
  response: Response;
}): T {
  if (response.error || !response.response.ok) {
    const err = response.error as { error?: { code?: string } };
    throw new Error(err?.error?.code || "request_failed");
  }
  return response.data as T;
}
