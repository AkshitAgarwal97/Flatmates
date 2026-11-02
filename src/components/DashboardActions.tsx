"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export function DashboardActions({ listingId }: { listingId?: string }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [msg, setMsg] = useState("");

  async function logout() {
    await fetch("/api/auth", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "logout" }) });
    router.push("/");
    router.refresh();
  }

  async function act(action: string) {
    if (!listingId) return;
    await fetch(`/api/listings/${listingId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    router.refresh();
  }

  async function verify() {
    setStatus("loading");
    setMsg("");
    const res = await fetch("/api/verify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json();
    if (res.ok) {
      setStatus("success");
      const label =
        data.badge === "verified_student" ? "Verified student" : "Verified professional";
      setMsg(`${label}. Your badge now shows on listings you post.`);
      router.refresh();
    } else {
      setStatus("error");
      setMsg(data.error || "Could not verify. Use a company or college email on this account.");
    }
  }

  if (!listingId) {
    return (
      <div className="flex flex-wrap items-center gap-2">
        <input
          className="field !w-52"
          placeholder="work/college email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button className="btn-ghost text-xs" disabled={status === "loading"} onClick={() => void verify()}>
          {status === "loading" ? "Checking…" : "Verify domain"}
        </button>
        <button className="btn-ghost text-xs" onClick={() => void logout()}>
          Log out
        </button>
        {msg && (
          <span className={`text-xs ${status === "error" ? "text-rose-400" : "text-teal-700 dark:text-teal-200"}`}>
            {msg}
          </span>
        )}
      </div>
    );
  }

  return (
    <div className="mt-3 flex gap-2">
      <button className="btn-ghost text-xs" onClick={() => void act("renew")}>
        Keep active 21 days
      </button>
      <button className="btn-ghost text-xs" onClick={() => void act("rented")}>
        Mark rented
      </button>
    </div>
  );
}
