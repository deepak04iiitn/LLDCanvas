const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  page.on('pageerror', err => console.log('[pageerror]', err.message));

  await page.goto('http://localhost:3000/playground', { waitUntil: 'networkidle' });
  await page.waitForTimeout(1200);

  await page.screenshot({ path: 'pg-01-hero.png' });

  await page.evaluate(() => window.scrollTo(0, document.querySelector('section:nth-of-type(2)')?.offsetTop ?? 800));
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'pg-02-howitworks.png' });

  await page.evaluate(() => {
    const el = document.querySelector('[class*="h-[75vh]"]');
    if (el) el.scrollIntoView();
  });
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'pg-03-liveplayground.png' });

  await page.screenshot({ path: 'pg-04-fullpage.png', fullPage: true });

  await browser.close();
})();
