import { test, expect, type Page } from "@playwright/test";
const native = "0x" + "0".repeat(40),
  wallet = "0x" + "1".repeat(40),
  token = "0x" + "2".repeat(40),
  target = "0x" + "3".repeat(40),
  hash = "0x" + "a".repeat(64);
async function setup(page: Page, behavior = "success", locale = "en") {
  await page.addInitScript(
    ({ wallet, hash, behavior, locale }) => {
      localStorage.setItem("0xbot.locale", locale);
      let allowance = behavior === "partial" ? 100n : 0n;
      const calls: unknown[] = [];
      Object.assign(window, {
        swapCalls: calls,
        ethereum: {
          request: async ({
            method,
            params,
          }: {
            method: string;
            params?: any[];
          }) => {
            if (method === "eth_requestAccounts" || method === "eth_accounts")
              return [wallet];
            if (method === "eth_chainId") return "0x1";
            if (method === "eth_call")
              return "0x" + allowance.toString(16).padStart(64, "0");
            if (method === "eth_getTransactionReceipt")
              return { transactionHash: hash, status: "0x1" };
            if (method === "eth_sendTransaction") {
              calls.push(params?.[0]);
              if (behavior === "unknown") throw new Error("transport lost");
              if (behavior === "reject")
                throw Object.assign(new Error("rejected"), { code: 4001 });
              if (params?.[0].data.startsWith("0x095ea7b3"))
                allowance = BigInt("0x" + params[0].data.slice(-64));
              return hash;
            }
            throw new Error("unexpected method " + method);
          },
        },
      });
    },
    { wallet, hash, behavior, locale },
  );
  await page.route("**/v1/**", async (route) => {
    const path = new URL(route.request().url()).pathname;
    const body =
      route.request().method() === "POST" ? route.request().postDataJSON() : {};
    const tokenOf = (network: string, address: string) => ({
      network,
      address,
      symbol: address === native ? "ETH" : "USDC",
      decimals: address === native ? 18 : 6,
      name: address === native ? "Ether" : "USD Coin",
    });
    let data: unknown;
    if (path === "/v1/auth/me")
      data = {
        id: "fixture-user",
        name: "Swap tester",
        workspace_id: "fixture-workspace",
        workspace_name: "Fixture",
        identities: [],
        admin: false,
        mfa: false,
      };
    else if (path === "/v1/swaps/tokens")
      data = {
        id: "catalog",
        provider: "lifi",
        status: "succeeded",
        fee_usd: "0",
        latency_ms: 1,
        data: [tokenOf(body.network, native), tokenOf(body.network, token)],
      };
    else if (path === "/v1/swaps/quote")
      data = {
        id: "quote",
        provider: "lifi",
        status: "succeeded",
        fee_usd: "0",
        latency_ms: 1,
        data: {
          quote_id: "quote-fixture",
          request: body,
          from_token: tokenOf(body.from_network, body.from_token),
          to_token: tokenOf(body.to_network, body.to_token),
          to_amount: "995000000000000000",
          minimum_amount: "990000000000000000",
          tool: "fixture-bridge",
          approval_address: body.from_token === native ? "" : target,
          transaction: {
            network: body.from_network,
            from: wallet,
            to: target,
            value: body.from_token === native ? body.amount : "0",
            data: "0x12345678",
          },
          costs: [],
          fetched_at: new Date().toISOString(),
          expires_at: new Date(Date.now() + 60000).toISOString(),
        },
      };
    else if (path === "/v1/swaps/status")
      data = {
        id: "status",
        provider: "lifi",
        status: "succeeded",
        fee_usd: "0",
        latency_ms: 1,
        data: {
          tx_hash: body.tx_hash,
          state: "unknown",
          substatus: "NOT_FOUND",
          receiving_tx_hash: "",
        },
      };
    else throw new Error("Unexpected API: " + path);
    await route.fulfill({
      json: data,
      headers: {
        "access-control-allow-origin": "http://127.0.0.1:4191",
        "access-control-allow-credentials": "true",
      },
    });
  });
  await page.goto("/#swaps");
}
async function prepare(page: Page, asset = native, locale = "en") {
  await page
    .getByRole("button", {
      name: locale === "en" ? "Connect transaction wallet" : "连接交易钱包",
    })
    .click();
  const tokens = page.getByRole("combobox", {
    name: locale === "en" ? "Token · exact contract" : "代币 · 精确合约",
  });
  await tokens.nth(0).selectOption(asset);
  await tokens.nth(1).selectOption(native);
  await page
    .getByRole("textbox", {
      name: locale === "en" ? "Amount" : "数量",
      exact: true,
    })
    .fill("1");
  await page
    .getByRole("button", {
      name: locale === "en" ? "Get quote" : "获取报价",
      exact: true,
    })
    .click();
  await expect(
    page.getByRole("heading", {
      name: locale === "en" ? "Review transaction" : "核对交易",
    }),
  ).toBeVisible();
}
test("native swap reviews, submits once and preserves unknown status on refresh", async ({
  page,
}) => {
  await setup(page);
  await prepare(page);
  await page.screenshot({
    path: "test-results/swap-desktop.png",
    fullPage: true,
  });
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Confirm swap in wallet" }).click();
  await expect(page.getByText(hash, { exact: true })).toBeVisible();
  await page.getByRole("button", { name: "Check status" }).click();
  await expect(page.getByText(/Status unknown/).first()).toBeVisible();
  expect(await page.evaluate(() => (window as any).swapCalls.length)).toBe(1);
  await page.reload();
  await expect(page.getByText(hash, { exact: true })).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Get quote", exact: true }),
  ).toBeDisabled();
});
test("ERC20 uses exact approval and requires a fresh quote before swap", async ({
  page,
}) => {
  await setup(page);
  await prepare(page, token);
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Approve exact amount" }).click();
  const sent = await page.evaluate(() => (window as any).swapCalls[0]);
  expect(sent.to).toBe(token);
  expect(sent.value).toBe("0x0");
  expect(sent.data).toBe(
    "0x095ea7b3" +
      target.slice(2).padStart(64, "0") +
      1000000n.toString(16).padStart(64, "0"),
  );
  await page.getByRole("button", { name: "Check status" }).click();
  await expect(
    page.getByText("Approval confirmed. Request a new quote to continue."),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Confirm swap in wallet" }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "Get quote", exact: true }).click();
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Confirm swap in wallet" }).click();
  expect(await page.evaluate(() => (window as any).swapCalls.length)).toBe(2);
});
test("ambiguous wallet failure is never retried", async ({ page }) => {
  await setup(page, "unknown");
  await prepare(page);
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "Confirm swap in wallet" }).click();
  await expect(
    page.getByRole("heading", { name: "Transaction tracking" }),
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "Get quote", exact: true }),
  ).toBeDisabled();
  expect(await page.evaluate(() => (window as any).swapCalls.length)).toBe(1);
});
test("rejection does not invent a transaction; Chinese mobile layout fits", async ({
  page,
}) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await setup(page, "reject", "zh");
  await prepare(page, native, "zh");
  await page.screenshot({
    path: "test-results/swap-mobile-zh.png",
    fullPage: true,
  });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "在钱包中确认兑换" }).click();
  await expect(page.getByRole("alert")).toBeVisible();
  await expect(page.getByRole("heading", { name: "交易跟踪" })).toHaveCount(0);
  await expect(
    page.getByRole("button", { name: "获取报价", exact: true }),
  ).toBeEnabled();
});

test("insufficient existing ERC20 allowance is explicitly reset before exact approval", async ({
  page,
}) => {
  await setup(page, "partial");
  await prepare(page, token);
  await page.getByRole("checkbox").check();
  await page
    .getByRole("button", { name: "Reset existing allowance to zero" })
    .click();
  const sent = await page.evaluate(() => (window as any).swapCalls[0]);
  expect(sent.data).toBe(
    "0x095ea7b3" + target.slice(2).padStart(64, "0") + "0".repeat(64),
  );
  await page.getByRole("button", { name: "Check status" }).click();
  await page.getByRole("button", { name: "Get quote", exact: true }).click();
  await expect(
    page.getByRole("button", { name: "Approve exact amount" }),
  ).toBeVisible();
  expect(await page.evaluate(() => (window as any).swapCalls.length)).toBe(1);
});
