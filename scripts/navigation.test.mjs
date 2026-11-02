import test from 'node:test';
import assert from 'node:assert/strict';
import {resolvePublicPage} from '../src/navigation.ts';
test('retired provider directory falls back to overview without affecting query pages',()=>{
  assert.equal(resolvePublicPage('providers'),'overview');
  assert.equal(resolvePublicPage('unknown'),'overview');
  for(const page of ['overview','playground','keys','requests','usage','settings'])assert.equal(resolvePublicPage(page),page);
});
