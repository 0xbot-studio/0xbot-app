import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeLocale, supportedLocales } from '../src/i18n/locales.ts';
import { copy } from '../src/i18n/copy.ts';
import { oauthCopy } from '../src/oauth/copy.ts';
import { createServer } from 'vite';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';

test('English is default and Chinese preferences remain supported', () => {
  assert.deepEqual(supportedLocales,['en','zh']);
  assert.deepEqual(Object.keys(copy),['en','zh']);
  assert.deepEqual(Object.keys(oauthCopy),['en','zh']);
  assert.equal(normalizeLocale('zh'),'zh');
  for(const value of ['zh-CN','ja','ko',null,'']) assert.equal(normalizeLocale(value),'en');
});

test('login honors Chinese preferences and defaults new users to English with a toggle', async () => {
  const server = await createServer({server:{middlewareMode:true,hmr:false},appType:'custom'});
  globalThis.localStorage={getItem:()=> 'zh'};
  try {
    const {LocaleProvider}=await server.ssrLoadModule('/src/i18n/Locale.tsx');
    const {Login}=await server.ssrLoadModule('/src/auth/Login.tsx');
    const {Shell}=await server.ssrLoadModule('/src/components/Shell.tsx');
    const shell=renderToStaticMarkup(createElement(LocaleProvider,null,createElement(Shell,{user:{name:'Test'},page:'overview',onLogout:async()=>{}},null)));
    assert.ok(!shell.includes('href="#providers"'));
    assert.ok(shell.includes('href="#playground"'));
    const html=renderToStaticMarkup(createElement(LocaleProvider,null,createElement(Login,{onLogin:async()=>{}})));
    assert.ok(html.includes('locale-float'));
    assert.ok(/[\p{Script=Han}]/u.test(html));
    assert.ok(html.includes('EN'));
    globalThis.localStorage={getItem:()=>null};
    const english=renderToStaticMarkup(createElement(LocaleProvider,null,createElement(Login,{onLogin:async()=>{}})));
    assert.ok(english.includes('Connect wallet'));
    assert.ok(english.includes('中文'));
  } finally {delete globalThis.localStorage;await server.close();}
});
