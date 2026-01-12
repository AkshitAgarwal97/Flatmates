import { test, expect } from '@playwright/test';

// Performance threshold (in milliseconds)
const MAX_LOAD_TIME = 20000;

test.describe('Mobile Viewport E2E Scenarios', () => {

    test('Mobile viewport loads homepage successfully', async ({ page }) => {
        const startTime = Date.now();
        await page.goto('/');
        const loadTime = Date.now() - startTime;

        // Check performance
        console.log(`Homepage load time: ${loadTime}ms`);
        expect(loadTime).toBeLessThan(MAX_LOAD_TIME);

        // Verify title or key elements
        await expect(page).toHaveTitle(/Flatmates|Find|Roommates/i);
    });

    test('Listing cards are visible with rent and area', async ({ page }) => {
        await page.goto('/properties');

        // Wait for listings to load (assuming skeleton loader or API call)
        const propertyCard = page.locator('div[class*="MuiCard-root"]').first();
        await propertyCard.waitFor({ state: 'visible', timeout: 10000 });

        // Check specific details in the first card
        await expect(propertyCard).toBeVisible();

        // Check for Rent price (₹ symbol)
        await expect(propertyCard.getByText('₹')).toBeVisible();

        // Check for Area (ft²)
        await expect(propertyCard.getByText('ft²')).toBeVisible();

        // Check for Location icon or text availability
        // Note: Selectors might need adjustment based on real DOM, using text matching for now
    });

    test('Bottom navigation works on mobile', async ({ page, isMobile }) => {
        // Only run this test on mobile project
        if (!isMobile) test.skip();

        await page.goto('/');
        try {
            await page.waitForLoadState('networkidle', { timeout: 10000 });
        } catch (e) { console.log('Network idle timeout, proceeding...'); }

        // Check if bottom nav exists
        const bottomNav = page.locator('.MuiBottomNavigation-root');
        await expect(bottomNav).toBeVisible({ timeout: 15000 });

        // Verify tabs
        await expect(bottomNav.getByRole('button', { name: 'Home' })).toBeVisible();
        await expect(bottomNav.getByRole('button', { name: 'Search' })).toBeVisible();
        await expect(bottomNav.getByRole('button', { name: 'Post' })).toBeVisible();
        await expect(bottomNav.getByRole('button', { name: 'Chats' })).toBeVisible();
        await expect(bottomNav.getByRole('button', { name: 'Profile' })).toBeVisible();

        // Test navigation
        await bottomNav.getByRole('button', { name: 'Search' }).click();
        await expect(page).toHaveURL(/.*properties/);
    });

    test('Clicking a listing opens detail page', async ({ page }) => {
        await page.goto('/properties');

        // Find first card
        const firstCard = page.locator('div[class*="MuiCard-root"]').first();
        await firstCard.waitFor({ state: 'visible' });

        // Get title to verify on next page
        const cardTitle = await firstCard.getByRole('heading', { level: 3 }).innerText(); // Assuming h3 used in card

        await firstCard.click();

        // Verify URL change
        await expect(page).toHaveURL(/.*properties\/.+/);

        // Verify title matches (or part of it)
        // Detailed page might have h1 with title
        await expect(page.locator('h1')).toContainText(cardTitle, { ignoreCase: true });
    });

});
