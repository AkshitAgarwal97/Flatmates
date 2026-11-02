import { chromium } from "@playwright/test";
import path from "path";
import fs from "fs";

const OUT = path.join(process.cwd(), "ux-audit-out");

(async () => {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext({ viewport: { width: 1440, height: 900 }, locale: "en-IN" });
  const page = await ctx.newPage();
  await page.goto("https://www.flatmates.co.in/login", { waitUntil: "domcontentloaded", timeout: 40000 });
  await page.fill('input[name="email"]', "demo@flatmates.co.in");
  await page.fill('input[name="password"]', "demo123");
  await page.getByRole("button", { name: "Log in" }).click();
  await page.waitForTimeout(5000);

  await page.goto("https://www.flatmates.co.in/listings/l_5", { waitUntil: "domcontentloaded" });
  await page.waitForTimeout(2000);
  const cta = page.getByRole("link", { name: /Chat securely/i }).first();
  const btn = page.getByRole("button", { name: /Chat securely/i }).first();
  console.log("link", await cta.count(), "btn", await btn.count());
  if (await cta.count()) {
    console.log("href", await cta.getAttribute("href"));
    await cta.click();
  } else if (await btn.count()) {
    await btn.click();
  }
  await page.waitForTimeout(5000);
  console.log("after chat securely", page.url());
  console.log((await page.locator("body").innerText()).slice(0, 2000));
  await page.screenshot({ path: path.join(OUT, "77-chat-securely.png"), fullPage: true });
  const ta = page.locator("textarea, input[placeholder*='essage' i]");
  console.log("composer count", await ta.count());
  if (await ta.count()) {
    await ta.first().fill("[TEST] PLEASE IGNORE");
    const send = page.getByRole("button", { name: /send/i }).first();
    if (await send.count()) {
      await send.click();
      await page.waitForTimeout(1500);
      console.log("sent one test");
    }
    await page.screenshot({ path: path.join(OUT, "78-after-send.png"), fullPage: true });
  }
  await browser.close();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
