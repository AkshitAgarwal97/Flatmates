import { NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { sign } from "@/lib/auth";
import { authorizeUrl, isOAuthProvider, providerConfigured, requestOrigin } from "@/lib/oauth";

export async function GET(req: Request, { params }: { params: { provider: string } }) {
  const provider = params.provider;
  if (!isOAuthProvider(provider)) {
    return NextResponse.json({ error: "Unknown provider" }, { status: 404 });
  }
  if (!providerConfigured(provider)) {
    return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(`${provider} login is not configured`)}`, requestOrigin(req)));
  }
  const nonce = randomBytes(16).toString("hex");
  const origin = requestOrigin(req);
  const state = sign({ provider, nonce, exp: Date.now() + 10 * 60 * 1000 });
  const url = authorizeUrl(provider, origin, state);
  const res = NextResponse.redirect(url);
  res.cookies.set("fm_oauth", nonce, {
    httpOnly: true,
    secure: origin.startsWith("https"),
    sameSite: "lax",
    path: "/",
    maxAge: 600,
  });
  return res;
}
