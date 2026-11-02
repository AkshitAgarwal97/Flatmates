const base = "http://127.0.0.1:3000";

async function main() {
  const browse = await (await fetch(`${base}/browse`)).text();
  const hrefs = [...browse.matchAll(/href="(\/listings\/[^"]+)"/g)]
    .map((m) => m[1])
    .filter((h) => !h.startsWith("/listings/new"));
  console.log("listing hrefs", hrefs.slice(0, 4));
  if (!hrefs[0]) throw new Error("no listing links");
  const listing = await fetch(`${base}${hrefs[0]}`);
  const html = await listing.text();
  console.log("listing status", listing.status, hrefs[0]);
  console.log("share", html.includes("Share this listing"));
  console.log("stars", html.includes("Rate this stay") || html.includes("star-btn") || html.includes("★"));
  console.log("og", html.includes("og:image") || html.includes("og:title"));
  const sm = await (await fetch(`${base}/sitemap.xml`)).text();
  console.log("sitemap listings", (sm.match(/\/listings\//g) || []).length);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
