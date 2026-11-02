import { test, expect, type Page } from "@playwright/test";

const BASE = process.env.BASE_URL || "http://127.0.0.1:3000";

test.describe.configure({ timeout: 120_000 });

async function login(page: Page, email: string, password: string) {
  await page.goto(`${BASE}/login`, { waitUntil: "networkidle" });
  await page.locator('input[name="email"]').fill(email);
  await page.locator('input[name="password"]').fill(password);
  await Promise.all([
    page.waitForURL(/\/browse/, { timeout: 45_000 }),
    page.getByRole("button", { name: /^Log in$/i }).click(),
  ]);
}

test("two users can send and receive chat messages", async ({ browser }) => {
  const stamp = Date.now();
  const fromSeeker = `Hi Meera, is the Koramangala room still free ${stamp}?`;
  const fromOwner = `Yes Ananya, it is still available ${stamp}`;

  const seekerCtx = await browser.newContext();
  const ownerCtx = await browser.newContext();
  const seeker = await seekerCtx.newPage();
  const owner = await ownerCtx.newPage();

  await login(seeker, "seeker@flatmates.co.in", "demo123");
  await login(owner, "owner@flatmates.co.in", "demo123");

  await seeker.goto(`${BASE}/listings/l_2`, { waitUntil: "networkidle" });
  await expect(seeker.getByRole("button", { name: /Chat securely/i })).toBeVisible();
  await seeker.getByRole("button", { name: /Chat securely/i }).click();
  await seeker.waitForURL(/\/chat\/t_/, { timeout: 20_000 });
  await expect(seeker.getByText(/Hi, is this still available/i)).toBeVisible({ timeout: 15_000 });

  const composer = seeker.getByPlaceholder(/Message \(no phone\/email\)/i);
  await composer.fill(fromSeeker);
  await seeker.getByRole("button", { name: /^Send$/i }).click();
  await expect(seeker.getByText(fromSeeker)).toBeVisible({ timeout: 15_000 });

  await owner.goto(`${BASE}/chat`, { waitUntil: "networkidle" });
  await expect(owner.getByText(fromSeeker)).toBeVisible({ timeout: 20_000 });
  await owner.getByText(fromSeeker).click();
  await owner.waitForURL(/\/chat\/t_/, { timeout: 15_000 });
  await expect(owner.getByText(fromSeeker)).toBeVisible();

  await owner.getByPlaceholder(/Message \(no phone\/email\)/i).fill(fromOwner);
  await owner.getByRole("button", { name: /^Send$/i }).click();
  await expect(owner.getByText(fromOwner)).toBeVisible({ timeout: 15_000 });

  await expect(seeker.getByText(fromOwner)).toBeVisible({ timeout: 20_000 });

  await seekerCtx.close();
  await ownerCtx.close();
});
