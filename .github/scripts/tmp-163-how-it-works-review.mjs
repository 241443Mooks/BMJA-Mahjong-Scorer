import { spawn } from 'node:child_process';
import { createRequire } from 'node:module';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const root = process.cwd();
const appDir = path.join(root, 'artifacts', 'mahjong-scorer');
const pagePath = path.join(appDir, 'src', 'home', 'HowItWorksPage.tsx');
const changelogPath = path.join(root, 'CHANGELOG.md');
const reviewDir = process.env.REVIEW_DIR ?? path.join(root, '.tmp-163-review');
const playwrightToolDir = process.env.PLAYWRIGHT_TOOL_DIR;

if (!playwrightToolDir) throw new Error('PLAYWRIGHT_TOOL_DIR is required.');

const pageSource = await readFile(pagePath, 'utf8');
const requiredStages = [
  'Choose the rules your table uses',
  'Enter the hand',
  'See the score',
  'See why',
  'See who pays whom',
  'Carry on to the next hand',
  'Look back at the game',
  'Keep a copy',
];
for (const stage of requiredStages) {
  const count = pageSource.split(stage).length - 1;
  if (count !== 1) throw new Error(`Expected exactly one How It Works stage “${stage}”; found ${count}.`);
}
for (const required of [
  "phaseOneHelpInstructions['start-game']",
  "phaseOneHelpInstructions['ordinary-hand']",
  'hand-score-result-mobile.png',
  'phaseOneHelpInstructions.disagreement',
  'game-settlement-preview-mobile.png',
  "phaseOneHelpInstructions['mix-score-entry']",
  'phaseOneHelpInstructions.settlement',
  "phaseOneHelpInstructions['save-game']",
]) {
  if (!pageSource.includes(required)) throw new Error(`Missing expected screenshot mapping: ${required}`);
}
for (const forbidden of ['<details', 'const evidenceModes', 'const trustPoints', 'Complete, partial or manual']) {
  if (pageSource.includes(forbidden)) throw new Error(`Legacy How It Works structure survived: ${forbidden}`);
}

const changelog = await readFile(changelogPath, 'utf8');
const entry = '- Rebuilt **How It Works** as an eight-stage visual table journey from choosing rules through scoring, settlement, continued play, game history and saving a record, using the canonical deterministic product screenshot library. [#163](https://github.com/241443Mooks/BMJA-Mahjong-Scorer/issues/163)\n';
if (!changelog.includes(entry)) {
  const marker = '### Changed\n\n';
  const count = changelog.split(marker).length - 1;
  if (count < 1) throw new Error('Could not find Unreleased Changed section in CHANGELOG.md.');
  await writeFile(changelogPath, changelog.replace(marker, marker + entry), 'utf8');
}

const requireFromTools = createRequire(path.join(playwrightToolDir, 'package.json'));
const { chromium } = requireFromTools('playwright');

const vite = spawn(
  'pnpm',
  ['exec', 'vite', '--config', 'vite.config.ts', '--host', '127.0.0.1', '--port', '4173'],
  {
    cwd: appDir,
    env: { ...process.env, PORT: '4173', BASE_PATH: '/' },
    stdio: ['ignore', 'pipe', 'pipe'],
  },
);
let viteOutput = '';
vite.stdout.on('data', (chunk) => { viteOutput += chunk.toString(); });
vite.stderr.on('data', (chunk) => { viteOutput += chunk.toString(); });

async function waitForServer() {
  for (let attempt = 0; attempt < 80; attempt += 1) {
    try {
      const response = await fetch('http://127.0.0.1:4173/how-it-works');
      if (response.ok) return;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`Vite did not become ready.\n${viteOutput}`);
}

await mkdir(reviewDir, { recursive: true });
let browser;
try {
  await waitForServer();
  browser = await chromium.launch({ headless: true });
  const viewports = [
    { name: 'mobile', width: 390, height: 844 },
    { name: 'tablet', width: 820, height: 1180 },
    { name: 'desktop', width: 1440, height: 1000 },
  ];

  for (const viewport of viewports) {
    const context = await browser.newContext({ viewport: { width: viewport.width, height: viewport.height } });
    const page = await context.newPage();
    await page.goto('http://127.0.0.1:4173/how-it-works', { waitUntil: 'networkidle' });

    const h1 = await page.locator('h1').first().textContent();
    if (h1?.trim() !== 'From one hand to the whole game.') {
      throw new Error(`${viewport.name}: unexpected hero heading: ${h1}`);
    }

    const renderedStages = (await page.locator('ol h3').allTextContents()).map((text) => text.trim());
    if (JSON.stringify(renderedStages) !== JSON.stringify(requiredStages)) {
      throw new Error(`${viewport.name}: stage order mismatch: ${JSON.stringify(renderedStages)}`);
    }

    const stepImages = page.locator('ol img');
    if (await stepImages.count() !== 8) throw new Error(`${viewport.name}: expected 8 journey screenshots.`);
    for (let index = 0; index < 8; index += 1) {
      const image = stepImages.nth(index);
      await image.waitFor({ state: 'visible' });
      const loaded = await image.evaluate((element) => element.complete && element.naturalWidth > 0 && element.naturalHeight > 0);
      if (!loaded) throw new Error(`${viewport.name}: journey screenshot ${index + 1} did not load.`);
    }

    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    if (overflow > 1) throw new Error(`${viewport.name}: page has ${overflow}px horizontal overflow.`);

    const steps = page.locator('ol > li');
    for (let index = 0; index < 8; index += 1) {
      const step = steps.nth(index);
      const headingBox = await step.locator('h3').boundingBox();
      const imageBox = await step.locator('img').boundingBox();
      if (!headingBox || !imageBox) throw new Error(`${viewport.name}: could not measure stage ${index + 1}.`);
      if (viewport.name === 'mobile') {
        if (!(headingBox.y < imageBox.y)) throw new Error(`mobile: text must appear before screenshot in stage ${index + 1}.`);
      } else {
        if (!(headingBox.x < imageBox.x)) throw new Error(`${viewport.name}: text should sit left of screenshot in stage ${index + 1}.`);
        if (imageBox.width < 300) throw new Error(`${viewport.name}: screenshot ${index + 1} is too narrow (${imageBox.width}px).`);
      }
    }

    await page.screenshot({ path: path.join(reviewDir, `how-it-works-${viewport.name}.png`), fullPage: true });
    await context.close();
  }
} finally {
  await browser?.close();
  vite.kill('SIGTERM');
}

console.log('How It Works rendered acceptance passed at mobile, tablet and desktop widths.');
