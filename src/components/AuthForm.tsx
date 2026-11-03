"use client";

import { FormEvent, useEffect, useState } from "react";
import Link from "next/link";
import { passwordToken } from "@/lib/client-crypto";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [tab, setTab] = useState<"email" | "phone">("email");
  const [otpMode, setOtpMode] = useState<{ email: string; hint?: string } | null>(null);
  const [otp, setOtp] = useState("");
  const [phone, setPhone] = useState("");
  const [phoneOtp, setPhoneOtp] = useState<{ phone: string; hint?: string } | null>(null);
  const [smsCode, setSmsCode] = useState("");

  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("error");
    if (q) setError(q);
  }, []);

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

  async function sendPhone(e: FormEvent) {
    e.preventDefault();
    setPending(true);
    setError("");
    const res = await fetch("/api/auth/phone", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "send", phone }),
    });
    const data = await res.json();
    setPending(false);
    if (!res.ok) {
      setError(data.error || "Could not send OTP");
      return;
    }
    setPhoneOtp({ phone: data.phone, hint: data.otp });
  }

  async function verifyPhone(e: FormEvent) {
    e.preventDefault();
    setPending(true);
    setError("");
    const res = await fetch("/api/auth/phone", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ action: "verify", phone, otp: smsCode }),
    });
    const data = await res.json();
    setPending(false);
    if (!res.ok) {
      setError(data.error || "OTP failed");
      return;
    }
    window.location.href = "/browse";
  }

  const social = (
    <div className="space-y-2">
      <a href="/api/auth/oauth/google" className="btn-ghost flex w-full items-center justify-center gap-2 text-sm">
        Continue with Google / Gmail
      </a>
      <a href="/api/auth/oauth/facebook" className="btn-ghost flex w-full items-center justify-center gap-2 text-sm">
        Continue with Facebook
      </a>
      <a href="/api/auth/oauth/instagram" className="btn-ghost flex w-full items-center justify-center gap-2 text-sm">
        Continue with Instagram
      </a>
    </div>
  );

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
          {pending ? "Checking…" : "Verify & continue"}
        </button>
        <button type="button" className="btn-ghost w-full text-xs" onClick={() => void resend()} disabled={pending}>
          Resend OTP
        </button>
      </form>
    );
  }

  if (phoneOtp) {
    return (
      <form onSubmit={(e) => void verifyPhone(e)} className="glass mx-auto mt-10 w-full max-w-md space-y-4 rounded-3xl p-6">
        <h1 className="text-2xl font-semibold">Verify mobile OTP</h1>
        <p className="text-sm muted">Code sent to {phoneOtp.phone}</p>
        {phoneOtp.hint && (
          <div className="rounded-xl bg-teal-400/10 p-3 text-sm text-teal-200 border border-teal-400/20">
            <p className="font-medium">Dev mode code:</p>
            <p className="mt-1 text-xl font-bold tracking-widest">{phoneOtp.hint}</p>
            <p className="mt-1 text-xs muted-2">Add MSG91 or Twilio to send real SMS.</p>
          </div>
        )}
        <input
          className="field tracking-[0.4em] text-center text-xl"
          inputMode="numeric"
          maxLength={6}
          value={smsCode}
          onChange={(e) => setSmsCode(e.target.value)}
          required
          autoFocus
        />
        {error && <p className="text-sm text-rose-300">{error}</p>}
        <button className="btn w-full" disabled={pending}>
          {pending ? "Checking…" : "Verify & continue"}
        </button>
        <button type="button" className="btn-ghost w-full text-xs" onClick={() => setPhoneOtp(null)}>
          Use a different number
        </button>
      </form>
    );
  }

  return (
    <div className="glass relative mx-auto mt-10 w-full max-w-md space-y-4 rounded-3xl p-6">
      {pending && (
        <div className="absolute inset-0 z-10 flex items-center justify-center rounded-3xl bg-black/25 backdrop-blur-[1px]" aria-busy="true">
          <span className="flex items-center gap-2 rounded-full bg-surface px-4 py-2 text-sm font-medium shadow">
            Working…
          </span>
        </div>
      )}
      <h1 className="text-2xl font-semibold">{mode === "login" ? "Welcome back" : "Create a free account"}</h1>
      <p className="text-sm muted">Google / Gmail, Facebook, Instagram, mobile OTP, or email.</p>
      {social}
      <div className="flex items-center gap-3 text-xs muted-2">
        <span className="flex-1 border-t border-line" />
        <span>or</span>
        <span className="flex-1 border-t border-line" />
      </div>
      <div className="flex gap-2">
        <button type="button" className={tab === "email" ? "btn !py-1.5 text-xs" : "btn-ghost !py-1.5 text-xs"} onClick={() => setTab("email")}>
          Email
        </button>
        <button type="button" className={tab === "phone" ? "btn !py-1.5 text-xs" : "btn-ghost !py-1.5 text-xs"} onClick={() => setTab("phone")}>
          Mobile number
        </button>
      </div>

      {tab === "phone" ? (
        <form onSubmit={(e) => void sendPhone(e)} className="space-y-3">
          <input
            className="field"
            inputMode="tel"
            autoComplete="tel"
            placeholder="10-digit mobile (India)"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            required
          />
          {error && <p className="text-sm text-rose-300">{error}</p>}
          <button className="btn w-full" disabled={pending}>
            Send OTP
          </button>
        </form>
      ) : (
        <form method="post" action="#" onSubmit={submitAuth} className="space-y-3">
          {mode === "register" && <input name="name" className="field" placeholder="Full name" required autoFocus />}
          <input name="email" type="email" className="field" placeholder="Email / Gmail" required autoComplete="email" />
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
            {mode === "login" ? "Log in with email" : "Join with email"}
          </button>
        </form>
      )}

      {mode === "login" && (
        <>
          <button type="button" className="btn-ghost w-full text-xs" onClick={() => void tryDemo()} disabled={pending}>
            One-click demo login
          </button>
          <p className="text-center text-xs muted">
            New here?{" "}
            <Link href="/register" className="kicker hover:underline">
              Join free
            </Link>
          </p>
        </>
      )}
      {mode === "register" && (
        <p className="text-center text-xs muted">
          Already have an account?{" "}
          <Link href="/login" className="kicker hover:underline">
            Log in
          </Link>
        </p>
      )}
    </div>
  );
}
