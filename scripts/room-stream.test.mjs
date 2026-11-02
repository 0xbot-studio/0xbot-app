import { test } from "node:test";
import assert from "node:assert/strict";
import { readRoomStream, retryDelay, delay } from "../src/rooms/liveStream.ts";

test("SSE frames are delivered before close, including split UTF-8 and heartbeats", async () => {
  let controller;
  const stream = new ReadableStream({ start(c) { controller = c; } });
  const frames = [];
  const read = readRoomStream(stream, (event, data) => frames.push({ event, data }));
  const encoded = new TextEncoder().encode(': heartbeat\n\nevent: room_snapshot\r\ndata: {"body":"中文"}\r\n\r\n');
  for (const byte of encoded) controller.enqueue(Uint8Array.of(byte));
  await new Promise(resolve => setImmediate(resolve));
  assert.deepEqual(frames, [{ event: "room_snapshot", data: '{"body":"中文"}' }]);
  controller.enqueue(new TextEncoder().encode('event: room_reconnect\ndata: {}\n\n'));
  controller.close();
  await read;
  assert.equal(frames[1].event, "room_reconnect");
});

test("SSE callback failure cancels the reader", async () => {
  let cancelled = false;
  const stream = new ReadableStream({ start(c) { c.enqueue(new TextEncoder().encode('event: room_error\ndata: {}\n\n')); }, cancel() { cancelled = true; } });
  await assert.rejects(readRoomStream(stream, () => { throw Error("authentication_required"); }), /authentication_required/);
  assert.equal(cancelled, true);
});

test("retries are bounded, rate-limit aware, and do not retry authorization failures", () => {
  for (const code of ["stream_401", "stream_403", "stream_404", "authentication_required", "invalid_room_stream"]) assert.equal(retryDelay(Error(code), 1), null);
  assert.equal(retryDelay(Error("stream_429"), 1), 60000);
  assert.equal(retryDelay(Error("network"), 1), 1000);
  assert.equal(retryDelay(Error("network"), 6), 30000);
  assert.equal(retryDelay(Error("network"), 7), null);
});

test("leaving a room cancels pending retry delay", async () => {
  const controller = new AbortController();
  const waiting = delay(60000, controller.signal);
  controller.abort();
  await assert.rejects(waiting);
});
