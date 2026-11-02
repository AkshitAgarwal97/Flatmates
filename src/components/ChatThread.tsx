"use client";

import { FormEvent, useEffect, useRef, useState } from "react";

type Msg = { id: string; fromId: string; text: string; kind: string; createdAt: string; readBy: string[] };

export function ChatThread({ threadId }: { threadId: string }) {
  const [data, setData] = useState<{
    messages: Msg[];
    me: string;
    other: { id: string; name: string } | null;
    listing: { id: string; title: string } | null;
  } | null>(null);
  const [text, setText] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  async function load() {
    const res = await fetch(`/api/chat/${threadId}`, { cache: "no-store", credentials: "include" });
    if (res.ok) setData(await res.json());
  }

  useEffect(() => {
    void load();
    const t = setInterval(() => void load(), 1500);
    return () => clearInterval(t);
  }, [threadId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [data?.messages.length]);

  async function send(kind: "text" | "visit_request" | "listing_card" = "text") {
    if (pending) return;
    const bodyText = kind === "text" ? text.trim() : "";
    if (kind === "text" && !bodyText) return;
    setError("");
    setPending(true);
    const res = await fetch(`/api/chat/${threadId}`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: bodyText, kind }),
    });
    const j = await res.json().catch(() => ({}));
    setPending(false);
    if (!res.ok) {
      setError(j.error || "Could not send");
      return;
    }
    if (kind === "text") setText("");
    if (j.message) {
      setData((prev) =>
        prev
          ? { ...prev, messages: prev.messages.some((m) => m.id === j.message.id) ? prev.messages : [...prev.messages, j.message] }
          : prev
      );
    }
    await load();
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    await send("text");
  }

  async function block() {
    if (!data?.other) return;
    await fetch(`/api/chat/${threadId}`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "block", userId: data.other.id }),
    });
  }

  if (!data) return <p className="p-6 text-white/60">Loading chat…</p>;

  return (
    <div className="glass flex min-h-[70vh] flex-col rounded-3xl">
      <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
        <div>
          <p className="font-semibold">{data.other?.name || "Chat"}</p>
          <p className="text-xs text-white/50">{data.listing?.title}</p>
        </div>
        <button className="btn-ghost text-xs" onClick={() => void block()}>
          Block & report
        </button>
      </div>
      <div className="flex-1 space-y-2 overflow-y-auto p-4">
        {!data.messages.length && (
          <p className="text-center text-sm text-white/45">No messages yet. Say hello — they will see it in Chat.</p>
        )}
        {data.messages.map((m) => (
          <div
            key={m.id}
            className={`max-w-[80%] rounded-2xl px-3 py-2 text-sm ${m.fromId === data.me ? "ml-auto bg-teal-400 text-slate-950" : "bg-white/10"}`}
          >
            <p className="whitespace-pre-wrap break-words">{m.text}</p>
            <p className={`mt-1 text-[10px] ${m.fromId === data.me ? "text-slate-800/70" : "text-white/40"}`}>
              {new Date(m.createdAt).toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit" })}
              {m.fromId === data.me && m.readBy.length > 1 ? " · read" : ""}
            </p>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>
      {error && <p className="px-4 text-xs text-rose-300">{error}</p>}
      <div className="flex flex-wrap gap-2 px-4 pb-2">
        <button type="button" className="btn-ghost text-xs" disabled={pending} onClick={() => void send("visit_request")}>
          Request visit
        </button>
        <button type="button" className="btn-ghost text-xs" disabled={pending} onClick={() => void send("listing_card")}>
          Share listing
        </button>
      </div>
      <form onSubmit={onSubmit} className="flex flex-wrap gap-2 p-4">
        <input
          className="field flex-1"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Message (no phone/email)"
          disabled={pending}
        />
        <input
          type="file"
          className="text-xs"
          onChange={async (e) => {
            const f = e.target.files?.[0];
            e.target.value = "";
            if (!f) return;
            const fd = new FormData();
            fd.append("file", f);
            const up = await fetch("/api/upload", { method: "POST", credentials: "include", body: fd });
            const j = await up.json();
            if (up.ok) setText((t) => `${t} Photo:${j.url}`);
            else setError(j.error || "Photo upload failed");
          }}
        />
        <button className="btn" disabled={pending || !text.trim()}>
          {pending ? "Sending…" : "Send"}
        </button>
      </form>
    </div>
  );
}
