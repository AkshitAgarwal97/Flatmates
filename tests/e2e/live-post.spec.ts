/**
 * Live-site browser smoke + post-listing proof.
 * Run: npx playwright test tests/e2e/live-post.spec.ts --headed=false
 */
import { test, expect } from "@playwright/test";
import path from "node:path";

const BASE = process.env.BASE_URL || "https://www.flatmates.co.in";
const DEMO_EMAIL = "demo@flatmates.co.in";
const DEMO_PASS = "demo123";

test.describe.configure({ mode: "serial", timeout: 120_000 });

test("homepage loads without server error", async ({ page }) => {
  const res = await page.goto(BASE, { waitUntil: "domcontentloaded" });
  expect(res?.ok()).toBeTruthy();
  await expect(page.getByRole("link", { name: /flatmates/i }).first()).toBeVisible();
  await expect(page.getByText(/Application error/i)).toHaveCount(0);
  await expect(page.getByRole("heading", { name: /Find rooms/i })).toBeVisible();
});

test("browse listings page works", async ({ page }) => {
  await page.goto(`${BASE}/browse`, { waitUntil: "domcontentloaded" });
  await expect(page.getByText(/Application error/i)).toHaveCount(0);
  await expect(page.locator("body")).toContainText(/Browse|rooms|flatmates|listing/i);
});

test("login with demo account", async ({ page }) => {
  await page.goto(`${BASE}/login`, { waitUntil: "networkidle" });
  await page.getByPlaceholder("Email").fill(DEMO_EMAIL);
  await page.getByPlaceholder("Password").fill(DEMO_PASS);
  await page.getByRole("button", { name: /Log in/i }).click();
  await page.waitForURL(/\/browse/, { timeout: 45_000 });
  await expect(page.getByText(/Application error/i)).toHaveCount(0);
  await expect(page.getByRole("link", { name: /Rahul|Account|demo/i }).first()).toBeVisible({
    timeout: 15_000,
  });
});

test("user can post a new entire-property listing", async ({ page }) => {
  await page.goto(`${BASE}/login`, { waitUntil: "networkidle" });
  await page.locator('input[name="email"]').fill(DEMO_EMAIL);
  await page.locator('input[name="password"]').fill(DEMO_PASS);
  await Promise.all([
    page.waitForURL(/\/browse/, { timeout: 45_000 }),
    page.getByRole("button", { name: /^Log in$/i }).click(),
  ]);

  await page.goto(`${BASE}/listings/new`, { waitUntil: "networkidle" });
  await expect(page.getByRole("heading", { name: /Post a listing/i })).toBeVisible();
  await expect(page.getByText(/Application error/i)).toHaveCount(0);

  await page.getByRole("button", { name: /Entire property/i }).click();

  const title = `E2E Playwright flat ${Date.now()}`;
  await page.getByPlaceholder("Title").fill(title);
  await page.getByPlaceholder(/Describe the home/i).fill("Browser E2E listing — zero brokerage test post.");
  await page.getByPlaceholder(/Search any area|Locality, City/i).fill("Koramangala, Bengaluru");
  await page.getByPlaceholder(/Monthly rent/i).fill("25000");
  await page.getByPlaceholder(/Deposit/i).fill("50000");
  await page.getByPlaceholder(/2BHK/i).fill("2BHK");
  await page.keyboard.press("Escape");

  const photo = path.join(__dirname, "fixtures", "living-room.png");
  const uploadPromise = page.waitForResponse(
    (r) => r.url().includes("/api/upload") && r.request().method() === "POST",
    { timeout: 45_000 }
  );
  await page.locator('input[type="file"]').setInputFiles(photo);
  await expect(page.getByText(/Compressing photo/i)).toBeVisible({ timeout: 10_000 });
  const uploadRes = await uploadPromise;
  const uploadBody = await uploadRes.json().catch(() => ({}));
  expect(uploadRes.ok(), JSON.stringify(uploadBody)).toBeTruthy();
  expect(String(uploadBody.url || "")).not.toMatch(/room\.svg/);
  expect(String(uploadBody.url)).toMatch(/^(https:\/\/|\/api\/media\/)/);

  const postResPromise = page.waitForResponse(
    (r) => r.url().includes("/api/listings") && r.request().method() === "POST",
    { timeout: 45_000 }
  );
  await page.getByRole("button", { name: /Publish listing/i }).click();

  const postRes = await postResPromise;
  const postBody = await postRes.json().catch(() => ({}));
  expect(
    postRes.status(),
    `POST /api/listings failed: ${postRes.status()} ${JSON.stringify(postBody)}`
  ).toBe(200);
  expect(postBody.listing?.id).toBeTruthy();

  await page.waitForURL(new RegExp(`/listings/${postBody.listing.id}`), { timeout: 20_000 });
  await expect(page.getByText(/Listing not found/i)).toHaveCount(0);
  await expect(page.getByRole("heading", { name: title })).toBeVisible({ timeout: 15_000 });
  const postedPhoto = page.locator("img.h-56").first();
  await expect(postedPhoto).toHaveAttribute("src", /^(https:\/\/|\/api\/media\/)/);
  await expect(postedPhoto).not.toHaveAttribute("src", /room\.svg/);

  await page.reload({ waitUntil: "domcontentloaded" });
  await expect(page.getByText(/Listing not found/i)).toHaveCount(0);
  await expect(page.getByRole("heading", { name: title })).toBeVisible({ timeout: 15_000 });
});

test("seeker / roommates post mode also publishes", async ({ page }) => {
  await page.goto(`${BASE}/login`, { waitUntil: "networkidle" });
  await page.locator('input[name="email"]').fill(DEMO_EMAIL);
  await page.locator('input[name="password"]').fill(DEMO_PASS);
  await Promise.all([
    page.waitForURL(/\/browse/, { timeout: 45_000 }),
    page.getByRole("button", { name: /^Log in$/i }).click(),
  ]);

  await page.goto(`${BASE}/listings/new`, { waitUntil: "networkidle" });
  await page.getByRole("button", { name: /Looking for a roommate/i }).click();

  const title = `E2E seeker ${Date.now()}`;
  await page.getByPlaceholder("Title").fill(title);
  await page.getByPlaceholder(/Search any area|Locality, City/i).fill("HSR Layout, Bengaluru");
  await page.getByPlaceholder(/Monthly rent/i).fill("18000");

  const postResPromise = page.waitForResponse(
    (r) => r.url().includes("/api/listings") && r.request().method() === "POST",
    { timeout: 45_000 }
  );
  await page.getByRole("button", { name: /Publish listing/i }).click();
  const postRes = await postResPromise;
  const body = await postRes.json().catch(() => ({}));
  expect(postRes.status(), JSON.stringify(body)).toBe(200);
  expect(body.listing?.mode).toBe("seeker");

  await page.waitForURL(new RegExp(`/listings/${body.listing.id}`), { timeout: 20_000 });
  await expect(page.getByText(/Listing not found/i)).toHaveCount(0);
  await expect(page.getByRole("heading", { name: title })).toBeVisible();
});

test("listing gallery switches photos with arrow keys", async ({ page }) => {
  await page.goto(`${BASE}/listings/l_1`, { waitUntil: "domcontentloaded" });
  await expect(page.getByText(/Listing not found/i)).toHaveCount(0);
  await page.locator("img.h-56").first().click();
  await expect(page.getByRole("dialog", { name: /Photo viewer/i })).toBeVisible();
  await expect(page.getByText(/1\s*\/\s*\d+/)).toBeVisible();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByText(/2\s*\/\s*\d+/)).toBeVisible();
  await page.keyboard.press("ArrowLeft");
  await expect(page.getByText(/1\s*\/\s*\d+/)).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(page.getByRole("dialog", { name: /Photo viewer/i })).toHaveCount(0);
});
