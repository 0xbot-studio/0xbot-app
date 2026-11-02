import test from 'node:test';
import assert from 'node:assert/strict';
import { createServer } from 'vite';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

test('independent pages render their own capability and endpoint; planned pages do not execute', async () => {
  const server = await createServer({ server: { middlewareMode: true }, appType: 'custom' });
  try {
    for (const [page, capability, endpoint] of [
      ['NativeBalancePage', 'data.balance', '/v1/data/balance'],
      ['TokenBalancePage', 'data.token_balance', '/v1/data/token-balance'],
      ['CommonBalancesPage', 'data.balances', '/v1/data/balances'],
      ['NFTDetailPage', 'nft.token', '/v1/nft/token'],
      ['NFTOwnerPage', 'nft.owner', '/v1/nft/owner'],
      ['NFTBalancePage', 'nft.balance', '/v1/nft/balance'],
      ['TokenBoundResolvePage', 'data.token_bound_account.resolve', '/v1/data/token-bound-account/resolve'],
      ['TokenBoundInspectPage', 'data.token_bound_account.get', '/v1/data/token-bound-account/get'],
      ['AssetPricePage','market.asset_price','/v1/prices/asset'],
      ['TokenPricePage','market.token_price','/v1/prices/token'],
    ]) {
      const module = await server.ssrLoadModule('/src/playground/pages/' + page + '.tsx');
      const html = renderToStaticMarkup(createElement(module[page]));
      assert.ok(html.includes(capability));
      assert.ok(html.includes(endpoint));
      if(page==='AssetPricePage')assert.match(html,/<option[^>]*selected=""[^>]*>BTC/);
      else assert.match(html, /<button[^>]*disabled=""[^>]*>Run query/);
    }
    const { PlannedQueryPage } = await server.ssrLoadModule('/src/playground/pages/PlannedQueryPage.tsx');
    const {validTokenID,validAddress}=await server.ssrLoadModule('/src/playground/nft/fields.tsx');
    assert.equal(validTokenID((2n**256n-1n).toString()),true);
    for(const value of [(2n**256n).toString(),'01','1e9','-1',''])assert.equal(validTokenID(value),false);
    assert.equal(validAddress('0x'+'0'.repeat(40)),false);
    const { entries } = await server.ssrLoadModule('/src/playground/catalog.ts');
    for (const entry of entries.filter(e => e.planned)) {
      const html = renderToStaticMarkup(createElement(PlannedQueryPage, { entry }));
      assert.ok(html.includes('not implemented yet'));
      assert.ok(!html.includes('<form'));
      assert.ok(!html.includes('curl '));
    }
  } finally { await server.close(); }
});
