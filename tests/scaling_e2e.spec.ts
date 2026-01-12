import { test, expect } from '@playwright/test';

test.describe('Scaling and Monetization', () => {
    test('City landing pages and SEO metadata', async ({ page }) => {
        await page.goto('/flats-in-delhi');
        await expect(page).toHaveTitle(/Flats in Delhi/);
        await expect(page.locator('h1')).toContainText('Flats in Delhi');

        // Verify meta description (SEO)
        const description = await page.getAttribute('meta[name="description"]', 'content');
        expect(description).toContain('Delhi');
    });

    test('Language switch updates UI text', async ({ page }) => {
        await page.goto('/');

        // Switch to Hinglish
        await page.click('[data-testid="language-switcher"]');
        await page.click('text=Hinglish');

        // Verify translation (example text)
        await expect(page.locator('text=Kamra Dhundo')).toBeVisible();
    });

    test('Monetization: Featured listings visibility', async ({ page }) => {
        await page.goto('/properties');
        // Featured listings should have a specific chip and likely appear first
        const firstProperty = page.locator('.property-card').first();
        await expect(firstProperty.locator('text=FEATURED')).toBeVisible();
    });

    test('Services Marketplace navigation', async ({ page }) => {
        await page.goto('/');
        await page.click('text=Services');
        await page.waitForURL(/\/services/);
        await expect(page.locator('text=Find everything you need for your new home')).toBeVisible();

        // Verify categories
        await expect(page.locator('text=Movers')).toBeVisible();
        await expect(page.locator('text=Cleaning')).toBeVisible();
    });
});
