const hits = new Map<string, { n: number; t: number }>();

/** In-memory limiter. Stops credential stuffing; not a substitute for WAF at huge scale. */
export function rateLimit(key: string, max = 8, windowMs = 15 * 60 * 1000) {
  const now = Date.now();
  const cur = hits.get(key);
  if (!cur || now - cur.t > windowMs) {
    hits.set(key, { n: 1, t: now });
    return true;
  }
  if (cur.n >= max) return false;
  cur.n += 1;
  return true;
}

export function clientIp(req: Request) {
  return req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || req.headers.get("x-real-ip") || "local";
}
