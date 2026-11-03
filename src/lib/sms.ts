import { getDb, saveDb } from "./store";

export function normalizeInPhone(raw: string) {
  const digits = raw.replace(/\D/g, "");
  if (digits.length === 10) return `91${digits}`;
  if (digits.length === 12 && digits.startsWith("91")) return digits;
  if (digits.length === 11 && digits.startsWith("0")) return `91${digits.slice(1)}`;
  return "";
}

export function phoneDisplay(e164digits: string) {
  if (e164digits.startsWith("91") && e164digits.length === 12) return `+91 ${e164digits.slice(2)}`;
  return `+${e164digits}`;
}

export async function deliverSmsOtp(phone91: string, otp: string) {
  const db = await getDb();
  db.emails.push({
    to: `${phone91}@sms.flatmates.co.in`,
    subject: "sms-otp",
    body: `OTP ${otp} for ${phone91}`,
    at: new Date().toISOString(),
  });
  await saveDb(db);

  const msg91 = process.env.MSG91_AUTH_KEY;
  if (msg91) {
    const template = process.env.MSG91_TEMPLATE_ID;
    const url = template
      ? `https://control.msg91.com/api/v5/otp?template_id=${encodeURIComponent(template)}&mobile=${phone91}&otp=${otp}`
      : `https://api.msg91.com/api/sendhttp.php?authkey=${encodeURIComponent(msg91)}&mobiles=${phone91}&message=${encodeURIComponent(`Your Flatmates OTP is ${otp}. Valid 15 min.`)}&sender=${encodeURIComponent(process.env.MSG91_SENDER || "FLATMT")}&route=4&country=91`;
    const res = await fetch(url, { headers: { authkey: msg91 } });
    if (res.ok) return { channel: "msg91" as const, exposed: false };
  }

  const sid = process.env.TWILIO_ACCOUNT_SID;
  const twilioToken = process.env.TWILIO_AUTH_TOKEN;
  const from = process.env.TWILIO_FROM;
  if (sid && twilioToken && from) {
    const body = new URLSearchParams({
      To: `+${phone91}`,
      From: from,
      Body: `Your Flatmates OTP is ${otp}. Valid 15 min.`,
    });
    const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${sid}/Messages.json`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${Buffer.from(`${sid}:${twilioToken}`).toString("base64")}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body,
    });
    if (res.ok) return { channel: "twilio" as const, exposed: false };
  }

  return { channel: "dev" as const, exposed: !process.env.MSG91_AUTH_KEY && !process.env.TWILIO_ACCOUNT_SID };
}
