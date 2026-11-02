"use client";

import { useState } from "react";

export function VerifyCta({ email, verified }: { email: string; verified?: string | null }) {
  const [msg, setMsg] = useState("");
  const [pending, setPending] = useState(false);

  if (verified) {
    return (
      <p className="rounded-2xl border border-line px-4 py-3 text-sm">
        <span className="text-teal-700 dark:text-teal-300">✓ {verified}</span>
      </p>
    );
  }

  async function run() {
    setPending(true);
    setMsg("");
    const res = await fetch("/api/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    setPending(false);
    if (!res.ok) {
      setMsg(data.error || "Could not verify. Use a company or college email.");
      return;
    }
    setMsg(`Verified as ${data.badge === "verified_student" ? "student" : "professional"}. Refresh to see the badge.`);
  }

  return (
    <div className="glass rounded-2xl p-4 space-y-2">
      <p className="text-sm font-semibold">Not verified</p>
      <p className="muted text-xs">
        Company or college email (not Gmail) unlocks a Verified student / professional badge on your listings.
      </p>
      <button className="btn text-xs" type="button" disabled={pending} onClick={() => void run()}>
        {pending ? "Checking…" : "Verify this email"}
      </button>
      {msg && <p className="text-xs muted">{msg}</p>}
    </div>
  );
}
