import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { setSessionCookie, unsign } from "@/lib/auth";
import { upsertIdentity } from "@/lib/identity";
import { exchangeCode, isOAuthProvider, requestOrigin } from "@/lib/oauth";

type OAuthState = { provider: string; nonce: string; exp: number };

export async function GET(req: Request, { params }: { params: { provider: string } }) {
  const provider = params.provider;
  const origin = requestOrigin(req);
  const fail = (msg: string) => NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(msg)}`, origin));

  if (!isOAuthProvider(provider)) return fail("Unknown login provider");

  const url = new URL(req.url);
  const err = url.searchParams.get("error_description") || url.searchParams.get("error");
  if (err) return fail(err);

  const code = url.searchParams.get("code");
  const state = unsign<OAuthState>(url.searchParams.get("state"));
  const nonce = cookies().get("fm_oauth")?.value;
  if (!code || !state?.nonce || state.provider !== provider || state.exp < Date.now() || !nonce || nonce !== state.nonce) {
    return fail("Login expired. Try again.");
  }

  try {
    const profile = await exchangeCode(provider, origin, code);
    if (provider === "google" && !profile.email) return fail("Google did not share an email");
    const ids =
      provider === "google"
        ? { googleId: profile.id }
        : provider === "facebook"
          ? { facebookId: profile.id }
          : { instagramId: profile.id };
    const user = await upsertIdentity({
      name: profile.name,
      email: profile.email,
      emailVerified: profile.emailVerified || provider === "google",
      ...ids,
    });
    setSessionCookie(user);
    const res = NextResponse.redirect(new URL("/browse", origin));
    res.cookies.set("fm_oauth", "", { path: "/", maxAge: 0 });
    return res;
  } catch (e) {
    return fail(e instanceof Error ? e.message : "Social login failed");
  }
}
