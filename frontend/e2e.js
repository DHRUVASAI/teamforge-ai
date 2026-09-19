const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  console.log("Launching browser...");
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  try {
    console.log("Navigating to http://localhost:3000...");
    await page.goto('http://localhost:3000');
    
    // Wait for the 3D intro to finish (2800ms)
    console.log("Waiting for 3D intro to finish...");
    await new Promise(r => setTimeout(r, 3500));
    await page.screenshot({ path: 'screenshot_1_home.png' });
    console.log("Took screenshot_1_home.png");

    console.log("Clicking 'Join Mission'...");
    // Find a link that contains 'Join Mission'
    const link = await page.$('a[href="/register"]');
    if (link) {
      await link.click();
    } else {
      console.log("Could not find /register link!");
    }
    
    await page.waitForNavigation({ waitUntil: 'networkidle0' });
    await page.screenshot({ path: 'screenshot_2_register.png' });
    console.log("Took screenshot_2_register.png");

    console.log("Filling form...");
    // The form has type="text", "email", "password"
    await page.type('input[type="text"]', 'EndToEnd Tester');
    await page.type('input[type="email"]', `test_${Date.now()}@test.com`);
    await page.type('input[type="password"]', 'secure123');
    
    console.log("Submitting form...");
    await page.click('button[type="submit"]');

    // Wait for either the dashboard to load or an error to appear
    console.log("Waiting for navigation or error...");
    await new Promise(r => setTimeout(r, 4000));
    
    await page.screenshot({ path: 'screenshot_3_dashboard.png' });
    console.log("Took screenshot_3_dashboard.png");

    // Also let's check the current URL
    console.log("Current URL is:", page.url());

    // Copy screenshots to brain directory so I can see them if needed
    fs.copyFileSync('screenshot_1_home.png', 'C:\\Users\\dhruv\\.gemini\\antigravity\\brain\\0d67913c-7f70-4972-8aac-ad238bf4bd01\\screenshot_1_home.png');
    fs.copyFileSync('screenshot_2_register.png', 'C:\\Users\\dhruv\\.gemini\\antigravity\\brain\\0d67913c-7f70-4972-8aac-ad238bf4bd01\\screenshot_2_register.png');
    fs.copyFileSync('screenshot_3_dashboard.png', 'C:\\Users\\dhruv\\.gemini\\antigravity\\brain\\0d67913c-7f70-4972-8aac-ad238bf4bd01\\screenshot_3_dashboard.png');

  } catch (err) {
    console.error("Error during flow:", err);
  } finally {
    await browser.close();
    console.log("Done.");
  }
})();
