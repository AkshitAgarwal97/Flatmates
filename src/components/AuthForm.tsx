"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { passwordToken } from "@/lib/client-crypto";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [otpMode, setOtpMode] = useState<{ email: string; hint?: string } | null>(null);
  const [otp, setOtp] = useState("");

  async function submitAuth(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    e.stopPropagation();
    setPending(true);
    setError("");
    const fd = new FormData(e.currentTarget);
    const email = String(fd.get("email") || "");
    const password = String(fd.get("password") || "");
    if (mode === "register" && password.length < 8) {
      setPending(false);
      setError("Password must be at least 8 characters");
      return;
    }
    try {
      const token = await passwordToken(email, password);
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          action: mode,
          name: fd.get("name"),
          email,
          passwordToken: token,
        }),
      });
      const data = await res.json();
      setPending(false);
      if (!res.ok) {
        setError(data.error || "Failed");
        return;
      }
      if (data.needsOtp) {
        setOtpMode({ email: data.email, hint: data.otp });
        return;
      }
      window.location.href = "/browse";
    } catch {
      setPending(false);
      setError("Network error — try again");
    }
  }

  async function submitOtp(e: FormEvent) {
    e.preventDefault();
    setPending(true);
    setError("");
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ action: "verify_otp", email: otpMode?.email, otp }),
    });
    const data = await res.json();
    setPending(false);
    if (!res.ok) {
      setError(data.error || "OTP failed");
      return;
    }
    window.location.href = "/browse";
  }

  async function resend() {
    if (!otpMode?.email) return;
    setPending(true);
    const res = await fetch("/api/auth", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ action: "resend_otp", email: otpMode.email }),
    });
    const data = await res.json();
    setPending(false);
    if (data.otp) setOtpMode({ email: otpMode.email, hint: data.otp });
  }

  // One-click demo login
  async function tryDemo() {
    setPending(true);
    setError("");
    try {
      const token = await passwordToken("demo@flatmates.co.in", "demo123");
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ action: "login", email: "demo@flatmates.co.in", passwordToken: token }),
      });
      const data = await res.json();
      setPending(false);
      if (!res.ok) {
        setError(data.error || "Demo login failed — try demo@flatmates.co.in / demo123 manually");
        return;
      }
      window.location.href = "/browse";
    } catch {
      setPending(false);
      setError("Network error — try again");
    }
  }

  if (otpMode) {
    return (
      <form onSubmit={submitOtp} className="glass mx-auto mt-10 w-full max-w-md space-y-4 rounded-3xl p-6">
        <h1 className="text-2xl font-semibold">Verify email OTP</h1>
        <p className="text-sm muted">Enter the 6-digit code for {otpMode.email}</p>
        {otpMode.hint && (
          <div className="rounded-xl bg-teal-400/10 p-3 text-sm text-teal-200 border border-teal-400/20">
            <p className="font-medium">Dev mode code:</p>
            <p className="mt-1 text-xl font-bold tracking-widest">{otpMode.hint}</p>
            <p className="mt-1 text-xs muted-2">Add Resend API key to send real emails.</p>
          </div>
        )}
        <input
          className="field tracking-[0.4em] text-center text-xl"
          inputMode="numeric"
          maxLength={6}
          value={otp}
          onChange={(e) => setOtp(e.target.value)}
          placeholder="• • • • • •"
          required
          autoFocus
        />
        {error && <p className="text-sm text-rose-300">{error}</p>}
        <button className="btn w-full" disabled={pending}>
          {pending ? (
            <span className="flex items-center justify-center gap-2">
              <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
              Checking…
            </span>
          ) : "Verify & continue"}
        </button>
        <button type="button" className="btn-ghost w-full text-xs" onClick={() => void resend()} disabled={pending}>
          Resend OTP
        </button>
      </form>
    );
  }

  return (
    <form
      method="post"
      action="#"
      onSubmit={submitAuth}
      className="glass relative mx-auto mt-10 w-full max-w-md space-y-4 rounded-3xl p-6"
    >
      {pending && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-3xl bg-black/25 backdrop-blur-[1px]" aria-busy="true">
          <span className="flex items-center gap-2 rounded-full bg-surface px-4 py-2 text-sm font-medium shadow">
            <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
            {mode === "login" ? "Signing you in…" : "Creating account…"}
          </span>
        </div>
      )}
      <h1 className="text-2xl font-semibold">
        {mode === "login" ? "Welcome back" : "Create a free account"}
      </h1>
      <p className="text-sm muted">
        {mode === "login"
          ? "Password is hashed in your browser before sending."
          : "Password is hashed in your browser before sending. OTP verifies new accounts."}
      </p>

      {mode === "register" && (
        <input name="name" className="field" placeholder="Full name" required autoFocus />
      )}
      <input name="email" type="email" className="field" placeholder="Email" required autoComplete="email" />
      <input
        name="password"
        type="password"
        className="field"
        placeholder="Password"
        minLength={mode === "register" ? 8 : 6}
        required
        autoComplete={mode === "login" ? "current-password" : "new-password"}
      />

      {error && <p className="text-sm text-rose-300">{error}</p>}

      <button type="submit" className="btn w-full" disabled={pending}>
        {pending ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12a9 9 0 1 1-6.219-8.56" />
            </svg>
            {mode === "login" ? "Logging in…" : "Creating account…"}
          </span>
        ) : mode === "login" ? "Log in" : "Join Flatmates"}
      </button>

      {mode === "login" && (
        <>
          <div className="flex items-center gap-3 text-xs muted-2">
            <span className="flex-1 border-t border-line" />
            <span>or try</span>
            <span className="flex-1 border-t border-line" />
          </div>
          <button
            type="button"
            className="btn-ghost w-full text-xs flex items-center justify-center gap-2"
            onClick={() => void tryDemo()}
            disabled={pending}
          >
            ⚡ One-click demo login
          </button>
          <p className="text-[11px] text-center muted-2">
            demo@flatmates.co.in · password: demo123
          </p>
        </>
      )}
    </form>
  );
}
