import type { MetadataRoute } from "next";
import { GUIDES } from "@/lib/guides";
import { CITIES, HUBS } from "@/lib/hubs";
import { INTENT_PATHS } from "@/lib/intent-landings";
import { loadRemoteDb } from "@/lib/remote-db";
import { cityPath, listingPath, localityPath, absoluteUrl } from "@/lib/seo";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const staticRoutes: MetadataRoute.Sitemap = [
    "",
    "/browse",
    "/flatmates",
    "/flat",
    ...INTENT_PATHS,
    "/pricing",
    "/guides",
    "/about",
    "/directory",
    "/map",
    "/contact",
    "/llms.txt",
  ].map((path) => ({
    url: absoluteUrl(path || "/"),
    lastModified: now,
    changeFrequency: path === "" || path === "/browse" || path === "/flatmates" || path === "/rent" ? "daily" : "weekly",
    priority:
      path === ""
        ? 1
        : path === "/browse" ||
            path === "/flatmates" ||
            path === "/flat" ||
            path === "/rent" ||
            path === "/apartments" ||
            path === "/houses" ||
            path === "/rooms" ||
            path === "/roommates" ||
            path === "/guides"
          ? 0.9
          : 0.7,
  }));

  const cityRoutes: MetadataRoute.Sitemap = CITIES.map((city) => ({
    url: absoluteUrl(cityPath(city)),
    lastModified: now,
    changeFrequency: "daily",
    priority: 0.85,
  }));

  const localityRoutes: MetadataRoute.Sitemap = HUBS.map((h) => ({
    url: absoluteUrl(localityPath(h.city, h.locality)),
    lastModified: now,
    changeFrequency: "daily",
    priority: 0.8,
  }));

  const guideRoutes: MetadataRoute.Sitemap = GUIDES.map((g) => ({
    url: absoluteUrl(`/guides/${g.slug}`),
    lastModified: now,
    changeFrequency: "monthly",
    priority: 0.75,
  }));

  let listingRoutes: MetadataRoute.Sitemap = [];
  try {
    const remote = await loadRemoteDb();
    const listings = remote.status === "ok" && remote.db ? remote.db.listings : [];
    listingRoutes = listings
      .filter((l) => l.status === "active")
      .slice(0, 400)
      .map((l) => ({
        url: absoluteUrl(listingPath(l)),
        lastModified: now,
        changeFrequency: "daily" as const,
        priority: 0.65,
      }));
  } catch {
    listingRoutes = [];
  }

  return [...staticRoutes, ...cityRoutes, ...localityRoutes, ...guideRoutes, ...listingRoutes];
}
