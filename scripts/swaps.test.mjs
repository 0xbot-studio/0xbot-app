import test from 'node:test';
import assert from 'node:assert/strict';
import { toUnits } from '../src/swaps/amount.ts';
import { createServer } from 'vite';
test('swap amounts stay exact and reject excess precision or overflow',()=>{
 assert.equal(toUnits('9007199254740993.000001',6),'9007199254740993000001');
 assert.equal(toUnits('0.000000000000000001',18),'1');
 for(const amount of ['0','-1','1e18','1.0000001','Infinity',(2n**256n).toString()])assert.throws(()=>toUnits(amount,6));
});
test('wallet rejects stale/account/chain changes before any transaction prompt',async()=>{
 const server=await createServer({server:{middlewareMode:true,hmr:false},appType:'custom'});
 try{
  const {checkWallet}=await server.ssrLoadModule('/src/swaps/wallet.ts');
  const q={expires_at:new Date(Date.now()+60000).toISOString(),request:{wallet:'0x'+'1'.repeat(40),from_network:'eip155:1'}};
  const signal=new AbortController().signal;
  let calls=[];
  const wallet={request:async({method})=>{calls.push(method);return method==='eth_accounts'?['0x'+'2'.repeat(40)]:'0x1'}};
  await assert.rejects(checkWallet(wallet,q,signal),/swap_wallet_changed/);
  wallet.request=async({method})=>method==='eth_accounts'?[q.request.wallet]:'0x38';
  await assert.rejects(checkWallet(wallet,q,signal),/swap_chain/);
  q.expires_at=new Date(0).toISOString();
  await assert.rejects(checkWallet(wallet,q,signal),/swap_expired/);
  assert.ok(!calls.includes('eth_sendTransaction'));
 }finally{await server.close()}
});
test('one wallet prompt at a time; ambiguous errors retain the recovery lock',async()=>{
 const server=await createServer({server:{middlewareMode:true,hmr:false},appType:'custom'});
 const saved=globalThis.sessionStorage;
 const values=new Map();
 Object.defineProperty(globalThis,'sessionStorage',{configurable:true,value:{getItem:k=>values.get(k)||null,setItem:(k,v)=>values.set(k,v),removeItem:k=>values.delete(k)}});
 try{
  const {submit,readPending}=await server.ssrLoadModule('/src/swaps/wallet.ts');
  const address='0x'+'1'.repeat(40),native='0x'+'0'.repeat(40);
  const q={expires_at:new Date(Date.now()+60000).toISOString(),request:{wallet:address,from_network:'eip155:1',to_network:'eip155:8453',from_token:native,amount:'100'},transaction:{to:'0x'+'2'.repeat(40),data:'0x12345678',value:'100'}};
  let sends=0,resolveSend;
  const wallet={request:async({method,params})=>{
   if(method==='eth_accounts')return [address];
   if(method==='eth_chainId')return '0x1';
   if(method==='eth_sendTransaction'){sends++;assert.equal(params[0].chainId,'0x1');return await new Promise(resolve=>{resolveSend=resolve})}
   throw Error('unexpected method');
  }};
  const signal=new AbortController().signal;
  const first=submit(wallet,'one',q,'swap',signal,()=>{});
  await assert.rejects(submit(wallet,'one',q,'swap',signal,()=>{}),/swap_pending/);
  for(let i=0;i<20 && !resolveSend;i++)await new Promise(resolve=>setImmediate(resolve));
  assert.equal(sends,1);assert.equal(readPending('one').state,'unknown');
  resolveSend(undefined);
  await assert.rejects(first,/swap_unknown/);
  await assert.rejects(submit(wallet,'one',q,'swap',signal,()=>{}),/swap_pending/);
  assert.equal(sends,1);
  assert.equal(readPending('another-workspace'),null);
 }finally{Object.defineProperty(globalThis,'sessionStorage',{configurable:true,value:saved});await server.close()}
});
