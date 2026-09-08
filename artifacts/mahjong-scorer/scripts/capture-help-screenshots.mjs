import { spawn, spawnSync } from 'node:child_process';
import { access, mkdir, readdir, writeFile } from 'node:fs/promises';
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

const phaseOneScreenshotBases = [
  'game-setup',
  'game-table-score-entry',
  'hand-builder-ordinary',
  'partial-losing-hand',
  'hand-winning-tile',
  'hand-score-breakdown',
  'game-ledger-settlement',
  'print-save',
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
      detached: process.platform !== 'win32',
    },
  );
}

function stopVite(server) {
  if (server.exitCode !== null) return;
  try {
    if (process.platform !== 'win32' && server.pid) {
      process.kill(-server.pid, 'SIGTERM');
    } else {
      server.kill('SIGTERM');
    }
  } catch {
    try {
      server.kill('SIGTERM');
    } catch {
      // Runner/process cleanup will reap an already-stopped child.
    }
  }
  server.stdout?.destroy();
  server.stderr?.destroy();
  server.unref();
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

async function waitForVisuals(page, target, label) {
  await target.waitFor({ state: 'visible' });
  await page.evaluate(async () => {
    document.querySelectorAll('img').forEach((image) => {
      image.loading = 'eager';
    });
    if (document.fonts?.ready) {
      await document.fonts.ready;
    }
  });

  const images = target.locator('img');
  await images.evaluateAll(async (nodes, contextLabel) => {
    for (const image of nodes) {
      image.loading = 'eager';
      if (!image.complete) {
        await new Promise((resolve, reject) => {
          const timer = window.setTimeout(
            () => reject(new Error(`Timed out loading image in ${contextLabel}: ${image.currentSrc || image.src}`)),
            5000,
          );
          image.addEventListener('load', () => {
            window.clearTimeout(timer);
            resolve(undefined);
          }, { once: true });
          image.addEventListener('error', () => {
            window.clearTimeout(timer);
            reject(new Error(`Image failed to load in ${contextLabel}: ${image.currentSrc || image.src}`));
          }, { once: true });
        });
      }
      if (image.naturalWidth <= 0 || image.naturalHeight <= 0) {
        throw new Error(`Broken image in ${contextLabel}: ${image.currentSrc || image.src}`);
      }
    }
  }, label);

  await page.waitForTimeout(150);
}

async function captureElement(page, target, filename, label) {
  await target.scrollIntoViewIfNeeded();
  await waitForVisuals(page, target, label);
  await target.screenshot({
    path: path.join(OUTPUT_DIR, filename),
    animations: 'disabled',
  });
}

async function captureCombinedElements(page, targets, viewport, filename, label) {
  for (const target of targets) {
    await target.scrollIntoViewIfNeeded();
    await waitForVisuals(page, target, label);
  }

  const boxes = [];
  for (const target of targets) {
    const box = await target.boundingBox();
    if (!box) throw new Error(`Could not measure ${label}.`);
    boxes.push(box);
  }

  const padding = 12;
  const x = Math.max(0, Math.min(...boxes.map((box) => box.x)) - padding);
  const y = Math.max(0, Math.min(...boxes.map((box) => box.y)) - padding);
  const right = Math.min(
    viewport.width,
    Math.max(...boxes.map((box) => box.x + box.width)) + padding,
  );
  const bottom = Math.max(...boxes.map((box) => box.y + box.height)) + padding;

  await page.screenshot({
    path: path.join(OUTPUT_DIR, filename),
    clip: { x, y, width: right - x, height: bottom - y },
    animations: 'disabled',
  });
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

async function openExampleHand(browser, viewport) {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  page.setDefaultTimeout(10_000);
  await page.goto(`${BASE_URL}/hand`, { waitUntil: 'networkidle' });
  await page.getByTestId('button-load-example').click();
  return { context, page };
}

async function openDemoGame(browser, viewport) {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  page.setDefaultTimeout(10_000);
  await page.addInitScript(
    ({ key, snapshot }) => {
      window.localStorage.setItem(key, JSON.stringify(snapshot));
    },
    { key: storageKey, snapshot: demoSnapshot },
  );
  await page.goto(`${BASE_URL}/game`, { waitUntil: 'networkidle' });
  return { context, page };
}

async function captureGameSetup(browser, viewport) {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  page.setDefaultTimeout(10_000);
  await page.goto(`${BASE_URL}/game`, { waitUntil: 'networkidle' });

  await page.getByTestId('input-player-east').fill('Alex');
  await page.getByTestId('input-player-south').fill('Beth');
  await page.getByTestId('input-player-west').fill('Chris');
  await page.getByTestId('input-player-north').fill('Dee');

  const setupSection = page.getByTestId('button-start-game').locator('xpath=ancestor::section[1]');
  await captureElement(
    page,
    setupSection,
    `game-setup-${viewport.name}.png`,
    `${viewport.name} game setup`,
  );
  await context.close();
}

async function captureGameScoreEntry(browser, viewport) {
  const { context, page } = await openDemoGame(browser, viewport);
  await page.getByTestId('input-score-alex').fill('80');

  const scoreSection = page.getByTestId('section-table-scores');
  await captureElement(
    page,
    scoreSection,
    `game-table-score-entry-${viewport.name}.png`,
    `${viewport.name} game score entry`,
  );
  await context.close();
}

async function captureOrdinaryHand(browser, viewport) {
  const { context, page } = await openExampleHand(browser, viewport);

  await page.getByTestId('select-set-type-3').selectOption('kong');
  await page.getByTestId('card-set-3').click();
  await clickFirstEnabledTile(page, viewport);

  const arrangeSection = page
    .getByRole('heading', { name: 'Arrange the tiles' })
    .locator('xpath=ancestor::section[1]');
  await captureElement(
    page,
    arrangeSection,
    `hand-builder-ordinary-${viewport.name}.png`,
    `${viewport.name} ordinary hand builder`,
  );
  await context.close();
}

async function capturePartialLosingHand(browser, viewport) {
  const context = await browser.newContext({
    viewport: { width: viewport.width, height: viewport.height },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  page.setDefaultTimeout(10_000);
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
  await captureElement(
    page,
    arrangeSection,
    `partial-losing-hand-${viewport.name}.png`,
    `${viewport.name} partial losing hand`,
  );
  await context.close();
}

async function captureWinningTile(browser, viewport) {
  const { context, page } = await openExampleHand(browser, viewport);
  const winningTileSection = page
    .getByRole('heading', { name: 'The winning tile' })
    .locator('xpath=ancestor::section[1]');
  await captureElement(
    page,
    winningTileSection,
    `hand-winning-tile-${viewport.name}.png`,
    `${viewport.name} winning tile question`,
  );
  await context.close();
}

async function captureScoreBreakdown(browser, viewport) {
  const { context, page } = await openExampleHand(browser, viewport);
  const scoreCard = page.getByText('Current score', { exact: true }).locator('xpath=ancestor::section[1]');
  const patterns = page.getByTestId('detected-patterns');
  await patterns.waitFor({ state: 'visible' });
  await captureCombinedElements(
    page,
    [scoreCard, patterns],
    viewport,
    `hand-score-breakdown-${viewport.name}.png`,
    `${viewport.name} score breakdown`,
  );
  await context.close();
}

async function captureLedgerSettlement(browser, viewport) {
  const { context, page } = await openDemoGame(browser, viewport);
  const ledgerHeading = page.getByRole('heading', { name: 'Game ledger' });
  const ledgerSection = ledgerHeading.locator('xpath=ancestor::section[1]');
  await ledgerSection.locator('.game-ledger-summary').first().click();
  await captureElement(
    page,
    ledgerSection,
    `game-ledger-settlement-${viewport.name}.png`,
    `${viewport.name} game ledger settlement`,
  );
  await context.close();
}

async function capturePrintSave(browser, viewport) {
  const { context, page } = await openDemoGame(browser, viewport);
  const ledgerHeading = page.getByRole('heading', { name: 'Game ledger' });
  await ledgerHeading.waitFor({ state: 'visible' });
  await ledgerHeading.scrollIntoViewIfNeeded();

  const printSummary = page.locator('summary').filter({ hasText: 'Print / Save game' });
  await printSummary.click();
  const menu = page.getByTestId('button-print-full').locator('xpath=..');
  await menu.waitFor({ state: 'visible' });

  const ledgerHeader = ledgerHeading.locator('xpath=..');
  await waitForVisuals(page, ledgerHeader, `${viewport.name} print/save ledger header`);
  await waitForVisuals(page, menu, `${viewport.name} print/save menu`);

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

async function verifyPhaseOneFiles() {
  const filenames = new Set(await readdir(OUTPUT_DIR));
  const expected = phaseOneScreenshotBases.flatMap((base) =>
    viewports.map((viewport) => `${base}-${viewport.name}.png`),
  );
  const missing = expected.filter((filename) => !filenames.has(filename));
  if (missing.length > 0) {
    throw new Error(`Missing Phase 1 screenshots: ${missing.join(', ')}`);
  }
  console.log(`Verified all ${expected.length} Phase 1 screenshot files.`);
}

async function smokeTestHelp(browser) {
  const context = await browser.newContext({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 1,
  });
  const page = await context.newPage();
  page.setDefaultTimeout(10_000);
  await page.goto(`${BASE_URL}/help#start-game`, { waitUntil: 'networkidle' });

  const screenshotViewGroups = page.getByRole('group', { name: 'Screenshot view' });
  const groupCount = await screenshotViewGroups.count();
  if (groupCount !== 8) {
    throw new Error(`Expected 8 Phase 1 how-to blocks, found ${groupCount}.`);
  }

  const startCard = page.locator('#start-game');
  const startMobile = startCard.getByRole('button', { name: 'mobile' });
  if ((await startMobile.getAttribute('aria-pressed')) !== 'true') {
    throw new Error('Mobile screenshot view was not selected automatically at 390px.');
  }

  const startImage = startCard.locator('img[alt^="New game setup"]');
  const automaticSource = await startImage.evaluate((image) => image.currentSrc);
  if (!automaticSource.includes('game-setup-mobile.png')) {
    throw new Error(`Expected mobile responsive image, got ${automaticSource}.`);
  }

  await startCard.getByRole('button', { name: 'tablet' }).click();
  if (!(await startImage.getAttribute('src'))?.includes('game-setup-tablet.png')) {
    throw new Error('Tablet manual override did not replace the game-setup image.');
  }

  const tabletButtons = page.getByRole('button', { name: 'tablet' });
  if ((await tabletButtons.count()) !== 8) {
    throw new Error('Not every Phase 1 how-to exposes the Tablet override.');
  }
  for (let index = 0; index < await tabletButtons.count(); index += 1) {
    if ((await tabletButtons.nth(index).getAttribute('aria-pressed')) !== 'true') {
      throw new Error('Manual screenshot view did not sync across every Phase 1 Help block.');
    }
  }

  await page.reload({ waitUntil: 'networkidle' });
  const reloadedTablet = page.locator('#start-game').getByRole('button', { name: 'tablet' });
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
        console.log(`Capturing ${viewport.name} Phase 1 help screenshots…`);
        await captureGameSetup(browser, viewport);
        await captureGameScoreEntry(browser, viewport);
        await captureOrdinaryHand(browser, viewport);
        await capturePartialLosingHand(browser, viewport);
        await captureWinningTile(browser, viewport);
        await captureScoreBreakdown(browser, viewport);
        await captureLedgerSettlement(browser, viewport);
        await capturePrintSave(browser, viewport);
      }
      await verifyPhaseOneFiles();
      console.log('Checking responsive Help screenshot behaviour…');
      await smokeTestHelp(browser);
    } finally {
      await browser.close();
    }
  } finally {
    stopVite(server);
  }

  console.log(`Wrote Phase 1 help screenshots to ${OUTPUT_DIR}`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
