/**
 * StickerFit GitHub Presentation & Metadata Critic
 * Автоматизированный агент-критик оформления GitHub-репозитория и англоязычной презентации.
 */

import { execSync } from 'child_process';
import fs from 'fs';

async function runPresentationCritic() {
  console.log('🧐 Агент-критик: Запуск аудита оформления GitHub и англоязычной презентации...\n');

  let score = 100;
  const critiqueLog = [];

  // 1. Проверка настроек репозитория через GitHub CLI
  let repoData = null;
  try {
    const raw = execSync('gh repo view sefga/stickerfit --json description,homepageUrl,repositoryTopics', { encoding: 'utf8' });
    repoData = JSON.parse(raw);
  } catch (err) {
    critiqueLog.push({ section: 'GitHub API', status: 'WARN', msg: 'Не удалось получить данные через gh CLI: ' + err.message });
  }

  if (repoData) {
    console.log('📌 1. Аудит метаданных GitHub:');
    
    // Проверка описания (Description)
    const desc = repoData.description || '';
    const isEnglish = /^[A-Za-z0-9\s\.,\(\)🏷️\–\—\-:&]+$/.test(desc);
    if (!isEnglish) {
      score -= 20;
      critiqueLog.push({ section: 'GitHub Description', status: 'FAIL', msg: 'Описание содержит не-английские символы.' });
    } else {
      critiqueLog.push({ section: 'GitHub Description', status: 'PASS', msg: `Английское описание: "${desc}" (${desc.length} симв.)` });
    }

    if (!desc.includes('StickerFit')) {
      score -= 5;
      critiqueLog.push({ section: 'GitHub Description', status: 'FAIL', msg: 'Описание не содержит имя бренда StickerFit.' });
    } else {
      critiqueLog.push({ section: 'GitHub Description', status: 'PASS', msg: 'Бренд StickerFit присутствует.' });
    }

    // Проверка домашней страницы (Homepage URL)
    const hp = repoData.homepageUrl || '';
    if (hp === 'https://stickerfit.vercel.app') {
      critiqueLog.push({ section: 'Homepage URL', status: 'PASS', msg: `Канонический Production URL: ${hp}` });
    } else {
      score -= 10;
      critiqueLog.push({ section: 'Homepage URL', status: 'FAIL', msg: `Homepage не равен https://stickerfit.vercel.app (текущий: ${hp})` });
    }

    // Проверка смысловых тегов (Topics)
    const topics = repoData.repositoryTopics ? repoData.repositoryTopics.map(t => t.name) : [];
    console.log('\n📌 2. Аудит смысловых тегов (Topics):');
    console.log(`Всего тегов: ${topics.length}: [ ${topics.join(', ')} ]`);

    const bannedTechTags = ['cropperjs', 'vite', 'typescript'];
    const forbiddenFound = topics.filter(t => bannedTechTags.includes(t));
    if (forbiddenFound.length > 0) {
      score -= 10;
      critiqueLog.push({ section: 'Topics', status: 'FAIL', msg: `Найдены не-смысловые технические теги библиотек: ${forbiddenFound.join(', ')}` });
    } else {
      critiqueLog.push({ section: 'Topics', status: 'PASS', msg: 'Технические теги фреймворков успешно отфильтрованы.' });
    }

    const expectedSemantic = ['sticker-sheet', 'sticker-sheet-maker', 'sticker-generator', 'print-ready', 'label-maker', 'a4-stickers', 'vector-pdf'];
    const matchedSemantic = expectedSemantic.filter(t => topics.includes(t));
    if (matchedSemantic.length >= 5) {
      critiqueLog.push({ section: 'Topics', status: 'PASS', msg: `Найдено ${matchedSemantic.length} ключевых семантических тегов высокой ценности: ${matchedSemantic.join(', ')}` });
    } else {
      score -= 15;
      critiqueLog.push({ section: 'Topics', status: 'FAIL', msg: `Недостаточно целевых смысловых тегов (найдено: ${matchedSemantic.length}/5)` });
    }
  }

  // 3. Аудит package.json
  console.log('\n📌 3. Аудит package.json:');
  const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
  if (pkg.description && /^[A-Za-z0-9\s\.,\(\)🏷️\–\—\-:&]+$/.test(pkg.description)) {
    critiqueLog.push({ section: 'package.json', status: 'PASS', msg: `Английский description: "${pkg.description}"` });
  } else {
    score -= 10;
    critiqueLog.push({ section: 'package.json', status: 'FAIL', msg: 'package.json description не на английском языке.' });
  }

  // 4. Аудит index.html
  console.log('\n📌 4. Аудит index.html:');
  const html = fs.readFileSync('index.html', 'utf8');
  if (html.includes('<html lang="en">')) {
    critiqueLog.push({ section: 'index.html', status: 'PASS', msg: 'Базовый язык документа: lang="en".' });
  } else {
    score -= 10;
    critiqueLog.push({ section: 'index.html', status: 'FAIL', msg: 'index.html не содержит <html lang="en">.' });
  }

  // 5. Аудит README.md
  console.log('\n📌 5. Аудит README.md:');
  const readme = fs.readFileSync('README.md', 'utf8');
  const hasEnglishOverview = readme.includes('## 🇬🇧 English Overview');
  const hasEnglishWorkflow = readme.includes('Upload Sticker');
  const hasBadges = readme.includes('shields.io/badge');
  const hasScreenshots = readme.includes('docs/screenshots/desktop-ui.png');

  if (hasEnglishOverview && hasEnglishWorkflow && hasBadges && hasScreenshots) {
    critiqueLog.push({ section: 'README.md', status: 'PASS', msg: 'README содержит английский блок, workflow, бейджи и скриншоты.' });
  } else {
    score -= 15;
    critiqueLog.push({ section: 'README.md', status: 'FAIL', msg: 'README не прошел проверку полноты структуры.' });
  }

  // Итоговый отчет
  console.log('\n' + '═'.repeat(60));
  console.log(`🏆 ИТОГОВЫЙ РЕЙТИНГ ОФОРМЛЕНИЯ: ${score} / 100`);
  console.log('═'.repeat(60));
  for (const item of critiqueLog) {
    const icon = item.status === 'PASS' ? '✅' : item.status === 'WARN' ? '⚠️' : '❌';
    console.log(`${icon} [${item.section}] ${item.msg}`);
  }
  console.log('═'.repeat(60) + '\n');

  if (score < 85) {
    process.exit(1);
  }
}

runPresentationCritic().catch(err => {
  console.error(err);
  process.exit(1);
});
