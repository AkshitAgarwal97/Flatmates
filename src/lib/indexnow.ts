import { CITIES, HUBS } from "@/lib/hubs";
import { GUIDES } from "@/lib/guides";
import { absoluteUrl, cityPath, localityPath, SITE_URL } from "@/lib/seo";

export const INDEXNOW_KEY = "8f2c1a9e4b7d3f06c5e1a8b4d0f7c2e9";

export function indexNowKeyLocation() {
  return `${SITE_URL}/${INDEXNOW_KEY}.txt`;
}

export function defaultIndexNowUrls(): string[] {
  const urls = [
    absoluteUrl("/"),
    absoluteUrl("/flatmates"),
    absoluteUrl("/flat"),
    absoluteUrl("/apartments"),
    absoluteUrl("/houses"),
    absoluteUrl("/rooms"),
    absoluteUrl("/rent"),
    absoluteUrl("/roommates"),
    absoluteUrl("/pg"),
    absoluteUrl("/hi"),
    absoluteUrl("/browse"),
    absoluteUrl("/guides"),
    absoluteUrl("/about"),
    absoluteUrl("/directory"),
    absoluteUrl("/llms.txt"),
    ...CITIES.map((c) => absoluteUrl(cityPath(c))),
    ...HUBS.map((h) => absoluteUrl(localityPath(h.city, h.locality))),
    ...GUIDES.map((g) => absoluteUrl(`/guides/${g.slug}`)),
  ];
  return Array.from(new Set(urls));
}

export async function pingGoogleSitemap() {
  try {
    const url = `https://www.google.com/ping?sitemap=${encodeURIComponent(`${SITE_URL}/sitemap.xml`)}`;
    const res = await fetch(url);
    return { ok: res.ok, status: res.status };
  } catch (e) {
    return { ok: false, status: 0, error: e instanceof Error ? e.message : "google ping failed" };
  }
}

export async function pingIndexNow(urls: string[] = defaultIndexNowUrls()) {
  try {
    const res = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "content-type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host: "www.flatmates.co.in",
        key: INDEXNOW_KEY,
        keyLocation: indexNowKeyLocation(),
        urlList: urls.slice(0, 10000),
      }),
    });
    return { ok: res.ok, status: res.status };
  } catch (e) {
    return { ok: false, status: 0, error: e instanceof Error ? e.message : "ping failed" };
  }
}
