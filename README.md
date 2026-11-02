# 0xbot app

Independent React/TypeScript user workspace. Warm cream design; English is the default with Simplified Chinese and language switches retained. Existing zh preferences are honored; new users and unsupported locales use en. The locale/resource structure remains extensible for future Korean and Japanese. Dashboard and backend API language behavior is unchanged.

## Develop

Node 22.21+; npm ci, npm run dev. npm run build creates dist/. npm run typecheck validates types. Set VITE_API_URL for non-default APIs; development defaults to http://localhost:8095 and production to https://api.0xbot.org. Your exact browser origin must be allowed by the API.

Generate the client with OPENAPI_SOURCE=/path/to/versioned/openapi.json npm run generate:api; if omitted it reads the published contract. Do not edit src/api/schema.d.ts.

The Dockerfile performs an independent production build and serves on port 8080 as the unprivileged nginx user. No backend credentials are part of frontend configuration.

Wallet signature and X are the only sign-in entries. X remains disabled until configured on the API. Personal workspace, read-only API keys, playground, requests, usage, providers and identity binding are implemented.

Playground supports native assets, curated USDT/USDC contracts and common-asset queries on Ethereum, BSC and Polygon. Token options come from the API registry; variants are displayed separately. Quantities use exact string formatting, covered by `npm test` (Node 22.21+).

## MCP authorization

`#oauth/<request-id>` is the browser consent route reached only after the authorization server validates the client request. Existing login precedes explicit consent. The request is bound to an HttpOnly API cookie; the app receives no access or refresh tokens. Account settings lists connected MCP apps and can revoke them. Login alone is not consent, and website logout is not grant revocation. Network/API failures must not trigger automatic approval or retries of consent POST. Production requires the existing no-referrer / frame-ancestors protection from host Nginx.

## Playground page structure

Each live query has an independent component under `src/playground/pages/` and a shareable hash route: `#playground/native-balance`, `#playground/token-balance`, `#playground/common-balances`. The old `#playground` link defaults to native balance. Unknown child routes show a not-found state. Address and credential values are not included in URLs.

`Playground.tsx` only composes the catalog and selected page. Balance pages use shared balance controls and results but retain separate typed API calls. Request cancellation and stale-response suppression live in `execution/`; code examples live in `components/`. Server capability and provider declarations gate execution. Add a new page, catalog entry, local page registration, bilingual copy and tests when implementing a new capability; do not add a new API branch to a universal form.

Transaction, receipt and NFT catalog entries are optional planned previews only; they issue no requests. Form state is currently page-local and resets when navigating away (no persisted drafts). Result details retain the submitted input snapshot and flag later edits. Cancelling stops client waiting, not necessarily server execution or metering.

`npm test` covers route resolution, eligible-provider filtering, stale-request gates, exact amounts, shell-safe request examples and server-rendered page boundaries. It does not replace browser interaction/visual testing.

Engineering policy: root AGENTS.md baseline 2026-09-07 is mirrored in docs/engineering-policy.md for independent checkouts. Local AGENTS.md defines project-specific boundaries.

### Token swaps

`#swaps` provides LI.FI quotes, exact-amount ERC-20 approvals and EVM wallet
submission. The generated client talks only to 0xbot; the upstream key stays in
API runtime configuration. Configure the API's `LIFI_API_KEY` or explicitly enable `LIFI_PUBLIC_ACCESS=true`.
Public quote capacity is shared and much lower than authenticated capacity. Supported:
Ethereum, Optimism, BSC, Polygon, Base and Arbitrum with a browser EIP-1193 wallet.
Non-EVM wallets and WalletConnect are outside this first release.

A wallet connection is separate from authentication. Each reset/approval/swap
requires an explicit review checkbox and wallet prompt. Existing insufficient
nonzero allowance is reset to zero first. After approval, fetch a fresh quote.
Account, chain, allowance and expiry are rechecked before prompting. No automatic
broadcast retry. Ambiguous wallet errors keep the transaction locked for review;
source-chain mining alone does not mean a cross-chain swap completed.

The tab's sessionStorage keeps a minimal recovery receipt (workspace key, networks,
kind, timestamp and optional tx hash), not wallet addresses or quote drafts. It
survives reload/navigation in the same tab; it is not server execution history or
a cross-device lock. Closing the tab removes it. Wallet history remains the source
for recovering a missing hash. Only clear an unknown transaction after checking
wallet activity and a block explorer. There is no background polling.

`npm run test:e2e` runs mocked wallet/API browser flows without spending funds;
install Chromium with `npx playwright install chromium` if needed. Unit tests cover
exact amounts and wallet identity/chain/expiry checks. Browser fixtures are isolated
in `e2e/`, never shipped to production.

## License

Apache-2.0, see [LICENSE](LICENSE). The 0xbot name, logo and 0xbot.org domains are project trademarks and are not licensed for third-party deployments — please rebrand self-hosted forks. Platform overview, architecture and ADRs: [0xbot-studio/0xbot](https://github.com/0xbot-studio/0xbot).
