import test from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'vite';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {messageCopy} from '../src/messages/copy.ts';

test('message pages keep privacy notice, separate identity boundary and explicit send confirmation',async()=>{
 const server=await createServer({server:{middlewareMode:true},appType:'custom'});
 try{
  for(const page of ['SendMessagePage','InboxPage','MessageDetailPage']){
   const m=await server.ssrLoadModule('/src/messages/'+page+'.tsx');
   const html=renderToStaticMarkup(createElement(m[page]));
   assert.ok(html.includes('PADIN Inbox'));assert.ok(html.includes('Not end-to-end encrypted'));assert.ok(html.includes('data:read API keys cannot'));
  }
  const {SendForm}=await server.ssrLoadModule('/src/messages/SendMessagePage.tsx');
  const html=renderToStaticMarkup(createElement(SendForm,{wallet:'0x'+'a'.repeat(40),onReset(){}}));
  assert.match(html,/<button[^>]*disabled=""[^>]*>Send to PADIN Inbox/);
  assert.ok(html.includes('I confirm this recipient and message'));
  assert.ok(!html.includes('localStorage'));
  assert.deepEqual(Object.keys(messageCopy.en).sort(),Object.keys(messageCopy.zh).sort());
 }finally{await server.close()}
});
