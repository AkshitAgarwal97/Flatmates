"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ChatStart({ listingId }: { listingId: string }) {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState("");
  async function start() {
    setPending(true);
    setError("");
    const res = await fetch("/api/chat", {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ listingId, text: "Hi, is this still available?" }),
    });
    const data = await res.json().catch(() => ({}));
    setPending(false);
    if (res.ok) router.push(`/chat/${data.thread.id}`);
    else setError(data.error || "Could not start chat");
  }
  return (
    <div>
      <button className="btn mt-3 w-full" onClick={() => void start()} disabled={pending}>
        {pending ? "Opening…" : "Chat securely"}
      </button>
      {error && <p className="mt-2 text-xs text-rose-300">{error}</p>}
    </div>
  );
}
