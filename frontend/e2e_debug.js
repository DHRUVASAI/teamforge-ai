const puppeteer = require('puppeteer');
(async () => {
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  try {
    await page.goto('http://localhost:3000/register');
    await new Promise(r => setTimeout(r, 3500));
    await page.type('input[type="text"]', 'Full Flow Commander');
    await page.type('input[type="email"]', `full_${Date.now()}@test.com`);
    await page.type('input[type="password"]', 'secure123');
    await page.click('button[type="submit"]');
    await page.waitForSelector('a[href="/dashboard/new"]');
    await page.click('a[href="/dashboard/new"]');
    await page.waitForSelector('textarea.arcade-input');
    const inputs = await page.$$('input.arcade-input');
    await inputs[0].type('Auto Event System');
    const textareas = await page.$$('textarea.arcade-input');
    await textareas[0].type('People hate waiting in line to buy tickets.');
    await textareas[1].type('An automated queue app using Next.js and WebSockets.');
    await page.click('button[type="submit"]');
    await new Promise(r => setTimeout(r, 2000));
    const text = await page.evaluate(() => document.body.innerText);
    console.log("PAGE TEXT AFTER SUBMIT:\n", text.substring(0, 500));
  } catch (err) {
    console.error(err);
  } finally {
    await browser.close();
  }
})();
