import { createHash, randomInt } from "crypto";
import { hashPassword, verifyPassword } from "./auth";
import { getDb, saveDb } from "./store";
import type { User } from "./types";

export function passwordToken(email: string, password: string) {
  return createHash("sha256")
    .update(`flatmates.v1:${email.toLowerCase().trim()}:${password}`)
    .digest("hex");
}

export function makeOtp() {
  return String(randomInt(100000, 999999));
}

export function hashOtp(otp: string) {
  return createHash("sha256").update(`otp:${otp}`).digest("hex");
}

export function setUserOtp(user: User, otp: string, minutes = 15) {
  user.otpHash = hashOtp(otp);
  user.otpExpires = new Date(Date.now() + minutes * 60_000).toISOString();
}

export function checkUserOtp(user: User, otp: string) {
  if (!user.otpHash || !user.otpExpires) return false;
  if (new Date(user.otpExpires).getTime() < Date.now()) return false;
  return user.otpHash === hashOtp(otp);
}

export function clearUserOtp(user: User) {
  delete user.otpHash;
  delete user.otpExpires;
}

/** Free delivery: Resend if key set, else FormSubmit free, else in-app queue. */
export async function deliverOtp(to: string, otp: string) {
  const subject = "Flatmates verification code";
  const body = `Your Flatmates OTP is ${otp}. Valid for 15 minutes. Do not share it.`;
  const db = await getDb();
  db.emails.push({ to, subject, body, at: new Date().toISOString() });
  await saveDb(db);

  const resend = process.env.RESEND_API_KEY;
  if (resend) {
    try {
      await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${resend}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: process.env.EMAIL_FROM || "onboarding@resend.dev",
          to: [to],
          subject,
          text: body,
        }),
      });
      return { channel: "resend" as const };
    } catch {
      /* fall through */
    }
  }

  try {
    await fetch(`https://formsubmit.co/ajax/${encodeURIComponent(to)}`, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({
        _subject: subject,
        message: body,
      }),
    });
    return { channel: "formsubmit" as const };
  } catch {
    return { channel: "inbox" as const };
  }
}

export function hashLoginSecret(email: string, passwordOrToken: string) {
  // Prefer client token; also accept raw for legacy demo hashes.
  if (/^[a-f0-9]{64}$/i.test(passwordOrToken)) return hashPassword(passwordOrToken);
  return hashPassword(passwordToken(email, passwordOrToken));
}

export function verifyLoginSecret(email: string, passwordOrToken: string, stored: string) {
  if (/^[a-f0-9]{64}$/i.test(passwordOrToken)) {
    if (verifyPassword(passwordOrToken, stored)) return true;
  }
  if (verifyPassword(passwordToken(email, passwordOrToken), stored)) return true;
  // Legacy: raw password was scrypt'd directly
  return verifyPassword(passwordOrToken, stored);
}
