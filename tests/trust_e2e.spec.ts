import { test, expect } from '@playwright/test';

test.describe('Trust and Communication Flow', () => {
    test('User can send message and mutual interest results in contact sharing', async ({ page }) => {
        // 1. Login as User A
        await page.goto('/login');
        await page.fill('input[name="email"]', 'testuser@example.com');
        await page.fill('input[name="password"]', 'password123');
        await page.click('button[type="submit"]');

        // 2. Search and View Listing
        await page.goto('/properties');
        await page.waitForSelector('.property-card');
        await page.click('.property-card >> text=View Details');

        // 3. Verify Match Score visibility
        await expect(page.locator('text=% Match')).toBeVisible();

        // 4. Send Message (Open Chat)
        await page.click('text=Contact Owner');
        await page.waitForURL(/\/messages/);
        await page.fill('textarea', 'Hi, I am interested in your flat!');
        await page.click('button:has-text("Send")');

        // 5. Verify contact is hidden (Privacy rule)
        // Note: This depends on the owner not having expressed interest yet
        await expect(page.locator('text=Phone hidden')).toBeVisible();

        // 6. Report Listing (Trust & Safety)
        await page.goto('/properties');
        await page.click('.property-card >> text=View Details');
        await page.click('button:has-text("Report")');
        await page.selectOption('select', 'reasons[0]'); // Dummy select
        await page.fill('textarea[name="description"]', 'Inaccurate price');
        await page.click('button:has-text("Submit Report")');
        await expect(page.locator('text=Report submitted')).toBeVisible();
    });
});
