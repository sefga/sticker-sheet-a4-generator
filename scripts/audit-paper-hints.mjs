import puppeteer from 'puppeteer-core';
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const distDir = path.resolve(__dirname, '../dist');
const CHROME_PATH = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const ARTIFACT_DIR = 'C:\\Users\\sokol\\.gemini\\antigravity\\brain\\9b742780-902a-4b12-a6e0-470f65c4a30c';

const server = http.createServer((req, res) => {
  let filePath = path.join(distDir, req.url === '/' ? 'index.html' : req.url.split('?')[0]);
  if (!fs.existsSync(filePath)) filePath = path.join(distDir, 'index.html');
  const ext = path.extname(filePath).toLowerCase();
  const mime = { '.html': 'text/html', '.js': 'application/javascript', '.css': 'text/css' };
  res.writeHead(200, { 'Content-Type': mime[ext] || 'text/plain' });
  fs.createReadStream(filePath).pipe(res);
});

server.listen(4487, async () => {
  const browser = await puppeteer.launch({ executablePath: CHROME_PATH, headless: true });
  const page = await browser.newPage();
  await page.setViewport({ width: 375, height: 812, isMobile: true, hasTouch: true });
  await page.goto('http://localhost:4487', { waitUntil: 'networkidle0' });

  await page.evaluate(() => {
    document.getElementById('btnLangRu')?.click();
  });
  await new Promise(r => setTimeout(r, 150));

  const scenarios = [
    {
      name: '1_default_a4',
      action: async () => {},
    },
    {
      name: '2_click_letter_chip',
      action: async () => {
        await page.evaluate(() => document.getElementById('chipPaperLetter')?.click());
      },
    },
    {
      name: '3_click_more_chip',
      action: async () => {
        await page.evaluate(() => document.getElementById('chipPaperMore')?.click());
      },
    },
    {
      name: '4_select_a3_from_modal',
      action: async () => {
        await page.evaluate(() => {
          const cards = Array.from(document.querySelectorAll('.catalog-card'));
          const a3 = cards.find(c => c.textContent.includes('A3'));
          if (a3) a3.click();
        });
      },
    },
    {
      name: '5_select_wb_from_chips',
      action: async () => {
        await page.evaluate(() => document.getElementById('chipPaperWb')?.click());
      },
    },
  ];

  for (const s of scenarios) {
    await s.action();
    await new Promise(r => setTimeout(r, 250));

    const state = await page.evaluate(() => {
      const moreGroup = document.getElementById('morePaperGroup');
      const hint = document.getElementById('paperFormatHint');
      const summaryCard = document.getElementById('paperSummaryCard');
      const customGroup = document.getElementById('customPaperGroup');
      const activeChip = document.querySelector('.paper-chip-btn.active');

      return {
        activeChip: activeChip ? activeChip.textContent.trim() : null,
        morePaperGroupVisible: moreGroup ? (moreGroup.offsetParent !== null && window.getComputedStyle(moreGroup).display !== 'none') : false,
        paperFormatHintVisible: hint ? (hint.offsetParent !== null && window.getComputedStyle(hint).display !== 'none' && hint.textContent.trim().length > 0) : false,
        paperFormatHintText: hint ? hint.textContent.trim() : '',
        summaryCardTitle: document.getElementById('paperSummaryTitle')?.textContent.trim(),
        customGroupVisible: customGroup ? window.getComputedStyle(customGroup).display !== 'none' : false,
      };
    });

    await page.evaluate(() => {
      document.querySelector('.panel-section:nth-of-type(3)')?.scrollIntoView();
    });
    const shotPath = path.join(ARTIFACT_DIR, 'audit_scenario_' + s.name + '.png');
    await page.screenshot({ path: shotPath });

    console.log('SCENARIO: ' + s.name);
    console.log(JSON.stringify(state, null, 2));
  }

  await browser.close();
  server.close();
});
