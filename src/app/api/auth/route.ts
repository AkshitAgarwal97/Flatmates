import { NextResponse } from "next/server";
import {
  clearPendingCookie,
  clearSessionCookie,
  currentUser,
  hashPassword,
  publicUser,
  readAccountCookie,
  readPendingCookie,
  setPendingCookie,
  setSessionCookie,
} from "@/lib/auth";
import { hashOtp, deliverOtp, makeOtp, verifyLoginSecret } from "@/lib/otp";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { getDb, newId, saveDb } from "@/lib/store";
import type { User } from "@/lib/types";

async function ensureUser(partial: {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  emailVerified?: boolean;
}): Promise<User> {
  const db = await getDb();
  let user = db.users.find((u) => u.id === partial.id) || db.users.find((u) => u.email === partial.email);
  if (!user) {
    user = {
      id: partial.id,
      name: partial.name,
      email: partial.email,
      passwordHash: partial.passwordHash,
      emailVerified: Boolean(partial.emailVerified),
      blockedIds: [],
      favorites: [],
      createdAt: new Date().toISOString(),
      pwdScheme: "v1",
    };
    db.users.push(user);
  } else {
    user.name = partial.name || user.name;
    user.passwordHash = partial.passwordHash || user.passwordHash;
    if (partial.emailVerified) user.emailVerified = true;
  }
  await saveDb(db);
  return user;
}

export async function GET() {
  const u = await currentUser();
  if (!u) return NextResponse.json({ user: null });
  return NextResponse.json({ user: publicUser(u) });
}

export async function POST(req: Request) {
  const body = await req.json();
  const { action, name, email, passwordToken: token, otp } = body as {
    action: "login" | "register" | "logout" | "verify_otp" | "resend_otp";
    name?: string;
    email?: string;
    passwordToken?: string;
    otp?: string;
  };

  if (action === "logout") {
    clearSessionCookie();
    return NextResponse.json({ ok: true });
  }

  if (!rateLimit(`auth:${clientIp(req)}:${action || "x"}`, 12)) {
    return NextResponse.json({ error: "Too many attempts. Try later." }, { status: 429 });
  }

  const db = await getDb();
  const em = String(email || "").toLowerCase().trim();

  if (action === "verify_otp") {
    if (!em || !otp) return NextResponse.json({ error: "Email and OTP required" }, { status: 400 });
    const code = String(otp).trim();
    const pending = readPendingCookie();
    const fromDb = db.users.find((u) => u.email === em);

    let user: User | null = null;
    const otpOkPending =
      pending &&
      pending.email === em &&
      pending.otpHash === hashOtp(code) &&
      new Date(pending.otpExpires).getTime() > Date.now();

    if (otpOkPending && pending) {
      user = await ensureUser({
        id: pending.userId,
        name: pending.name,
        email: pending.email,
        passwordHash: pending.passwordHash,
        emailVerified: true,
      });
    } else if (fromDb && fromDb.otpHash === hashOtp(code) && fromDb.otpExpires && new Date(fromDb.otpExpires).getTime() > Date.now()) {
      fromDb.emailVerified = true;
      delete fromDb.otpHash;
      delete fromDb.otpExpires;
      await saveDb(db);
      user = fromDb;
    }

    if (!user) return NextResponse.json({ error: "Invalid or expired OTP" }, { status: 401 });
    clearPendingCookie();
    setSessionCookie(user);
    return NextResponse.json({ user: publicUser(user) });
  }

  if (action === "resend_otp") {
    if (!em) return NextResponse.json({ error: "Email required" }, { status: 400 });
    const pending = readPendingCookie();
    const user = db.users.find((u) => u.email === em);
    if (user?.emailVerified) return NextResponse.json({ ok: true, alreadyVerified: true });

    const code = makeOtp();
    const otpHash = hashOtp(code);
    const otpExpires = new Date(Date.now() + 15 * 60_000).toISOString();

    if (user) {
      user.otpHash = otpHash;
      user.otpExpires = otpExpires;
      await saveDb(db);
      setPendingCookie({
        userId: user.id,
        name: user.name,
        email: user.email,
        passwordHash: user.passwordHash,
        otpHash,
        otpExpires,
      });
    } else if (pending && pending.email === em) {
      setPendingCookie({
        ...pending,
        otpHash,
        otpExpires,
      });
    } else {
      return NextResponse.json({ error: "Start register/login again" }, { status: 404 });
    }

    const sent = await deliverOtp(em, code);
    const expose = !process.env.RESEND_API_KEY;
    return NextResponse.json({ ok: true, channel: sent.channel, ...(expose ? { otp: code } : {}) });
  }

  if (!em || !token) return NextResponse.json({ error: "Email and password required" }, { status: 400 });
  if (!/^[a-f0-9]{64}$/i.test(token)) {
    return NextResponse.json({ error: "Invalid credentials payload" }, { status: 400 });
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em)) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  if (action === "register") {
    const existing = db.users.find((u) => u.email === em);
    // Allow reclaim when prior isolate left a broken/unverified row (empty hash, etc.)
    if (existing?.emailVerified && existing.passwordHash) {
      return NextResponse.json({ error: "Email already registered — try Log in" }, { status: 409 });
    }
    if (existing) {
      db.users = db.users.filter((u) => u.id !== existing.id);
      await saveDb(db);
    }
    const code = makeOtp();
    const otpHash = hashOtp(code);
    const otpExpires = new Date(Date.now() + 15 * 60_000).toISOString();
    const user: User = {
      id: existing?.id || newId("u"),
      name: (name || em.split("@")[0]).trim().slice(0, 80),
      email: em,
      passwordHash: hashPassword(token),
      emailVerified: false,
      otpHash,
      otpExpires,
      blockedIds: [],
      favorites: [],
      createdAt: new Date().toISOString(),
      pwdScheme: "v1",
    };
    db.users.push(user);
    await saveDb(db);
    setPendingCookie({
      userId: user.id,
      name: user.name,
      email: user.email,
      passwordHash: user.passwordHash,
      otpHash,
      otpExpires,
    });
    const sent = await deliverOtp(em, code);
    const expose = !process.env.RESEND_API_KEY;
    return NextResponse.json({
      needsOtp: true,
      email: em,
      channel: sent.channel,
      ...(expose ? { otp: code } : {}),
    });
  }

  // login — recover from DB, durable account cookie, or pending OTP cookie
  // (Vercel /tmp DB can reset between isolates; cookies keep the password hash)
  const pending = readPendingCookie();
  const account = readAccountCookie();
  let user = db.users.find((u) => u.email === em);

  const candidates: { id: string; name: string; email: string; passwordHash: string; emailVerified?: boolean }[] = [];
  if (user?.passwordHash) {
    candidates.push({
      id: user.id,
      name: user.name,
      email: user.email,
      passwordHash: user.passwordHash,
      emailVerified: user.emailVerified,
    });
  }
  if (account?.email === em && account.passwordHash) {
    candidates.push({
      id: account.userId,
      name: account.name,
      email: account.email,
      passwordHash: account.passwordHash,
      emailVerified: account.emailVerified,
    });
  }
  if (pending?.email === em && pending.passwordHash) {
    candidates.push({
      id: pending.userId,
      name: pending.name,
      email: pending.email,
      passwordHash: pending.passwordHash,
      emailVerified: false,
    });
  }

  const matched = candidates.find((c) => verifyLoginSecret(em, token, c.passwordHash));
  if (!matched) {
    return NextResponse.json(
      {
        error: user
          ? "Invalid credentials"
          : "Account not found on this server (data may have reset). Register again with the same email, or use demo@flatmates.co.in / demo123.",
      },
      { status: 401 }
    );
  }

  user = await ensureUser({
    id: matched.id,
    name: matched.name,
    email: matched.email,
    passwordHash: matched.passwordHash,
    emailVerified: matched.emailVerified,
  });
  if (!user.emailVerified) {
    const code = makeOtp();
    const otpHash = hashOtp(code);
    const otpExpires = new Date(Date.now() + 15 * 60_000).toISOString();
    user.otpHash = otpHash;
    user.otpExpires = otpExpires;
    await saveDb(db);
    setPendingCookie({
      userId: user.id,
      name: user.name,
      email: user.email,
      passwordHash: user.passwordHash,
      otpHash,
      otpExpires,
    });
    const sent = await deliverOtp(em, code);
    const expose = !process.env.RESEND_API_KEY;
    return NextResponse.json({
      needsOtp: true,
      email: em,
      channel: sent.channel,
      ...(expose ? { otp: code } : {}),
    });
  }
  setSessionCookie(user);
  return NextResponse.json({ user: publicUser(user) });
}
