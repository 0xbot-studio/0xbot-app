import test from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { entries, parsePlaygroundRoute, eligibleProviders } from '../src/playground/catalog.ts';
import { requestExamples } from '../src/playground/components/examples.ts';
import { createRequestGate } from '../src/playground/execution/requestGate.ts';

test('legacy link, independent links and unknown routes', () => {
  assert.equal(parsePlaygroundRoute('playground'), 'native-balance');
  for (const entry of entries) assert.equal(parsePlaygroundRoute('playground/' + entry.slug), entry.slug);
  assert.equal(parsePlaygroundRoute('playground/unknown'), 'unknown');
  assert.equal(new Set(entries.map(e => e.slug)).size, entries.length);
  assert.deepEqual(entries.filter(e => !e.planned).map(e => e.id), ['rooms.get', 'messaging.send', 'messaging.list', 'messaging.get', 'market.asset_price','market.token_price','data.balance', 'data.token_balance', 'data.balances', 'nft.token', 'nft.owner', 'nft.balance', 'data.token_bound_account.resolve', 'data.token_bound_account.get']);
});
test('eligibility requires capability, network, enabled route and closed circuit', () => {
  const good = { enabled: true, networks: ['eip155:1'], capabilities: ['data.balance'], health: 'healthy' };
  const candidates = [good, { ...good, enabled: false }, { ...good, networks: ['eip155:56'] }, { ...good, capabilities: ['nft.token'] }, { ...good, health: 'circuit_open' }];
  assert.deepEqual(eligibleProviders(candidates, 'data.balance', 'eip155:1'), [good]);
});
test('cancelled, unmounted and superseded requests cannot deliver late results', async () => {
  const gate = createRequestGate();
  const first = gate.begin();
  const second = gate.begin();
  assert.equal(first.aborted, true);
  assert.equal(gate.accepts(first), false);
  assert.equal(gate.accepts(second), true);
  gate.cancel();
  await Promise.resolve();
  assert.equal(gate.accepts(second), false);
  assert.equal(gate.accepts(gate.begin()), true);
});
test('cURL is one executable command; JSON and MCP preserve exactly the same inputs', () => {
  const body = { address: "0x0000000000000000000000000000000000000000", network: 'eip155:56', note: "don't expand $(echo unsafe)" };
  const examples = requestExamples('/v1/data/balances', 'get_common_balances', body);
  assert.deepEqual(JSON.parse(examples.json), body);
  assert.deepEqual(JSON.parse(examples.mcp), { name: 'get_common_balances', arguments: body });
  // Shadow curl with a harmless function; no network request or real credential.
  const script = 'curl() { for arg do printf "%s\\0" "$arg"; done; }; ' + examples.curl;
  const args = execFileSync('/bin/sh', ['-c', script], { env: { OXBOT_API_KEY: 'test-placeholder' } }).toString().split('\0');
  assert.equal(args[0], 'https://api.0xbot.org/v1/data/balances');
  assert.equal(args[2], 'Authorization: Bearer test-placeholder');
  assert.deepEqual(JSON.parse(args[6]), body);
});
