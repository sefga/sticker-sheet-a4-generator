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
  let title = await page.title();
  console.log('GitHub Pages title:', title, '| Errors:', errors.length);

  console.log('Navigating to live Vercel...');
  errors.length = 0;
  await page.goto('https://sticker-sheet-a4-generator.vercel.app', { waitUntil: 'networkidle0', timeout: 30000 });
  title = await page.title();
  console.log('Vercel title:', title, '| Errors:', errors.length);

  await page.setViewport({ width: 1280, height: 800 });
  await page.screenshot({ path: 'test-results/live-vercel.png' });
  console.log('Screenshot saved to test-results/live-vercel.png');

  await browser.close();
}

testLive().catch(err => {
  console.error(err);
  process.exit(1);
});
