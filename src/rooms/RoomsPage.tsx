import { useCallback, useState } from "react";
import { usePage } from "../components/Shell";
import { Remote, useRemote } from "../components/Remote";
import { useLocale } from "../i18n/Locale";
import { rooms } from "./client";
import { roomCopy } from "./copy";
import { RoomPage } from "./RoomPage";
import "./rooms.css";
export function RoomsPage() {
  const route = usePage();
  const id = route.startsWith("rooms/") ? route.split("/")[1] : "";
  return id ? <RoomPage key={id} id={id} /> : <Lobby />;
}
export function Lobby() {
  const { lang } = useLocale();
  const p = roomCopy[lang];
  const [cursor, setCursor] = useState("");
  const load = useCallback(() => rooms.list(cursor), [cursor]);
  const state = useRemote(load);
  return (
    <div className="stack">
      <p className="notice">{p.notice}</p>
      <p className="notice">{p.adminManaged}</p>
      <Remote busy={state.busy} err={state.err} retry={state.refresh}>
        <div className="room-cards">
          {state.data?.data.rooms?.map((r) => (
            <a
              className="panel panel-body room-card"
              key={r.id}
              href={"#rooms/" + r.id}
            >
              <span className="badge">{r.status}</span>
              <h3>{r.topic}</h3>
              <p>
                {r.members?.length} {p.members}
              </p>
              <span>{p.open} →</span>
            </a>
          ))}
        </div>
        {state.data?.data.rooms?.length === 0 && <p>{p.empty}</p>}
        {state.data?.data.next_cursor && (
          <button
            className="btn"
            onClick={() => setCursor(state.data!.data.next_cursor)}
          >
            {p.more}
          </button>
        )}
        {cursor && (
          <button className="btn" onClick={() => setCursor("")}>
            {p.back}
          </button>
        )}
      </Remote>
      <p className="muted">{p.mcp}</p>
    </div>
  );
}
