import { NextResponse } from "next/server";
import { setSessionCookie } from "@/lib/auth";
import { upsertIdentity } from "@/lib/identity";
import { hashOtp, makeOtp } from "@/lib/otp";
import { clientIp, rateLimit } from "@/lib/rate-limit";
import { deliverSmsOtp, normalizeInPhone, phoneDisplay } from "@/lib/sms";
import { getDb, saveDb } from "@/lib/store";

export async function POST(req: Request) {
  if (!rateLimit(`phone:${clientIp(req)}`, 8)) {
    return NextResponse.json({ error: "Too many attempts. Try later." }, { status: 429 });
  }
  const body = await req.json();
  const action = body.action as "send" | "verify";
  const phone = normalizeInPhone(String(body.phone || ""));
  if (!phone) return NextResponse.json({ error: "Enter a valid 10-digit Indian mobile number" }, { status: 400 });

  if (action === "send") {
    const otp = makeOtp();
    const user = await upsertIdentity({
      name: String(body.name || phoneDisplay(phone)),
      email: `${phone}@phone.flatmates.co.in`,
      phone,
      emailVerified: false,
    });
    user.otpHash = hashOtp(otp);
    user.otpExpires = new Date(Date.now() + 15 * 60_000).toISOString();
    user.phone = phone;
    await saveDb(await getDb());
    const sent = await deliverSmsOtp(phone, otp);
    return NextResponse.json({
      ok: true,
      phone: phoneDisplay(phone),
      channel: sent.channel,
      ...(sent.exposed ? { otp } : {}),
    });
  }

  if (action === "verify") {
    const code = String(body.otp || "").trim();
    if (!/^\d{6}$/.test(code)) return NextResponse.json({ error: "Enter the 6-digit OTP" }, { status: 400 });
    const db = await getDb();
    const user = db.users.find((u) => u.phone === phone || u.phone === `+${phone}`);
    if (!user?.otpHash || !user.otpExpires || new Date(user.otpExpires).getTime() < Date.now()) {
      return NextResponse.json({ error: "OTP expired. Request a new code." }, { status: 401 });
    }
    if (user.otpHash !== hashOtp(code)) return NextResponse.json({ error: "Invalid OTP" }, { status: 401 });
    user.phoneVerified = true;
    user.phone = phone;
    delete user.otpHash;
    delete user.otpExpires;
    await saveDb(db);
    setSessionCookie(user);
    return NextResponse.json({ ok: true });
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 });
}
