"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Row = {
  thread: { id: string; lastAt: string };
  other: { id: string; name: string } | null;
  listing: { title: string } | null;
  last: { text: string } | null;
  unread: number;
};

export function ChatInbox() {
  const [threads, setThreads] = useState<Row[] | null>(null);

  async function load() {
    const res = await fetch("/api/chat", { cache: "no-store", credentials: "include" });
    if (!res.ok) return;
    const data = await res.json();
    setThreads(data.threads || []);
  }

  useEffect(() => {
    void load();
    const t = setInterval(() => void load(), 2000);
    return () => clearInterval(t);
  }, []);

  if (!threads) {
    return (
      <div className="space-y-3" aria-busy>
        <div className="skeleton h-20 rounded-2xl" />
        <div className="skeleton h-20 rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {!threads.length && <p className="muted">No conversations yet. Open a listing and tap Chat securely.</p>}
      {threads.map((row) => (
        <Link key={row.thread.id} href={`/chat/${row.thread.id}`} className="glass block rounded-2xl p-4">
          <div className="flex items-center justify-between gap-3">
            <p className="font-semibold">{row.other?.name || "Unknown"}</p>
            {row.unread > 0 && (
              <span className="rounded-full bg-teal-400 px-2 py-0.5 text-xs font-semibold text-slate-950">{row.unread} new</span>
            )}
          </div>
          <p className="text-xs text-white/50">{row.listing?.title}</p>
          <p className="mt-1 line-clamp-1 text-sm text-white/70">{row.last?.text}</p>
        </Link>
      ))}
    </div>
  );
}
