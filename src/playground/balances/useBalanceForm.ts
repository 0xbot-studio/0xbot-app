import { useCallback, useState } from "react";
import { api, result } from "../../api/client";
import type { BalanceInput } from "../../api/networks";
import { useRemote } from "../../components/Remote";
import { eligibleProviders } from "../catalog";
const loadRoutes = async () => {
  const [providers, capabilities] = await Promise.all([
    api.GET("/v1/providers"),
    api.GET("/v1/capabilities"),
  ]);
  return { providers: result(providers), capabilities: result(capabilities) };
};
export function useBalanceForm(capability: string) {
  const [input, setInput] = useState<BalanceInput>({
    address: "",
    network: "eip155:1",
    provider: "auto",
  });
  const routes = useRemote(useCallback(loadRoutes, []));
  const providers = eligibleProviders(
    routes.data?.providers || [],
    capability,
    input.network,
  );
  const supported = routes.data?.capabilities.some(
    (c) =>
      c.id === capability &&
      ["preview", "available"].includes(c.status) &&
      c.networks.includes(input.network),
  );
  const ready =
    !routes.busy &&
    !routes.err &&
    supported &&
    providers.length > 0 &&
    (input.provider === "auto" ||
      providers.some((p) => p.id === input.provider));
  return { input, setInput, routes, providers, ready: Boolean(ready) };
}
export type BalanceForm = ReturnType<typeof useBalanceForm>;
const loadTokens = async () => result(await api.GET("/v1/tokens"));
export function useTokens() {
  return useRemote(useCallback(loadTokens, []));
}
