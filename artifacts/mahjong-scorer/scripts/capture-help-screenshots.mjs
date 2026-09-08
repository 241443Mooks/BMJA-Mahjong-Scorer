import { spawn, spawnSync } from 'node:child_process';
import { access, mkdir, writeFile } from 'node:fs/promises';
import { constants as fsConstants } from 'node:fs';
import { createRequire } from 'node:module';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const PLAYWRIGHT_VERSION = '1.55.0';
const CAPTURE_PORT = Number(process.env.SCREENSHOT_PORT ?? 4173);
const BASE_URL = process.env.SCREENSHOT_BASE_URL ?? `http://127.0.0.1:${CAPTURE_PORT}`;
const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const APP_DIR = path.resolve(SCRIPT_DIR, '..');
const OUTPUT_DIR = path.join(APP_DIR, 'public', 'help', 'screenshots');
const TOOL_DIR = path.join(os.tmpdir(), `bmja-mahjong-playwright-${PLAYWRIGHT_VERSION}`);

const viewports = [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'tablet', width: 820, height: 1180 },
  { name: 'desktop', width: 1440, height: 1000 },
];

const demoSnapshot = {
  version: 1,
  game: {
    setup: {
      players: [
        { id: 'alex', name: 'Alex' },
        { id: 'beth', name: 'Beth' },
        { id: 'chris', name: 'Chris' },
        { id: 'dee', name: 'Dee' },
      ],
      startingSeats: {
        alex: 'east',
        beth: 'south',
        chris: 'west',
        dee: 'north',
      },
      startingPrevailingWind: 'east',
      startingBalances: { alex: 0, beth: 0, chris: 0, dee: 0 },
      gameLength: 'one-round',
    },
    rounds: [
      {
        outcome: { type: 'win', winnerId: 'beth' },
        scores: { alex: 80, beth: 200, chris: 40, dee: 60 },
        scoreRecords: {
          alex: { source: 'manual', finalScore: 80 },
          beth: { source: 'manual', finalScore: 200 },
          chris: { source: 'manual', finalScore: 40 },
          dee: { source: 'manual', finalScore: 60 },
        },
      },
      {
        outcome: { type: 'win', winnerId: 'chris' },
        scores: { alex: 48, beth: 96, chris: 300, dee: 32 },
        scoreRecords: {
          alex: { source: 'manual', finalScore: 48 },
          beth: { source: 'manual', finalScore: 96 },
          chris: { source: 'manual', finalScore: 300 },
          dee: { source: 'manual', finalScore: 32 },
        },
      },
    ],
  },
  currentRound: {
    outcomeType: 'win',
    winnerId: 'chris',
    draft: { scores: {}, scoreRecords: {} },
  },
};

const storageKey = 'bmja-mahjong-scorer/game-snapshot';

async function exists(filePath) {
  try {
    await access(filePath, fsConstants.F_OK);
    return true;
  } catch {
    return false;
  }
}

function run(command, args, options = {}) {
  const result = spawnSync(command, args, {
    cwd: options.cwd ?? APP_DIR,
    env: { ...process.env, ...(options.env ?? {}) },
    stdio: 'inherit',
  });
  if (result.status !== 0) {
    throw new Error(`${command} ${args.join(' ')} failed with exit code ${result.status}.`);
  }
}

async function ensurePlaywright() {
  const packageJsonPath = path.join(TOOL_DIR, 'package.json');
  const installedPackageJson = path.join(TOOL_DIR, 'node_modules', 'playwright', 'package.json');

  if (!(await exists(installedPackageJson))) {
    await mkdir(TOOL_DIR, { recursive: true });
    if (!(await exists(packageJsonPath))) {
      await writeFile(packageJsonPath, JSON.stringify({ private: true }), 'utf8');
    }
    run('npm', [
      'install',
      '--prefix',
      TOOL_DIR,
      '--no-save',
      '--no-package-lock',
      `playwright@${PLAYWRIGHT_VERSION}`,
    ]);
  }

  const playwrightCli = path.join(TOOL_DIR, 'node_modules', 'playwright', 'cli.js');
  run(process.execPath, [
    playwrightCli,
    'install',
    ...(process.env.CI ? ['--with-deps'] : []),
    'chromium',
  ]);

  const requireFromTools = createRequire(packageJsonPath);
  return requireFromTools('playwright');
}

function startVite() {
  return spawn(
    'pnpm',
    [
      'exec',
      'vite',
      '--config',
      'vite.config.ts',
      '--host',
      '127.0.0.1',
      '--port',
      String(CAPTURE_PORT),
      '--strictPort',
    ],
    {
      cwd: APP_DIR,
      env: { ...process.env, PORT: String(CAPTURE_PORT), BASE_PATH: '/' },
      stdio: ['ignore', 'pipe', 'pipe'],
    },
  );
}

async function waitForServer(server) {
  let lastError = '';
  server.stderr?.on('data', (chunk) => {
    lastError = `${lastError}${chunk}`.slice(-4000);
  });

  for (let attempt = 0; attempt < 80; attempt += 1) {
    if (server.exitCode !== null) {
      throw new Error(`Vite exited before capture started.\n${lastError}`);
    }
    try {
      const response = await fetch(BASE_URL);
      if (response.ok) return;
    } catch {
      // Server is still starting.
    }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`Timed out waiting for ${BASE_URL}.\n${lastError}`);
}

async function waitForVisuals(page) {
  await page.evaluate(async () => {
    document.querySelectorAll('img').forEach((image) => {
      image.loading = 'eager';
    });
    if (document.fonts?.ready) {
      await document.fonts.ready;
    }
  });
  // Tile artwork is local and small. A bounded settle delay avoids hanging on
  // lazy images elsewhere on the page that are outside the capture area.
  await page.waitForTimeout(750);
}

async function clickFirstEnabledTile(page, viewport) {
  const prefix = viewport.name === 'mobile'
    ? 'mobile-button-add-tile-'
    : 'button-add-tile-';
  const buttons = page.locator(`[data-testid^="${prefix}"]`);
  await buttons.first().waitFor({ state: 'attached' });

  for (let index = 0; index < await buttons.count(); index += 1) {
    const button = buttons.nth(index);
    if ((await button.isVisible()) && (await button.isEnabled())) {
      await button.click();
      return;
    }
  }

  throw new Error(`No enabled ${viewport.name} tile button was visible.`);
}

async function capturePartialLosingHand(browser, viewport) {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  await page.goto(`${BASE_URL}/hand`, { waitUntil: 'networkidle' });

  const mobileWinner = page.getByTestId('mobile-checkbox-is-winner');
  if (await mobileWinner.isVisible().catch(() => false)) {
    if (await mobileWinner.isChecked()) await mobileWinner.uncheck();
  }

  await clickFirstEnabledTile(page, viewport);
  await page.getByTestId('button-add-set').click();
  await clickFirstEnabledTile(page, viewport);
  await page.getByTestId('button-select-remaining-tiles').click();
  await clickFirstEnabledTile(page, viewport);
  await clickFirstEnabledTile(page, viewport);

  const flowerOne = page.getByTestId('button-flower-1');
  if (await flowerOne.isVisible().catch(() => false)) await flowerOne.click();

  const arrangeSection = page
    .getByRole('heading', { name: 'Arrange the tiles' })
    .locator('xpath=ancestor::section[1]');
  await arrangeSection.scrollIntoViewIfNeeded();
  await waitForVisuals(page);

  await arrangeSection.screenshot({
    path: path.join(OUTPUT_DIR, `partial-losing-hand-${viewport.name}.png`),
    animations: 'disabled',
  });
  await context.close();
}

async function capturePrintSave(browser, viewport) {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  await page.addInitScript(
    ({ key, snapshot }) => {
      window.localStorage.setItem(key, JSON.stringify(snapshot));
    },
    { key: storageKey, snapshot: demoSnapshot },
  );

  await page.goto(`${BASE_URL}/game`, { waitUntil: 'networkidle' });
  const ledgerHeading = page.getByRole('heading', { name: 'Game ledger' });
  await ledgerHeading.waitFor({ state: 'visible' });
  await ledgerHeading.scrollIntoViewIfNeeded();

  const printSummary = page.locator('summary').filter({ hasText: 'Print / Save game' });
  await printSummary.click();
  const menu = page.getByTestId('button-print-full').locator('xpath=..');
  await menu.waitFor({ state: 'visible' });
  await waitForVisuals(page);

  const ledgerHeader = ledgerHeading.locator('xpath=..');
  const headerBox = await ledgerHeader.boundingBox();
  const menuBox = await menu.boundingBox();
  if (!headerBox || !menuBox) throw new Error('Could not measure the Print / Save capture area.');

  const padding = 12;
  const x = Math.max(0, Math.min(headerBox.x, menuBox.x) - padding);
  const y = Math.max(0, Math.min(headerBox.y, menuBox.y) - padding);
  const right = Math.min(
    viewport.width,
    Math.max(headerBox.x + headerBox.width, menuBox.x + menuBox.width) + padding,
  );
  const bottom = Math.max(headerBox.y + headerBox.height, menuBox.y + menuBox.height) + padding;

  await page.screenshot({
    path: path.join(OUTPUT_DIR, `print-save-${viewport.name}.png`),
    clip: { x, y, width: right - x, height: bottom - y },
    animations: 'disabled',
  });
  await context.close();
}

async function smokeTestHelp(browser) {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  await page.goto(`${BASE_URL}/help#partial-losing-hand`, { waitUntil: 'networkidle' });

  const partialCard = page.locator('#partial-losing-hand');
  const partialMobile = partialCard.getByRole('button', { name: 'mobile' });
  if ((await partialMobile.getAttribute('aria-pressed')) !== 'true') {
    throw new Error('Mobile screenshot view was not selected automatically at 390px.');
  }

  const partialImage = partialCard.locator('img[alt^="Partial losing hand"]');
  const automaticSource = await partialImage.evaluate((image) => image.currentSrc);
  if (!automaticSource.includes('partial-losing-hand-mobile.png')) {
    throw new Error(`Expected mobile responsive image, got ${automaticSource}.`);
  }

  await partialCard.getByRole('button', { name: 'tablet' }).click();
  if (!(await partialImage.getAttribute('src'))?.includes('partial-losing-hand-tablet.png')) {
    throw new Error('Tablet manual override did not replace the partial-hand image.');
  }

  const saveCard = page.locator('#save-game');
  const saveTablet = saveCard.getByRole('button', { name: 'tablet' });
  if ((await saveTablet.getAttribute('aria-pressed')) !== 'true') {
    throw new Error('Manual screenshot view did not sync to the second Help block.');
  }

  await page.reload({ waitUntil: 'networkidle' });
  const reloadedTablet = page.locator('#partial-losing-hand').getByRole('button', { name: 'tablet' });
  if ((await reloadedTablet.getAttribute('aria-pressed')) !== 'true') {
    throw new Error('Manual screenshot view did not persist for the browser session.');
  }

  await context.close();
}

async function main() {
  await mkdir(OUTPUT_DIR, { recursive: true });
  const { chromium } = await ensurePlaywright();
  const server = startVite();

  try {
    await waitForServer(server);
    const browser = await chromium.launch({ headless: true });
    try {
      for (const viewport of viewports) {
        console.log(`Capturing ${viewport.name} help screenshots…`);
        await capturePartialLosingHand(browser, viewport);
        await capturePrintSave(browser, viewport);
      }
      console.log('Checking responsive Help screenshot behaviour…');
      await smokeTestHelp(browser);
    } finally {
      await browser.close();
    }
  } finally {
    if (server.exitCode === null) server.kill('SIGTERM');
  }

  console.log(`Wrote help screenshots to ${OUTPUT_DIR}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
