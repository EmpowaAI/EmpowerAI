const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

(async () => {
  const outDir = path.resolve(__dirname, '..', 'screenshots');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

  const browser = await chromium.launch();
  const page = await browser.newPage();

  const urls = [
    { name: 'landing', url: 'http://localhost:5173/' },
    { name: 'signup', url: 'http://localhost:5173/signup' },
    { name: 'login', url: 'http://localhost:5173/login' },
    { name: 'dashboard', url: 'http://localhost:5173/dashboard' },
    { name: 'twin', url: 'http://localhost:5173/dashboard/twin' },
  ];

  const viewports = [
    { name: 'iphone-se', width: 375, height: 667 },
    { name: 'mobile', width: 540, height: 960 },
    { name: 'tablet', width: 768, height: 1024 },
    { name: 'desktop', width: 1280, height: 800 },
  ];

  for (const vp of viewports) {
    await page.setViewportSize({ width: vp.width, height: vp.height });
    for (const u of urls) {
      try {
        await page.goto(u.url, { waitUntil: 'networkidle', timeout: 15000 });
        // wait a bit for animations to settle
        await page.waitForTimeout(800);
        const file = path.join(outDir, `${u.name}-${vp.name}.png`);
        await page.screenshot({ path: file, fullPage: true });
        console.log(`Saved ${file}`);
      } catch (err) {
        console.error(`Failed to capture ${u.url} at ${vp.name}:`, err.message);
      }
    }
  }

  await browser.close();
  console.log('Screenshots complete');
})();
