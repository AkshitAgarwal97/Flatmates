import { chromium } from "@playwright/test";
import fs from "fs";
import path from "path";

const OUT = path.join(process.cwd(), "ux-audit-out");
const note = (s) => {
  console.log(s);
  fs.appendFileSync(path.join(OUT, "chat-notes.txt"), s + "\n");
};

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: "en-IN" });
  const page = await ctx.newPage();

  await page.goto("https://www.flatmates.co.in/login", { waitUntil: "domcontentloaded", timeout: 40000 });
  await page.fill('input[name="email"]', "demo@flatmates.co.in");
  await page.fill('input[name="password"]', "demo123");
  await page.getByRole("button", { name: "Log in" }).click();
  await page.waitForURL(/browse|\/$/, { timeout: 20000 }).catch(() => {});
  await page.waitForTimeout(3000);
  note("logged url=" + page.url() + " nav=" + (await page.locator("header").innerText()).replace(/\s+/g, " "));

  await page.goto("https://www.flatmates.co.in/chat", { waitUntil: "domcontentloaded", timeout: 45000 });
  await page.waitForTimeout(6000);
  note("chat url=" + page.url());
  note("chat body=" + (await page.locator("body").innerText()).slice(0, 2000));
  await page.screenshot({ path: path.join(OUT, "74-chat-loggedin.png"), fullPage: true });

  await page.goto("https://www.flatmates.co.in/listings/l_5", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2500);
  const listing = await page.locator("body").innerText();
  note("listing cta=" + listing.slice(0, 1800));
  await page.screenshot({ path: path.join(OUT, "75-listing-loggedin.png"), fullPage: true });
  const box = page.locator("textarea").first();
  if (await box.count()) {
    await box.fill("[TEST] PLEASE IGNORE");
    const send = page.getByRole("button", { name: /send/i }).first();
    if (await send.count()) {
      await send.click();
      await page.waitForTimeout(2000);
      note("sent one test chat");
    } else note("no send button");
    await page.screenshot({ path: path.join(OUT, "76-listing-compose.png"), fullPage: true });
  } else note("no textarea");

  // post validation: fill placeText, click publish, capture alert/error
  await page.goto("https://www.flatmates.co.in/listings/new", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(800);
  await page.fill('input[name="title"]', "[TEST - PLEASE IGNORE]");
  await page.fill("textarea[name=description]", "[TEST - PLEASE IGNORE]");
  await page.fill("input[name=rent]", "15000");
  await page.fill("input[name=placeText]", "Koramangala, Bengaluru");
  await page.getByRole("button", { name: "Publish listing" }).click();
  await page.waitForTimeout(2500);
  const err = await page.evaluate(() => ({
    invalid: [...document.querySelectorAll(":invalid")].map((e) => e.name || e.placeholder),
    alerts: [...document.querySelectorAll("[role=alert], .error, .text-red, p")].map((e) => e.innerText.trim()).filter((t) => /error|required|city|place|login|wait/i.test(t)).slice(0, 10),
    bodyHead: document.body.innerText.slice(0, 1200),
  }));
  note("publish " + JSON.stringify(err));
  await page.screenshot({ path: path.join(OUT, "84-post-validate.png"), fullPage: true });

  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
