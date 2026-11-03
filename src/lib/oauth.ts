import { SITE_URL } from "./seo";

export type OAuthProvider = "google" | "facebook" | "instagram";

export function isOAuthProvider(value: string): value is OAuthProvider {
  return value === "google" || value === "facebook" || value === "instagram";
}

export function requestOrigin(req: Request) {
  const host = req.headers.get("x-forwarded-host") || req.headers.get("host") || "";
  if (!host || host.includes("localhost") || host.startsWith("127.")) {
    const proto = req.headers.get("x-forwarded-proto") || "http";
    return `${proto}://${host || "localhost:3000"}`;
  }
  return SITE_URL;
}

export function oauthCallbackUrl(origin: string, provider: OAuthProvider) {
  return `${origin}/api/auth/oauth/${provider}/callback`;
}

export function providerConfigured(provider: OAuthProvider) {
  if (provider === "google") return Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET);
  if (provider === "facebook") return Boolean(process.env.FACEBOOK_APP_ID && process.env.FACEBOOK_APP_SECRET);
  return Boolean(process.env.INSTAGRAM_APP_ID && process.env.INSTAGRAM_APP_SECRET);
}

export function authorizeUrl(provider: OAuthProvider, origin: string, state: string) {
  const redirect = oauthCallbackUrl(origin, provider);
  if (provider === "google") {
    const q = new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID || "",
      redirect_uri: redirect,
      response_type: "code",
      scope: "openid email profile",
      state,
      prompt: "select_account",
    });
    return `https://accounts.google.com/o/oauth2/v2/auth?${q}`;
  }
  if (provider === "facebook") {
    const q = new URLSearchParams({
      client_id: process.env.FACEBOOK_APP_ID || "",
      redirect_uri: redirect,
      response_type: "code",
      scope: "email,public_profile",
      state,
    });
    return `https://www.facebook.com/v21.0/dialog/oauth?${q}`;
  }
  const q = new URLSearchParams({
    client_id: process.env.INSTAGRAM_APP_ID || "",
    redirect_uri: redirect,
    response_type: "code",
    scope: process.env.INSTAGRAM_SCOPE || "instagram_business_basic",
    state,
  });
  return `https://www.instagram.com/oauth/authorize?${q}`;
}

export type OAuthProfile = {
  id: string;
  name: string;
  email: string;
  emailVerified: boolean;
};

export async function exchangeCode(provider: OAuthProvider, origin: string, code: string): Promise<OAuthProfile> {
  const redirect = oauthCallbackUrl(origin, provider);
  if (provider === "google") {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: process.env.GOOGLE_CLIENT_ID || "",
        client_secret: process.env.GOOGLE_CLIENT_SECRET || "",
        redirect_uri: redirect,
        grant_type: "authorization_code",
      }),
    });
    const token = await tokenRes.json();
    if (!token.access_token) throw new Error(token.error_description || "Google token failed");
    const meRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${token.access_token}` },
    });
    const me = await meRes.json();
    if (!me.sub) throw new Error("Google profile failed");
    return {
      id: String(me.sub),
      name: me.name || me.email?.split("@")[0] || "Google user",
      email: String(me.email || "").toLowerCase(),
      emailVerified: Boolean(me.email_verified),
    };
  }

  if (provider === "facebook") {
    const tokenQ = new URLSearchParams({
      client_id: process.env.FACEBOOK_APP_ID || "",
      client_secret: process.env.FACEBOOK_APP_SECRET || "",
      redirect_uri: redirect,
      code,
    });
    const tokenRes = await fetch(`https://graph.facebook.com/v21.0/oauth/access_token?${tokenQ}`);
    const token = await tokenRes.json();
    if (!token.access_token) throw new Error(token.error?.message || "Facebook token failed");
    const meRes = await fetch(
      `https://graph.facebook.com/me?fields=id,name,email&access_token=${encodeURIComponent(token.access_token)}`
    );
    const me = await meRes.json();
    if (!me.id) throw new Error(me.error?.message || "Facebook profile failed");
    const email = String(me.email || `${me.id}@fb.flatmates.co.in`).toLowerCase();
    return {
      id: String(me.id),
      name: me.name || "Facebook user",
      email,
      emailVerified: Boolean(me.email),
    };
  }

  const tokenRes = await fetch("https://api.instagram.com/oauth/access_token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: process.env.INSTAGRAM_APP_ID || "",
      client_secret: process.env.INSTAGRAM_APP_SECRET || "",
      grant_type: "authorization_code",
      redirect_uri: redirect,
      code,
    }),
  });
  const token = await tokenRes.json();
  const access = token.access_token || token.data?.[0]?.access_token;
  const igId = token.user_id || token.data?.[0]?.user_id;
  if (!access) throw new Error(token.error_message || token.error?.message || "Instagram token failed");
  const meRes = await fetch(
    `https://graph.instagram.com/me?fields=id,username,name&access_token=${encodeURIComponent(access)}`
  );
  const me = await meRes.json();
  const id = String(me.id || igId || "");
  if (!id) throw new Error(me.error?.message || "Instagram profile failed");
  const username = me.username || me.name || id;
  return {
    id,
    name: me.name || username,
    email: `${String(username).toLowerCase().replace(/[^a-z0-9._-]/g, "")}.${id}@ig.flatmates.co.in`,
    emailVerified: false,
  };
}
