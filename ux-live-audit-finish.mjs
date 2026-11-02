import { chromium } from "@playwright/test";
import fs from "fs";
import path from "path";

const OUT = path.join(process.cwd(), "ux-audit-out");
fs.mkdirSync(OUT, { recursive: true });
const notes = [];
const note = (s) => {
  notes.push(s);
  console.log(s);
};

async function dump(page, name) {
  const html = await page.evaluate(() => ({
    url: location.href,
    title: document.title,
    h1: [...document.querySelectorAll("h1")].map((e) => e.innerText.trim()).slice(0, 8),
    buttons: [...document.querySelectorAll("button, a, [role=button]")]
      .map((e) => ({
        tag: e.tagName,
        text: (e.innerText || e.getAttribute("aria-label") || "").trim().replace(/\s+/g, " ").slice(0, 90),
        href: e.getAttribute("href"),
        disabled: e.disabled || e.hasAttribute("disabled"),
      }))
      .filter((x) => x.text)
      .slice(0, 80),
    inputs: [...document.querySelectorAll("input, textarea, select")].map((e) => ({
      tag: e.tagName,
      type: e.getAttribute("type"),
      name: e.getAttribute("name"),
      placeholder: e.getAttribute("placeholder"),
      required: e.required,
      options: e.tagName === "SELECT" ? [...e.options].map((o) => o.text).slice(0, 20) : undefined,
    })),
    body: document.body.innerText.slice(0, 5000),
  }));
  fs.writeFileSync(path.join(OUT, `${name}.json`), JSON.stringify(html, null, 2));
  note(`DUMP ${name} url=${html.url} title=${html.title}`);
  return html;
}

(async () => {
  const browser = await chromium.launch({ headless: true });
  const failed = [];
  const cons = [];
  const api = [];

  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    locale: "en-IN",
  });
  const page = await context.newPage();
  page.on("console", (m) => {
    if (m.type() === "error") cons.push(m.text());
  });
  page.on("pageerror", (e) => cons.push("pageerror " + e.message));
  page.on("response", async (r) => {
    const url = r.url();
    if (r.status() >= 400) failed.push(`${r.status()} ${r.request().method()} ${url}`);
    if (/\/api\//.test(url) || /login|auth|session|otp/i.test(url)) {
      let body = "";
      try {
        body = (await r.text()).slice(0, 400);
      } catch {}
      api.push({ status: r.status(), method: r.request().method(), url, body });
    }
  });

  // Apex
  try {
    const r = await page.goto("https://flatmates.co.in/", { waitUntil: "domcontentloaded", timeout: 25000 });
    note(`APEX status=${r?.status()} final=${page.url()}`);
    await page.screenshot({ path: path.join(OUT, "00-apex.png"), fullPage: true });
    await dump(page, "00-apex");
  } catch (e) {
    note("APEX FAIL " + e.message);
  }

  // Login with published demo, wait for API
  await page.goto("https://www.flatmates.co.in/login", { waitUntil: "domcontentloaded", timeout: 40000 });
  await page.fill('input[name="email"]', "demo@flatmates.co.in");
  await page.fill('input[name="password"]', "demo123");
  const loginWait = page.waitForResponse((r) => /api|login|auth/i.test(r.url()) && r.request().method() !== "GET", {
    timeout: 20000,
  }).catch(() => null);
  await page.getByRole("button", { name: "Log in" }).click();
  const loginRes = await loginWait;
  if (loginRes) {
    let t = "";
    try {
      t = (await loginRes.text()).slice(0, 500);
    } catch {}
    note(`LOGIN_API ${loginRes.status()} ${loginRes.url()} ${t}`);
  } else {
    note("LOGIN_API no matching response in 20s");
  }
  await page.waitForTimeout(8000);
  note("AFTER_LOGIN url=" + page.url() + " waitText=" + (await page.locator("body").innerText()).slice(0, 1500));
  await page.screenshot({ path: path.join(OUT, "61-login-wait.png"), fullPage: true });
  await dump(page, "61-login-wait");
  note("COOKIES " + JSON.stringify((await context.cookies()).map((c) => ({ name: c.name, domain: c.domain }))));

  // Chat
  try {
    const cr = await page.goto("https://www.flatmates.co.in/chat", { waitUntil: "domcontentloaded", timeout: 45000 });
    await page.waitForTimeout(2500);
    note(`CHAT status=${cr?.status()} url=${page.url()}`);
    await page.screenshot({ path: path.join(OUT, "73-chat.png"), fullPage: true });
    await dump(page, "73-chat");
  } catch (e) {
    note("CHAT FAIL " + e.message);
    await page.screenshot({ path: path.join(OUT, "73-chat-fail.png") });
  }

  // Post
  try {
    const pr = await page.goto("https://www.flatmates.co.in/listings/new", { waitUntil: "domcontentloaded", timeout: 40000 });
    await page.waitForTimeout(1500);
    note(`POST status=${pr?.status()} url=${page.url()}`);
    await page.screenshot({ path: path.join(OUT, "80-post-form.png"), fullPage: true });
    await dump(page, "80-post-form");
    const body = await page.locator("body").innerText();
    if (!/welcome back/i.test(body)) {
      for (const label of ["Share a room", "Find a room", "Entire property"]) {
        const b = page.getByRole("button", { name: new RegExp(label, "i") }).first();
        if (await b.count()) {
          await b.click().catch(() => {});
          note("POST clicked " + label);
        }
      }
      for (const [sel, val] of [
        ['input[name="title"]', "[TEST - PLEASE IGNORE]"],
        ['textarea[name="description"]', "[TEST - PLEASE IGNORE] UX audit. Please ignore."],
        ['input[name="rent"]', "15000"],
        ['input[name="city"]', "Bengaluru"],
        ['input[name="locality"]', "Koramangala"],
      ]) {
        const loc = page.locator(sel).first();
        if (await loc.count()) {
          await loc.fill(val).catch(() => {});
          note("filled " + sel);
        }
      }
      await page.screenshot({ path: path.join(OUT, "81-post-filled.png"), fullPage: true });
      await dump(page, "81-post-filled");
      const publish = page.getByRole("button", { name: /publish|post listing|submit|create|save/i }).first();
      if (await publish.count()) {
        note("POST btn " + (await publish.innerText()));
        await publish.click();
        await page.waitForTimeout(2500);
        note("after post " + page.url() + " " + (await page.locator("body").innerText()).slice(0, 1800));
        await page.screenshot({ path: path.join(OUT, "83-post-submit.png"), fullPage: true });
        await dump(page, "83-post-submit");
      }
    }
  } catch (e) {
    note("POST FAIL " + e.message);
  }

  // Filters via select
  await page.goto("https://www.flatmates.co.in/browse", { waitUntil: "domcontentloaded", timeout: 40000 });
  await page.selectOption("select[name=diet]", { label: "Veg" }).catch(() => page.selectOption("select[name=diet]", "veg").catch(() => {}));
  await page.fill("input[name=q]", "Koramangala");
  await page.fill("input[name=maxRent]", "20000");
  await page.getByRole("button", { name: /^Filter$/i }).click();
  await page.waitForTimeout(1200);
  note("FILTER url=" + page.url() + " " + (await page.locator("body").innerText()).slice(0, 800));
  await page.screenshot({ path: path.join(OUT, "21b-veg-filter.png"), fullPage: true });
  await dump(page, "21b-veg-filter");
  await page.getByRole("link", { name: "Roommates only" }).first().click();
  await page.waitForTimeout(1000);
  note("ROOMMATES_ONLY " + page.url() + " " + (await page.locator("body").innerText()).slice(0, 700));
  await page.screenshot({ path: path.join(OUT, "22-roommates-only.png"), fullPage: true });

  // Locality
  await page.goto("https://www.flatmates.co.in/flatmates/bengaluru/koramangala", { waitUntil: "domcontentloaded" });
  await dump(page, "41-koramangala");
  await page.screenshot({ path: path.join(OUT, "41-koramangala.png"), fullPage: true });

  // Wrong password error
  await page.goto("https://www.flatmates.co.in/login", { waitUntil: "domcontentloaded" });
  await page.fill('input[name="email"]', "demo@flatmates.co.in");
  await page.fill('input[name="password"]', "definitely-wrong-password-not-real");
  await page.getByRole("button", { name: "Log in" }).click();
  await page.waitForTimeout(5000);
  note("WRONG_PW " + page.url() + " " + (await page.locator("body").innerText()).slice(0, 900));
  await page.screenshot({ path: path.join(OUT, "62-wrong-pw.png"), fullPage: true });

  // Mobile
  const mobile = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
    hasTouch: true,
    locale: "en-IN",
  });
  const m = await mobile.newPage();
  m.on("console", (msg) => {
    if (msg.type() === "error") cons.push("mobile: " + msg.text());
  });
  m.on("response", (r) => {
    if (r.status() >= 400) failed.push(`mobile ${r.status()} ${r.url()}`);
  });
  await m.goto("https://www.flatmates.co.in/", { waitUntil: "domcontentloaded", timeout: 40000 });
  await m.waitForTimeout(800);
  await m.screenshot({ path: path.join(OUT, "90-mobile-home.png"), fullPage: true });
  await dump(m, "90-mobile-home");
  const navToggle = m.locator("header button, nav button").first();
  if (await navToggle.count()) {
    await navToggle.click().catch(() => {});
    await m.waitForTimeout(400);
    note("MOBILE nav: " + (await m.locator("header").innerText()).slice(0, 600));
    await m.screenshot({ path: path.join(OUT, "91-mobile-nav.png"), fullPage: true });
  }
  await m.goto("https://www.flatmates.co.in/browse", { waitUntil: "domcontentloaded" });
  await m.screenshot({ path: path.join(OUT, "92-mobile-browse.png"), fullPage: true });
  await dump(m, "92-mobile-browse");
  await m.goto("https://www.flatmates.co.in/listings/l_5", { waitUntil: "domcontentloaded" });
  await m.screenshot({ path: path.join(OUT, "93-mobile-listing.png"), fullPage: true });
  await dump(m, "93-mobile-listing");
  await m.goto("https://www.flatmates.co.in/login", { waitUntil: "domcontentloaded" });
  await m.screenshot({ path: path.join(OUT, "94-mobile-login.png"), fullPage: true });

  fs.writeFileSync(path.join(OUT, "finish-notes.txt"), notes.join("\n"));
  fs.writeFileSync(path.join(OUT, "finish-failed.json"), JSON.stringify(failed, null, 2));
  fs.writeFileSync(path.join(OUT, "finish-console.json"), JSON.stringify(cons, null, 2));
  fs.writeFileSync(path.join(OUT, "finish-api.json"), JSON.stringify(api, null, 2));
  await browser.close();
  console.log("DONE finish");
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
