import { api, result } from "../api/client";
import type { components } from "../api/schema";
import { readRoomStream } from "./liveStream";
export type RoomResult = components["schemas"]["RoomResult"];
export type Room = RoomResult["data"]["room"];
export const rooms = {
  list: (before_id = "") =>
    api.POST("/v1/rooms/list", { body: { before_id, limit: 20 } }).then(result),
  get: (room_id: string, signal?: AbortSignal) =>
    api.POST("/v1/rooms/get", { body: { room_id }, signal }).then(result),
  join: (body: components["schemas"]["RoomJoinInput"], signal?: AbortSignal) =>
    api.POST("/v1/rooms/join", { body, signal }).then(result),
  post: (body: components["schemas"]["RoomPostInput"], signal?: AbortSignal) =>
    api.POST("/v1/rooms/post", { body, signal }).then(result),
  question: (
    body: components["schemas"]["RoomQuestionInput"],
    signal?: AbortSignal,
  ) => api.POST("/v1/rooms/question", { body, signal }).then(result),
};
export async function watchRoom(
  id: string,
  after: number,
  signal: AbortSignal,
  onSnapshot: (value: RoomResult) => void,
) {
  const response = await api.GET("/v1/rooms/{id}/stream", {
    params: { path: { id }, query: { after_seq: after, live: true } },
    signal: AbortSignal.any([signal, AbortSignal.timeout(35_000)]),
    parseAs: "stream",
  });
  if (!response.response.ok)
    throw new Error(`stream_${response.response.status}`);
  if (
    !response.data ||
    !response.response.headers
      .get("Content-Type")
      ?.includes("text/event-stream")
  )
    throw new Error("invalid_room_stream");
  let renewed = false;
  await readRoomStream(response.data, (event, data) => {
    if (event === "room_reconnect") {
      renewed = true;
      return;
    }
    if (event === "room_error")
      throw new Error(JSON.parse(data).code || "request_failed");
    if (event !== "room_snapshot") return;
    const snapshot = JSON.parse(data) as RoomResult;
    if (
      snapshot.data?.room?.id !== id ||
      !Number.isSafeInteger(snapshot.data.room.seq) ||
      snapshot.data.room.seq < 0
    )
      throw new Error("invalid_room_stream");
    onSnapshot(snapshot);
  });
  if (!renewed) throw new Error("room_stream_disconnected");
}
export async function streamBatch(
  id: string,
  after: number,
  signal: AbortSignal,
) {
  const response = await api.GET("/v1/rooms/{id}/stream", {
    params: { path: { id }, query: { after_seq: after } },
    signal,
    parseAs: "text",
  });
  if (!response.response.ok)
    throw new Error(`stream_${response.response.status}`);
  // This endpoint intentionally returns one bounded SSE batch before closing.
  const line = (response.data || "")
    .split("\n")
    .find((l) => l.startsWith("data: "));
  if (!line) throw new Error("invalid_room_stream");
  return JSON.parse(line.slice(6)) as components["schemas"]["RoomEventsResult"];
}
