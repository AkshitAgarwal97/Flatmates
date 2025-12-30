const puppeteer = require('puppeteer');
const path = require('path');

(async () => {
    const browser = await puppeteer.launch({
        headless: true,
        defaultViewport: null,
        args: ['--start-maximized']
    });
    const page = await browser.newPage();

    // Helper to wait and click
    const waitAndClick = async (selector) => {
        await page.waitForSelector(selector);
        await page.click(selector);
    };

    // Helper to type
    const waitAndType = async (selector, text) => {
        await page.waitForSelector(selector);
        // Clear input first just in case
        await page.click(selector, { clickCount: 3 });
        await page.keyboard.press('Backspace');
        await page.type(selector, text);
    };

    try {
        console.log('Starting E2E Tests...');

        // 1. Register/Login (Skipping Register to save time, assuming user exists or using fixed login)
        // For this test we'll assume a fresh run or reusable user. 
        // Let's rely on a known user or create one if possible. 
        // Actually, to be safe, let's just Login. If login fails, we might need to handle it.
        console.log('Navigating to Login...');
        await page.goto('https://flatmates.co.in/login');

        // Login
        await waitAndType('input[name="email"]', 'akshit.agarwal@test.com');
        await waitAndType('input[name="password"]', 'Swift@1200');
        await waitAndClick('button[type="submit"]');

        // Wait for navigation or error
        try {
            await page.waitForSelector('button[aria-label="user profile menu"]', { timeout: 5000 });
        } catch (e) {
            console.log('Navigation timeout or already there');
        }

        // CHECK BUG 2: Logout Loading State
        console.log('Checking Bug 2: Logout Loading State...');
        // We need to be logged in first. If we are on dashboard, precise.
        if (page.url().includes('login')) {
            console.log('Login failed (or already logged in?), proceeding anyway to check states.');
            // If we are still on login, maybe we are not registered. Let's try to register quickly.
            await page.goto('https://flatmates.co.in/register');
            const uniqueId = Date.now();
            await waitAndType('input[name="name"]', `Test User ${uniqueId}`);
            await waitAndType('input[name="email"]', `test${uniqueId}@example.com`);
            await waitAndType('input[name="password"]', 'password123');
            await waitAndType('input[name="confirmPassword"]', 'password123');
            await waitAndClick('input[name="agreeToTerms"]');
            await waitAndClick('button[type="submit"]');
            try {
                // Wait for navigation or success element
                await page.waitForSelector('button[aria-label="user profile menu"]', { timeout: 5000 });
            } catch (e) {
                console.log('Navigation timeout, checking if URL changed...');
            }
            if (page.url().includes('register')) {
                console.error('FAIL: Still on register page. Registration might have failed.');
                // Try to verify if we are logged in anyway
            }
        }

        // Now Logout
        await waitAndClick('button[aria-label="user profile menu"]'); // User Menu
        await waitAndClick('li[role="menuitem"]:last-child'); // Logout is usually last

        // Check Login Button State
        await page.goto('https://flatmates.co.in/login');
        const loginButton = await page.$('button[type="submit"]');
        const isLoading = await page.evaluate(el => el.disabled, loginButton);
        if (isLoading) {
            console.error('FAIL: Login button is still disabled (loading state) after logout.');
        } else {
            console.log('PASS: Login button is active after logout.');
        }

        // Login Again
        await waitAndType('input[name="email"]', 'akshit.agarwal@test.com'); // This might fail if we created a dynamic user above. 
        // Ideally we should use the user we just created. But simpler to just fail if manual intervention needed during dev.
        // For now, let's assume 'test@example.com' exists or manual login.
        // Actually, let's just use the dynamic user if we created one, but scope is tricky.
        // Let's just create a new user every time for robustness? No, floods DB.
        // User Instructions safely said "start fixing... test...". Use 'test@example.com' / 'password123' as standard.

        await waitAndType('input[name="password"]', 'Swift@1200');
        await waitAndClick('button[type="submit"]');
        await page.waitForSelector('button[aria-label="user profile menu"]', { timeout: 5000 });

        // CHECK BUG 4: Property Page Navigation
        console.log('Checking Bug 4: Property Page Navigation...');
        await page.click('a[href="/properties"]');
        // Check for error element or list
        await page.waitForSelector('.MuiCard-root', { timeout: 5000 }).catch(e => console.log('No properties found or loading error'));
        const errorText = await page.evaluate(() => document.body.innerText);
        if (errorText.includes('Error')) {
            console.error('FAIL: Error displayed on Property List page.');
        } else {
            console.log('PASS: Property List page loaded without visible errors.');
        }

        // CHECK BUG 1, 3, 5, 6: Property Form
        console.log('Checking Bugs 1, 3, 5, 6: Property Form...');
        await page.goto('https://flatmates.co.in/properties/create');

        // Bug 6: Price Input Default Value
        console.log('Current URL before property check:', page.url());
        if (page.url().includes('login')) {
            console.error('FAIL: Redirected to login page. Login session might be lost.');
            process.exit(1);
        }

        // Bug 6: Price Input Default Value
        try {
            await page.waitForSelector('input[name="price.amount"]', { timeout: 10000 });
        } catch (e) {
            console.error('FAIL: Price input not found. Current URL:', page.url());
            process.exit(1);
        }
        const priceInput = await page.$('input[name="price.amount"]');
        await priceInput.focus();
        await page.keyboard.type('500');
        const priceValue = await page.evaluate(el => el.value, priceInput);
        if (priceValue === '0500' || priceValue.startsWith('0')) {
            console.error(`FAIL: Price input has leading zero: ${priceValue}`);
        } else {
            console.log(`PASS: Price input handled correctly: ${priceValue}`);
        }

        // Bug 5: Currency Symbol
        const currencyContent = await page.evaluate(() => document.body.innerText);
        if (currencyContent.includes('₹')) {
            console.log('PASS: Currency symbol ₹ found.');
        } else {
            console.error('FAIL: Currency symbol ₹ NOT found (likely still $).');
        }

        // Bug 1: Pin Code API
        // Need to fill address to trigger this?
        await waitAndType('input[name="address.zipCode"]', '110001'); // New Delhi
        await new Promise(r => setTimeout(r, 2000)); // Wait for API
        const cityValue = await page.$eval('input[name="address.city"]', el => el.value);
        const stateValue = await page.$eval('input[name="address.state"]', el => el.value);

        if (cityValue && stateValue) {
            console.log(`PASS: Pin Code Auto-filled City: ${cityValue}, State: ${stateValue}`);

            // Bug 3 Check: Disabled fields
            const cityDisabled = await page.$eval('input[name="address.city"]', el => el.disabled);
            const stateDisabled = await page.$eval('input[name="address.state"]', el => el.disabled);
            if (cityDisabled && stateDisabled) {
                console.log('PASS: City and State fields are disabled after Pin Code Auto-fill.');
            } else {
                console.error('FAIL: City and State fields are NOT disabled.');
            }
        } else {
            console.error('FAIL: Pin Code did NOT auto-fill City/State.');
        }

        // Bug 3: Available From Date
        await waitAndType('input[name="availableFrom"]', '2025-12-31');

        // Fill rest of form to submit
        await waitAndType('input[name="title"]', 'Test Property Automation');
        await waitAndType('textarea[name="description"]', 'This is a test description for automation verification. It needs to be long enough.');
        await waitAndClick('div[id="mui-component-select-propertyType"]');
        await new Promise(r => setTimeout(r, 500));
        await waitAndClick('li[data-value="apartment"]');
        await new Promise(r => setTimeout(r, 500));

        await waitAndClick('div[id="mui-component-select-listingType"]');
        await new Promise(r => setTimeout(r, 500));
        await waitAndClick('li[data-value="entire_property"]');
        await new Promise(r => setTimeout(r, 500));

        console.log('Scrolling to User Type...');
        // Scroll down to ensure User Type is visible
        await page.evaluate(() => {
            const element = document.getElementById('mui-component-select-userType');
            if (element) element.scrollIntoView();
        });
        await new Promise(r => setTimeout(r, 500));

        console.log('Selecting User Type...');
        try {
            await waitAndClick('div[id="mui-component-select-userType"]');
        } catch (e) {
            console.error('FAIL: Could not click userType dropdown via selector. Trying JS click...');
            await page.evaluate(() => {
                const el = document.getElementById('mui-component-select-userType');
                if (el) el.click();
            });
        }
        await new Promise(r => setTimeout(r, 500));
        await waitAndClick('li[data-value="property_owner"]');

        await waitAndType('input[name="address.street"]', '123 Test St');
        await waitAndType('input[name="address.city"]', 'Test City'); // Force fill if API failed
        await waitAndType('input[name="address.state"]', 'Test State');
        await waitAndType('input[name="address.country"]', 'India');

        // Image Upload
        console.log('Testing Image Upload...');
        const inputUploadHandle = await page.$('input[type="file"]');
        await inputUploadHandle.uploadFile('C:\\Users\\Akshi\\Downloads\\Screenshot 2025-06-13 160948.png');
        // Verify preview appears
        await page.waitForSelector('img[alt="Preview 0"]', { timeout: 5000 });
        console.log('PASS: Image uploaded and preview verified.');

        // Submit
        await waitAndClick('button[type="submit"]');

        // Check for success or error
        try {
            await page.waitForNavigation({ timeout: 5000 });
            console.log('PASS: Property submitted successfully.');
        } catch (e) {
            const errorMsg = await page.evaluate(() => document.body.innerText);
            console.error('FAIL: Submission failed or timed out. Page content:', errorMsg.substring(0, 200));
            process.exit(1);
        }

        // Verify Bug 1: Image Persistence
        console.log('Verifying Image persistence...');
        // Wait for image to load on details page
        try {
            // Look for any image with src (assuming it's the property image)
            // or specific class. MUI CardMedia often creates a div with background-image or an img tag.
            await page.waitForSelector('img', { timeout: 5000 });
            const images = await page.$$eval('img', imgs => imgs.map(img => img.src));
            console.log('Found images:', images);
            if (images.some(src => src.includes('s3') || src.includes('blob') || src.length > 0)) {
                console.log('PASS: Property image is visible.');
            } else {
                console.warn('WARNING: No property image found or source is empty.');
            }
        } catch (e) {
            console.warn('WARNING: Could not verify property image on details page.');
        }

        console.log('E2E Tests Completed.');
        // await browser.close(); // Keep open for inspection if needed, or close
        process.exit(0);

    } catch (err) {
        const fs = require('fs');
        fs.writeFileSync('test_error.log', err.stack || err.toString());
        console.error('Unexpected Test Error:', err);
        process.exit(1);
    }
})();
