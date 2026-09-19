const puppeteer = require('puppeteer');

(async () => {
  console.log("Launching browser for complete flow...");
  const browser = await puppeteer.launch({ headless: 'new' });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  try {
    console.log("Navigating to http://localhost:3000/register...");
    await page.goto('http://localhost:3000/register');
    
    console.log("Waiting for 3D intro to finish (3s)...");
    await new Promise(r => setTimeout(r, 3500));
    
    console.log("Filling form...");
    await page.type('input[type="text"]', 'Full Flow Commander');
    await page.type('input[type="email"]', `full_${Date.now()}@test.com`);
    await page.type('input[type="password"]', 'secure123');
    
    console.log("Submitting registration...");
    await page.click('button[type="submit"]');
    
    console.log("Waiting for dashboard...");
    await page.waitForSelector('a[href="/dashboard/new"]', { timeout: 10000 });
    console.log("On Dashboard. URL:", page.url());

    console.log("Clicking + New Mission...");
    await page.click('a[href="/dashboard/new"]');
    
    console.log("Waiting for new mission form...");
    await page.waitForSelector('textarea.arcade-input', { timeout: 10000 });
    console.log("On New Mission form. URL:", page.url());

    console.log("Filling new mission form...");
    const inputs = await page.$$('input.arcade-input');
    await inputs[0].type('Auto Event System');
    
    const textareas = await page.$$('textarea.arcade-input');
    await textareas[0].type('People hate waiting in line to buy tickets.');
    await textareas[1].type('An automated queue app using Next.js and WebSockets.');
    
    console.log("Submitting new mission...");
    await page.click('button[type="submit"]');
    
    console.log("Waiting for Mission Detail...");
    await page.waitForFunction(() => document.body.innerText.includes('[ MISSION BRIEFING ]'), { timeout: 10000 });
    console.log("On Mission Detail. URL:", page.url());

    console.log("Clicking Generate My Build Plan...");
    await page.click('button.arcade-btn-primary');
    
    console.log("Waiting for Playbook Page...");
    await page.waitForFunction(() => document.body.innerText.includes('MISSION PLAYBOOK'), { timeout: 25000 });
    console.log("On Playbook Page! URL:", page.url());
    
    await new Promise(r => setTimeout(r, 2000));
    await page.screenshot({ path: 'screenshot_final_playbook.png', fullPage: true });
    
    const content = await page.evaluate(() => document.body.innerText);
    if (content.includes("AI IS WARMING UP")) {
      console.log("SUCCESS! Playbook rendered successfully with AI Warming Up Fallback.");
    } else if (content.includes("FRONTEND")) {
      console.log("SUCCESS! Playbook rendered with actual LLM generation.");
    } else {
      console.log("WARNING: Playbook rendered but could not find expected text.");
    }
  } catch (err) {
    console.error("Error during flow:", err);
  } finally {
    await browser.close();
    console.log("Done.");
  }
})();
