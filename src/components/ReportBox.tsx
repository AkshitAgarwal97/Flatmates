"use client";

import { useState } from "react";

const REASONS = [
  { id: "broker", label: "Broker spam" },
  { id: "fake", label: "Fake listing" },
  { id: "scammer", label: "Scam / fraud" },
  { id: "inaccurate_rent", label: "Wrong rent" },
  { id: "already_occupied", label: "Already occupied" },
] as const;

type Status = "idle" | "loading" | "success" | "error";

export function ReportBox({ listingId }: { listingId: string }) {
  const [status, setStatus] = useState<Status>("idle");
  const [msg, setMsg] = useState("");
  const [done, setDone] = useState(false);

  async function report(reason: string) {
    if (done || status === "loading") return;
    setStatus("loading");
    setMsg("");
    const res = await fetch(`/api/listings/${listingId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "report", reason }),
    });
    const data = await res.json();
    if (res.ok) {
      const strikes = Number(data.strikes || 0);
      setDone(true);
      setStatus("success");
      setMsg(
        strikes >= 3
          ? "Reported. This listing now has 3 reports and will be hidden."
          : `Reported. ${strikes} of 3 unique reports needed to hide this listing.`
      );
    } else {
      setStatus("error");
      setMsg(data.error || "Could not send the report. Try again or email support.");
    }
  }

  return (
    <div className="glass rounded-3xl p-5">
      <p className="text-sm font-semibold">Report listing</p>
      <p className="mt-1 text-xs muted-2">3 unique reports auto-hide the listing. Use this for brokers, fakes, or scams.</p>
      <div className="mt-3 flex flex-wrap gap-2">
        {REASONS.map((r) => (
          <button
            key={r.id}
            className="btn-ghost text-xs"
            disabled={done || status === "loading"}
            onClick={() => void report(r.id)}
          >
            {r.label}
          </button>
        ))}
      </div>
      {status === "loading" && <p className="mt-2 text-xs muted">Sending report…</p>}
      {msg && (
        <p className={`mt-2 text-xs ${status === "error" ? "text-rose-400" : "text-amber-600 dark:text-amber-200"}`}>
          {msg}
        </p>
      )}
    </div>
  );
}
