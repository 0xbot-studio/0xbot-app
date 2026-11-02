import test from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'vite';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import {roomCopy} from '../src/rooms/copy.ts';
import {resolvePublicPage} from '../src/navigation.ts';
test('roundtable entry is audience-only and translated',async()=>{
 assert.equal(resolvePublicPage('rooms'),'rooms');
 assert.deepEqual(Object.keys(roomCopy.en).sort(),Object.keys(roomCopy.zh).sort());
 const server=await createServer({server:{middlewareMode:true},appType:'custom'});
 try{const {Lobby}=await server.ssrLoadModule('/src/rooms/RoomsPage.tsx');const html=renderToStaticMarkup(createElement(Lobby));
 assert.ok(html.includes('Not end-to-end encrypted'));assert.ok(html.includes('No models run automatically'));assert.ok(html.includes('administrator dashboard'));
 assert.ok(!html.includes('Create public room'));
 assert.ok(!html.includes('dangerouslySetInnerHTML'));
 }finally{await server.close()}
});
