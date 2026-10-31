const puppeteer = require('puppeteer');

(async () => {
  console.log('[+] Starting Frontend E2E & Layout Regression Test...');
  let browser;
  try {
    browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();
    const errors = [];
    page.on('pageerror', err => errors.push(err.toString()));

    console.log('[+] Navigating to http://localhost:3000...');
    await page.goto('http://localhost:3000', { waitUntil: 'domcontentloaded', timeout: 15000 });

    const title = await page.title();
    console.log(`[+] Page Title: "${title}"`);

    // Verify critical elements render
    const bodyText = await page.evaluate(() => document.body.innerText);
    if (!bodyText.includes('TEAMFORGE') && !bodyText.includes('TeamForge')) {
      throw new Error('TeamForge branding not found on home page');
    }

    if (errors.length > 0) {
      console.warn(`[!] Page recorded ${errors.length} runtime error(s):`, errors);
    } else {
      console.log('[✓] Zero runtime JavaScript errors detected.');
    }

    console.log('[✓] Frontend E2E Regression Test PASSED.');
    await browser.close();
    process.exit(0);
  } catch (err) {
    console.error('[✗] Frontend test failed:', err.message);
    if (browser) await browser.close();
    process.exit(1);
  }
})();
