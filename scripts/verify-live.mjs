import puppeteer from 'puppeteer-core';

async function testLive() {
  const browser = await puppeteer.launch({
    executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  const errors = [];
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text());
  });
  page.on('pageerror', err => errors.push(err.toString()));

  console.log('Navigating to live GitHub Pages...');
  await page.goto('https://sefga.github.io/sticker-sheet-a4-generator/', { waitUntil: 'networkidle0', timeout: 30000 });
  const title = await page.title();
  console.log('Page title:', title);
  console.log('Console errors count:', errors.length);
  if (errors.length > 0) console.log('Errors:', errors);

  await page.setViewport({ width: 1280, height: 800 });
  await page.screenshot({ path: 'test-results/live-desktop.png' });
  console.log('Screenshot saved to test-results/live-desktop.png');

  await browser.close();
}

testLive().catch(err => {
  console.error(err);
  process.exit(1);
});
