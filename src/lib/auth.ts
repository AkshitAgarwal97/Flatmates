import { createHmac, randomBytes, scryptSync, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";
import { getDb, saveDb } from "./store";
import type { User } from "./types";

function normalizeSecret(value?: string) {
  // Strip whitespace and accidental "\r\n" literals from env paste / CLI quirks
  return (value || "").trim().replace(/\\r\\n$/g, "").replace(/\r|\n/g, "") || undefined;
}

const SECRET = normalizeSecret(process.env.JWT_SECRET);

function secret() {
  return SECRET || "flatmates-prod-fallback-change-me";
}

function cookieSecure() {
  return process.env.NODE_ENV === "production";
}

export function sign(payloadObj: object) {
  const payload = Buffer.from(JSON.stringify(payloadObj)).toString("base64url");
  const sig = createHmac("sha256", secret()).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

export function unsign<T>(token?: string | null): T | null {
  if (!token) return null;
  const [payload, sig] = token.split(".");
  if (!payload || !sig) return null;
  const expect = createHmac("sha256", secret()).update(payload).digest("base64url");
  if (expect.length !== sig.length || !timingSafeEqual(Buffer.from(expect), Buffer.from(sig))) return null;
  try {
    return JSON.parse(Buffer.from(payload, "base64url").toString()) as T;
  } catch {
    return null;
  }
}

export type SessionUser = {
  userId: string;
  name: string;
  email: string;
  badge?: User["badge"];
  emailVerified?: boolean;
  favorites?: string[];
  blockedIds?: string[];
  passwordHash?: string;
  exp: number;
};

export type PendingAuth = {
  userId: string;
  name: string;
  email: string;
  passwordHash: string;
  otpHash: string;
  otpExpires: string;
  exp: number;
};

/** Survives logout / cold isolates so password login still works without a durable DB. */
export type AccountAuth = {
  userId: string;
  name: string;
  email: string;
  passwordHash: string;
  emailVerified: boolean;
  badge?: User["badge"];
  favorites?: string[];
  blockedIds?: string[];
  exp: number;
};

export function hashPassword(password: string, salt?: string) {
  const s = salt || randomBytes(16).toString("hex");
  const hash = scryptSync(password, s, 32, { N: 16384, r: 8, p: 1 }).toString("hex");
  return `${s}:${hash}`;
}

export function verifyPassword(password: string, stored: string) {
  const [salt, hash] = stored.split(":");
  if (!salt || !hash) return false;
  const next = scryptSync(password, salt, 32, { N: 16384, r: 8, p: 1 });
  const prev = Buffer.from(hash, "hex");
  return next.length === prev.length && timingSafeEqual(next, prev);
}

export function signSession(user: Pick<User, "id" | "name" | "email" | "badge" | "emailVerified" | "favorites" | "blockedIds" | "passwordHash">) {
  return sign({
    userId: user.id,
    name: user.name,
    email: user.email,
    badge: user.badge,
    emailVerified: user.emailVerified !== false,
    favorites: user.favorites || [],
    blockedIds: user.blockedIds || [],
    passwordHash: user.passwordHash,
    exp: Date.now() + 30 * 24 * 60 * 60 * 1000,
  } satisfies SessionUser);
}

export function readSessionToken(token?: string | null): SessionUser | null {
  const data = unsign<SessionUser>(token);
  if (!data?.userId || !data.exp || data.exp < Date.now()) return null;
  // Old cookies may only have { userId, exp } — treat as logged-out rather than crash SSR
  if (!data.email || typeof data.email !== "string") return null;
  if (!data.name || typeof data.name !== "string") {
    data.name = data.email.split("@")[0] || "Member";
  }
  return data;
}

export function publicUser(u: User) {
  const { passwordHash: _, otpHash: __, otpExpires: ___, ...rest } = u;
  return rest;
}

async function upsertFromSession(sess: SessionUser): Promise<User> {
  const db = await getDb();
  const safeName = (sess.name || sess.email.split("@")[0] || "Member").trim() || "Member";
  let user = db.users.find((u) => u.id === sess.userId) || db.users.find((u) => u.email === sess.email);
  if (!user) {
    user = {
      id: sess.userId,
      name: safeName,
      email: sess.email,
      // Never invent a random hash — that permanently breaks password login on this isolate
      passwordHash: sess.passwordHash || "",
      emailVerified: sess.emailVerified !== false,
      badge: sess.badge,
      blockedIds: sess.blockedIds || [],
      favorites: sess.favorites || [],
      createdAt: new Date().toISOString(),
      pwdScheme: "v1",
    };
    db.users.push(user);
    await saveDb(db);
  } else {
    const before = JSON.stringify([user.name, user.badge, user.emailVerified, user.passwordHash, user.favorites, user.blockedIds]);
    user.name = sess.name || user.name || safeName;
    if (sess.badge) user.badge = sess.badge;
    user.emailVerified = sess.emailVerified !== false;
    if (sess.passwordHash) user.passwordHash = sess.passwordHash;
    if (sess.favorites) user.favorites = sess.favorites;
    if (sess.blockedIds) user.blockedIds = sess.blockedIds;
    const after = JSON.stringify([user.name, user.badge, user.emailVerified, user.passwordHash, user.favorites, user.blockedIds]);
    if (before !== after) await saveDb(db);
  }
  if (!user.name) user.name = safeName;
  return user;
}

export async function currentUser(): Promise<User | null> {
  try {
    const token = cookies().get("fm_session")?.value;
    const sess = readSessionToken(token);
    if (!sess) return null;
    return await upsertFromSession(sess);
  } catch {
    return null;
  }
}

export function setSessionCookie(user: User) {
  cookies().set("fm_session", signSession(user), {
    httpOnly: true,
    secure: cookieSecure(),
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  setAccountCookie(user);
}

export function setAccountCookie(user: User) {
  if (!user.passwordHash) return;
  cookies().set(
    "fm_account",
    sign({
      userId: user.id,
      name: user.name,
      email: user.email,
      passwordHash: user.passwordHash,
      emailVerified: user.emailVerified !== false,
      badge: user.badge,
      favorites: user.favorites || [],
      blockedIds: user.blockedIds || [],
      exp: Date.now() + 365 * 24 * 60 * 60 * 1000,
    } satisfies AccountAuth),
    {
      httpOnly: true,
      secure: cookieSecure(),
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    }
  );
}

export function readAccountCookie(): AccountAuth | null {
  const data = unsign<AccountAuth>(cookies().get("fm_account")?.value);
  if (!data?.email || !data.passwordHash || !data.userId || !data.exp || data.exp < Date.now()) return null;
  return data;
}

export function clearSessionCookie() {
  cookies().set("fm_session", "", {
    httpOnly: true,
    secure: cookieSecure(),
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  cookies().set("fm_pending", "", {
    httpOnly: true,
    secure: cookieSecure(),
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
  // Keep fm_account so password login still works after logout / DB reset
}

export function setPendingCookie(data: Omit<PendingAuth, "exp">) {
  cookies().set(
    "fm_pending",
    sign({ ...data, exp: Date.now() + 15 * 60 * 1000 }),
    {
      httpOnly: true,
      secure: cookieSecure(),
      sameSite: "lax",
      path: "/",
      maxAge: 15 * 60,
    }
  );
}

export function readPendingCookie(): PendingAuth | null {
  const data = unsign<PendingAuth>(cookies().get("fm_pending")?.value);
  if (!data?.email || !data.otpHash || !data.exp || data.exp < Date.now()) return null;
  return data;
}

export function clearPendingCookie() {
  cookies().set("fm_pending", "", {
    httpOnly: true,
    secure: cookieSecure(),
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });
}
