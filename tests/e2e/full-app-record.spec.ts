/**
 * Full-app browser recording: new user, photo upload, post listing, then a site tour.
 * Video is always saved under web/recordings/
 *
 * Run locally:
 *   npx playwright test tests/e2e/full-app-record.spec.ts --config=playwright.record.config.ts
 */
import { test, expect } from "@playwright/test";
import path from "node:path";

const photos = [
  path.join(__dirname, "fixtures", "living-room.png"),
  path.join(__dirname, "fixtures", "bedroom.png"),
  path.join(__dirname, "fixtures", "kitchen.png"),
];

test.describe.configure({ mode: "serial", timeout: 180_000 });

test("register, post listing with photos, tour the app", async ({ page }) => {
  const stamp = Date.now();
  const name = "Priya Sharma";
  const email = `priya.qa.${stamp}@flatmates.test`;
  const password = "TestPass9!";
  const title = `Sunlit 2BHK in Koramangala ${stamp}`;

  const issues: string[] = [];
  page.on("pageerror", (err) => issues.push(`pageerror: ${err.message}`));
  page.on("response", (res) => {
    if (res.status() >= 500) issues.push(`HTTP ${res.status()} ${res.url()}`);
  });

  await page.goto("/", { waitUntil: "domcontentloaded" });
  await expect(page.getByRole("heading", { name: /Find rooms/i })).toBeVisible();
  await expect(page.getByText(/Application error/i)).toHaveCount(0);

  await page.getByRole("link", { name: "Browse" }).first().click();
  await expect(page.locator("body")).toContainText(/Browse|rooms|listing|flatmate/i);

  await page.getByRole("link", { name: "Join free" }).first().click();
  await expect(page.getByRole("heading", { name: /Create a free account/i })).toBeVisible();
  await page.getByPlaceholder("Full name").fill(name);
  await page.getByPlaceholder("Email").fill(email);
  await page.getByPlaceholder("Password").fill(password);
  await page.getByRole("button", { name: /Join Flatmates/i }).click();

  await expect(page.getByRole("heading", { name: /Verify email OTP/i })).toBeVisible({ timeout: 20_000 });
  const hint = page.locator("strong").first();
  await expect(hint).toHaveText(/\d{6}/, { timeout: 15_000 });
  const otp = (await hint.innerText()).trim();
  await page.getByPlaceholder("••••••").fill(otp);
  await Promise.all([
    page.waitForURL(/\/browse/, { timeout: 30_000 }),
    page.getByRole("button", { name: /Verify & continue/i }).click(),
  ]);
  await expect(page.getByRole("link", { name: /Priya/i }).first()).toBeVisible({ timeout: 15_000 });

  await page.goto("/listings/new", { waitUntil: "networkidle" });
  await expect(page.getByRole("heading", { name: /Post a listing/i })).toBeVisible();
  await page.getByRole("button", { name: /Entire property/i }).click();
  await page.getByPlaceholder("Title").fill(title);
  await page.getByPlaceholder(/Describe the home/i).fill(
    "Fully furnished 2BHK near Koramangala 5th block. Veg-friendly, WFH-ready, attached washroom. Sample photos attached for QA."
  );
  await page.getByPlaceholder(/Search any area|Locality, City/i).fill("Koramangala, Bengaluru");
  await page.getByPlaceholder(/Monthly rent/i).fill("28000");
  await page.getByPlaceholder(/Deposit/i).fill("56000");
  await page.getByPlaceholder(/2BHK/i).fill("2BHK");

  const fileInput = page.locator('input[type="file"]');
  const thumbs = page.locator("form img");
  for (let i = 0; i < photos.length; i++) {
    await fileInput.setInputFiles(photos[i]);
    await expect(thumbs).toHaveCount(i + 1, { timeout: 20_000 });
  }

  const postResPromise = page.waitForResponse(
    (r) => r.url().includes("/api/listings") && r.request().method() === "POST",
    { timeout: 45_000 }
  );
  await page.getByRole("button", { name: /Publish listing/i }).click();
  const postRes = await postResPromise;
  const postBody = await postRes.json().catch(() => ({}));
  expect(postRes.status(), JSON.stringify(postBody)).toBe(200);
  expect(postBody.listing?.id).toBeTruthy();
  expect(postBody.listing?.images?.length).toBeGreaterThanOrEqual(3);

  await page.waitForURL(new RegExp(`/listings/${postBody.listing.id}`), { timeout: 20_000 });
  await expect(page.getByText(/Listing not found/i)).toHaveCount(0);
  await expect(page.getByRole("heading", { name: title })).toBeVisible({ timeout: 15_000 });
  await expect(page.locator("img").first()).toBeVisible();

  await page.getByRole("link", { name: "Priya" }).first().click();
  await expect(page.getByRole("heading", { name: /Priya Sharma/i })).toBeVisible();
  await expect(page.getByRole("link", { name: title })).toBeVisible();

  await page.getByRole("link", { name: "Map" }).first().click();
  await expect(page.getByText(/Application error/i)).toHaveCount(0);

  await page.getByRole("link", { name: "Guides" }).first().click();
  await expect(page.getByText(/Application error/i)).toHaveCount(0);

  await page.getByRole("link", { name: "Cities" }).first().click();
  await expect(page.getByText(/Application error/i)).toHaveCount(0);

  await page.getByRole("link", { name: "Boost" }).first().click();
  await expect(page.getByText(/Application error/i)).toHaveCount(0);

  await page.getByRole("link", { name: "Chat" }).first().click();
  await expect(page.getByText(/Application error/i)).toHaveCount(0);

  await page.getByRole("link", { name: "Roommates" }).first().click();
  await expect(page.getByText(/Application error/i)).toHaveCount(0);

  await page.goto("/browse", { waitUntil: "domcontentloaded" });
  await expect(page.getByText(title)).toBeVisible({ timeout: 15_000 });

  expect(issues, issues.join("\n")).toEqual([]);
});
