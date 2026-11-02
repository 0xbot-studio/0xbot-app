import { useCallback, useEffect, useState } from "react";
import { Remote, useRemote } from "../components/Remote";
import { useLocale } from "../i18n/Locale";
import { rooms, type RoomResult } from "./client";
import { useRoomLive } from "./useRoomLive";
import { useTranscriptScroll } from "./useTranscriptScroll";
import { roomCopy } from "./copy";
import { useRoomMutation } from "./useMutation";
export function RoomPage({ id }: { id: string }) {
  const { lang, error } = useLocale();
  const p = roomCopy[lang];
  const load = useCallback(() => rooms.get(id), [id]);
  const state = useRemote(load);
  const [current, setCurrent] = useState<RoomResult | null>(null);
  const accept = useCallback((out: RoomResult) => {
    setCurrent((old) =>
      old &&
      old.data.room.id === out.data.room.id &&
      old.data.room.seq >= out.data.room.seq
        ? old
        : out,
    );
  }, []);
  useEffect(() => {
    if (state.data)
      setCurrent((old) =>
        old && old.data.room.seq > state.data!.data.room.seq
          ? old
          : state.data!,
      );
  }, [state.data]);
  const initialized = !!current;
  const live = useRoomLive(id, initialized, accept);
  const [name, setName] = useState("");
  const [body, setBody] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const mutation = useRoomMutation((out) => {
    setCurrent((old) =>
      old && old.data.room.seq > out.data.room.seq ? old : out,
    );
    setBody("");
    setConfirmed(false);
  });
  const r = current?.data.room;
  const transcript = useTranscriptScroll(
    r?.events?.filter(
      (event) => event.kind === "message" || event.kind === "question",
    ).length ?? 0,
  );
  const self = current?.data.self_id;
  const member = r?.members?.find((m) => m.id === self);
  function publish(question: boolean) {
    if (!r || !confirmed || !body.trim()) return;
    const input = {
      room_id: id,
      body,
      expected_turn: r.turn,
      idempotency_key: crypto.randomUUID(),
    };
    mutation.run((signal) =>
      question ? rooms.question(input, signal) : rooms.post(input, signal),
    );
  }
  return (
    <div className="stack">
      <a href="#rooms">← {p.back}</a>
      <p className="notice">{p.notice}</p>
      <Remote busy={state.busy} err={state.err} retry={state.refresh}>
        {r && (
          <>
            <section className="panel panel-body">
              <div className="row between">
                <h2>{r.topic}</h2>
                <span className="badge">
                  {r.status === "closed"
                    ? p.closed
                    : r.status === "lobby"
                      ? p.lobby
                      : p.live}
                </span>
              </div>
              <p>
                {p.turn}: {r.turn} / {r.max_rounds * (r.speakers?.length || 0)}
              </p>
              <code>{id}</code>
              <p className="muted">
                {p.signed}: {self?.slice(0, 12)}…
              </p>
              <p role="status">{p[live.status]}</p>
              {live.status === "stopped" && live.error != null && (
                <div role="alert">
                  {error(live.error)}{" "}
                  <button className="btn" onClick={live.retry}>
                    {p.retry}
                  </button>
                </div>
              )}
            </section>
            <div className="room-layout">
              <section className="panel panel-body stack">
                <h3>{p.members}</h3>
                {r.members?.map((m) => (
                  <div key={m.id} className="room-member">
                    <strong>{m.name}</strong>{" "}
                    <span className="badge">{m.role}</span>
                    <small>
                      {m.id.slice(0, 12)}…{" "}
                      {m.id === r.current_speaker ? " ←" : ""}
                    </small>
                  </div>
                ))}
                {!member && r.status !== "closed" && (
                  <form
                    className="fields"
                    onSubmit={(e) => {
                      e.preventDefault();
                      const input = {
                        room_id: id,
                        name,
                        idempotency_key: crypto.randomUUID(),
                      };
                      mutation.run((signal) => rooms.join(input, signal));
                    }}
                  >
                    <label>
                      {p.name}
                      <input
                        required
                        maxLength={60}
                        value={name}
                        disabled={!!mutation.pending}
                        onChange={(e) => setName(e.target.value)}
                      />
                    </label>
                    <button
                      className="btn"
                      disabled={!!mutation.pending || !name.trim()}
                    >
                      {p.join}
                    </button>
                  </form>
                )}
              </section>
              <section className="stack" aria-label={p.body}>
                <div
                  className="room-transcript"
                  ref={transcript.ref}
                  onScroll={transcript.onScroll}
                  tabIndex={0}
                  aria-label={p.body}
                >
                  {r.events
                    ?.filter(
                      (e) => e.kind === "message" || e.kind === "question",
                    )
                    .map((e) => (
                      <article
                        className="panel panel-body"
                        key={e.seq}
                        id={"event-" + e.seq}
                      >
                        <div className="row between">
                          <strong>
                            {r.members?.find((m) => m.id === e.participant_id)
                              ?.name || e.participant_id.slice(0, 12)}
                          </strong>
                          <small>
                            #{e.seq} · {e.kind} ·{" "}
                            {new Date(e.created_at).toLocaleTimeString(lang)}
                          </small>
                        </div>
                        <pre className="room-body">{e.body}</pre>
                        {e.reply_to > 0 && (
                          <a
                            href={"#rooms/" + id}
                            onClick={(event) => {
                              event.preventDefault();
                              document
                                .getElementById("event-" + e.reply_to)
                                ?.scrollIntoView();
                            }}
                          >
                            ↳ #{e.reply_to}
                          </a>
                        )}
                      </article>
                    ))}
                  {!r.events?.some(
                    (e) => e.kind === "message" || e.kind === "question",
                  ) && <p>{p.noMessages}</p>}
                </div>
                {transcript.unread && (
                  <button className="btn" onClick={transcript.latest}>
                    {p.newMessages}
                  </button>
                )}
                {member && r.status !== "closed" && (
                  <section className="panel panel-body fields">
                    <p>{p.readOnly}</p>
                    <label>
                      {p.body}
                      <textarea
                        rows={5}
                        maxLength={4096}
                        disabled={!!mutation.pending}
                        value={body}
                        onChange={(e) => {
                          setBody(e.target.value);
                          setConfirmed(false);
                        }}
                      />
                    </label>
                    <label className="row">
                      <input
                        type="checkbox"
                        checked={confirmed}
                        disabled={!!mutation.pending}
                        onChange={(e) => setConfirmed(e.target.checked)}
                      />
                      {p.confirm}
                    </label>
                    <div className="row">
                      <button
                        className="btn primary"
                        disabled={
                          !!mutation.pending ||
                          !confirmed ||
                          !body.trim() ||
                          r.current_speaker !== self
                        }
                        onClick={() => publish(false)}
                      >
                        {p.post}
                      </button>
                      <button
                        className="btn"
                        disabled={
                          !!mutation.pending || !confirmed || !body.trim()
                        }
                        onClick={() => publish(true)}
                      >
                        {p.question}
                      </button>
                    </div>
                  </section>
                )}
              </section>
            </div>
            {mutation.err != null && (
              <section className="notice error" role="alert">
                {error(mutation.err)}
                <p>{p.unknown}</p>
                <button
                  className="btn"
                  disabled={mutation.busy}
                  onClick={mutation.retry}
                >
                  {p.retry}
                </button>
                <button
                  className="btn"
                  disabled={mutation.busy}
                  onClick={() => {
                    if (confirm(p.discardConfirm)) mutation.discard();
                  }}
                >
                  {p.discard}
                </button>
                <button className="btn" onClick={live.retry}>
                  {p.refresh}
                </button>
              </section>
            )}
            {r.status === "closed" && (
              <section className="panel panel-body">
                <h2>{p.recap}</h2>
                <p className="notice">
                  {r.summary.kind === "submitted" ? p.submitted : p.extractive}
                </p>
                <button className="btn" onClick={state.refresh}>
                  {p.refresh}
                </button>
                <pre className="room-body">{r.summary.text}</pre>
                <div className="row">
                  {r.summary.message_seqs?.map((seq) => (
                    <button
                      className="btn small"
                      key={seq}
                      onClick={() =>
                        document
                          .getElementById("event-" + seq)
                          ?.scrollIntoView()
                      }
                    >
                      #{seq}
                    </button>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </Remote>
      <p className="muted">{p.mcp}</p>
    </div>
  );
}
