import { spawn, spawnSync } from 'node:child_process';
import { access, mkdir, writeFile } from 'node:fs/promises';
import { constants as fsConstants } from 'node:fs';
import { createRequire } from 'node:module';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const VERSION = '1.55.0';
const PORT = Number(process.env.ATLAS_VERIFY_PORT ?? 5191);
const BASE_URL = process.env.ATLAS_VERIFY_URL ?? `http://127.0.0.1:${PORT}`;
const SCRIPT_DIR = path.dirname(fileURLToPath(import.meta.url));
const APP_DIR = path.resolve(SCRIPT_DIR, '..');
const TOOL_DIR = path.join(os.tmpdir(), `bmja-mahjong-playwright-${VERSION}`);
const packageJson = path.join(TOOL_DIR, 'package.json');
const installed = path.join(TOOL_DIR, 'node_modules', 'playwright', 'package.json');
const output = path.join(os.tmpdir(), 'atlas-issue-358-mobile.png');

async function exists(file) {
  try { await access(file, fsConstants.F_OK); return true; } catch { return false; }
}

function run(command, args, cwd = APP_DIR) {
  const result = spawnSync(command, args, { cwd, stdio: 'inherit' });
  if (result.status !== 0) throw new Error(`${command} ${args.join(' ')} failed (${result.status}).`);
}

async function playwright() {
  if (!(await exists(installed))) {
    await mkdir(TOOL_DIR, { recursive: true });
    if (!(await exists(packageJson))) await writeFile(packageJson, JSON.stringify({ private: true }));
    run('npm', ['install', '--prefix', TOOL_DIR, '--no-save', '--no-package-lock', `playwright@${VERSION}`]);
  }
  const playwrightCli = path.join(TOOL_DIR, 'node_modules', 'playwright', 'cli.js');
  run(process.execPath, [playwrightCli, 'install', ...(process.env.CI ? ['--with-deps'] : []), 'chromium']);
  const requireTools = createRequire(packageJson);
  return requireTools('playwright');
}

function startServer() {
  return spawn('pnpm', ['exec', 'vite', '--config', 'vite.config.ts', '--host', '127.0.0.1', '--port', String(PORT), '--strictPort'], {
    cwd: APP_DIR,
    env: { ...process.env, PORT: String(PORT), BASE_PATH: '/' },
    stdio: ['ignore', 'inherit', 'inherit'],
  });
}

async function ready() {
  for (let i = 0; i < 80; i += 1) {
    try { if ((await fetch(BASE_URL)).ok) return; } catch { /* server starting */ }
    await new Promise((resolve) => setTimeout(resolve, 250));
  }
  throw new Error(`Vite did not start at ${BASE_URL}.`);
}

const assert = (condition, message) => { if (!condition) throw new Error(message); };

async function measureTop(page, url) {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
  await page.locator('main article').first().waitFor({ state: 'visible', timeout: 30000 });
  return page.locator('main article').first().evaluate((element) => Math.round(element.getBoundingClientRect().top));
}

let server;
let browser;
try {
  const { chromium } = await playwright();
  server = startServer();
  await ready();
  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 1 });
  await context.addInitScript(() => localStorage.setItem('mahjong-reference:preferred-rules-profile', JSON.stringify({ id: 'western-tm', version: '0.1' })));
  const page = await context.newPage();

  const afterTop = await measureTop(page, `${BASE_URL}/special-hands`);
  const geometry = await page.evaluate(() => ({ viewport: innerWidth, document: document.documentElement.scrollWidth }));
  assert(geometry.document <= geometry.viewport, `390px horizontal overflow: document ${geometry.document}px.`);
  const searchBox = page.getByRole('searchbox');
  const searchBounds = await searchBox.evaluate((element) => ({ search: element.parentElement.getBoundingClientRect().width, rulesTop: document.querySelector('select[aria-label="Rules"]').getBoundingClientRect().top }));
  searchBounds.filtersTop = await page.getByRole('button', { name: /^Filters/ }).evaluate((element) => element.getBoundingClientRect().top);
  assert(searchBounds.search > geometry.viewport * 0.8, `Search is not using a full-width row: ${JSON.stringify(searchBounds)}.`);
  assert(Math.abs(searchBounds.filtersTop - searchBounds.rulesTop) < 1, `Rules and Filters do not share their row: ${JSON.stringify(searchBounds)}.`);
  assert(afterTop < 590, `First card is too far below the page heading (${afterTop}px).`);
  await page.screenshot({ path: output, fullPage: true });

  const rules = page.getByRole('combobox', { name: 'Rules', exact: true });
  const originalPreference = await page.evaluate(() => localStorage.getItem('mahjong-reference:preferred-rules-profile'));
  const initialRules = await rules.locator('option').allTextContents();
  const profileOptions = initialRules.filter((text) => !text.startsWith('My rules') && !text.startsWith('Rules: All rules'));
  const expectedProfileOrder = ['Club - Bramhall · 2026', 'British / BMJA-style · 2008', 'Buzzard · 2000', 'Western — T&M · 1997'];
  assert(profileOptions[profileOptions.length - 1].includes('Western — T&M · 1997 (58)'), 'Western live Rules count missing.');
  assert(expectedProfileOrder.every((label, index) => profileOptions[index].startsWith(label)), `Rules options are not fully dated and newest first: ${JSON.stringify(profileOptions)}.`);
  await rules.selectOption('all');
  await page.getByRole('button', { name: /^Filters/ }).click();
  const pairs = page.getByRole('button', { name: /^Pairs,/ });
  await pairs.waitFor();
  const pairCount = Number((await pairs.getAttribute('aria-label')).match(/(\d+) matching/)[1]);
  await pairs.click();
  assert((await page.locator('[aria-live="polite"]').first().innerText()).includes(`${pairCount} hand`), 'Facet result count did not update live.');
  assert(await page.locator('details[open]').count() <= 1, 'Multiple Learn more disclosures are open.');

  await page.getByRole('searchbox').fill('Special pair-based hands');
  const pairEntry = page.locator('#atlas-entry-pair-hand-family');
  const profilePills = pairEntry.locator('[role="group"][aria-label^="Choose rules for"] button');
  const rulesOrder = await profilePills.allInnerTexts();
  const expectedCardOrder = expectedProfileOrder.filter((label) => rulesOrder.includes(label));
  assert(rulesOrder.join('|') === expectedCardOrder.join('|'), `Card rules choices are not fully dated and newest first: ${JSON.stringify(rulesOrder)}.`);
  const clubPill = pairEntry.getByRole('button', { name: 'Club - Bramhall · 2026' });
  await clubPill.click();
  assert((await profilePills.allInnerTexts()).join('|') === rulesOrder.join('|'), 'Selecting a rule reordered the card choices.');
  assert(await clubPill.getAttribute('aria-pressed') === 'true' && (await clubPill.getAttribute('class')).includes('bg-[#284d45]'), 'Selected rules did not receive primary emphasis.');
  const westernPill = pairEntry.getByRole('button', { name: 'Western — T&M · 1997' });
  await westernPill.click();
  assert((await profilePills.allInnerTexts()).join('|') === rulesOrder.join('|'), 'Restoring Western reordered the card choices.');
  const restoreHand = pairEntry.getByRole('combobox', { name: 'Hand name under these rules for Special pair-based hands' });
  const allPairHonours = await restoreHand.locator('option').evaluateAll((options) => options.find((option) => option.textContent.includes('All Pair Honours'))?.value);
  assert(allPairHonours, 'Western pair-hand selector lost All Pair Honours after changing rules.');
  await restoreHand.selectOption(allPairHonours);

  await rules.selectOption('western');
  const exact = pairEntry.getByRole('combobox', { name: 'Hand name under these rules for Special pair-based hands' });
  assert((await pairEntry.locator('figure figcaption').first().innerText()).includes('All Pair Honours'), 'Default Western lead example was not the first treatment example.');
  const heavenlyTwins = await exact.locator('option').evaluateAll((options) => options.find((option) => option.textContent.includes('Heavenly Twins'))?.value);
  assert(heavenlyTwins, 'Pair-hand family did not offer Heavenly Twins.');
  await exact.focus();
  await exact.selectOption(heavenlyTwins);
  assert(await exact.evaluate((element) => document.activeElement === element), 'Focus left the hand name selector after changing the hand.');
  const selectedSummary = pairEntry.locator('section[aria-label$="score and action"]').first();
  assert((await pairEntry.locator('figure figcaption').first().innerText()).includes('Heavenly Twins'), 'Lead example did not follow the Heavenly Twins selection.');
  assert(await selectedSummary.getByRole('link', { name: 'Score this hand →' }).getAttribute('href') === '/hand?atlasExample=example-heavenly-twins&rules=western&treatment=seven-pairs-one-suit', 'Scorer handoff did not follow the exact hand choice.');
  const selectedProfilePill = pairEntry.getByRole('button', { name: 'Western — T&M · 1997' });
  assert(await selectedProfilePill.getAttribute('aria-pressed') === 'true', 'Western profile was not selected.');

  const pairDisclosure = pairEntry.locator('summary').filter({ hasText: 'Learn more about Special pair-based hands' });
  await pairDisclosure.click();
  assert(await pairEntry.locator('details[open]').count() === 1, 'Learn more did not open.');
  await pairDisclosure.click();
  assert(await page.locator('details[open]').count() === 0, 'Learn more did not close when activated again.');
  assert(await pairDisclosure.evaluate((element) => document.activeElement === element), 'Focus did not remain on Learn more when closing it.');
  await page.getByRole('searchbox').fill('Wriggling / Wriggly Snake');
  const snake = page.locator('#atlas-entry-wriggling-snake-family');
  await snake.getByText('Learn more about Wriggling / Wriggly Snake').click();
  assert(await page.locator('details[open]').count() === 1, 'Opening a second learner did not close the first.');

  await rules.selectOption('club');
  const clubSnake = page.locator('#atlas-entry-wriggling-snake-family');
  const clubPills = clubSnake.locator('[role="group"][aria-label^="Choose rules for"] button');
  assert(await clubPills.count() === 1 && (await clubPills.first().innerText()).includes('Club - Bramhall · 2026'), 'Club filter did not constrain treatment visibility.');
  assert((await clubSnake.locator('figure figcaption').first().innerText()).includes('Wriggling Snake'), 'Default Club lead example was not the first treatment example.');
  const clubChoice = clubSnake.getByRole('combobox', { name: 'Hand name under these rules for Wriggling / Wriggly Snake' });
  const wrigglySnake = await clubChoice.locator('option').evaluateAll((options) => options.find((option) => option.textContent.includes('Wriggly Snake'))?.value);
  assert(wrigglySnake, 'Club Wriggling/Wriggly Snake did not offer the Wriggly Snake treatment.');
  await clubChoice.selectOption(wrigglySnake);
  assert(await clubSnake.locator('section[aria-label$="score and action"]').first().getByRole('link', { name: 'Score this hand →' }).getAttribute('href') === '/hand?atlasExample=example-wriggly-snake-any-pair&rules=club&treatment=wriggling-snake-any-pair', 'Club Wriggly Snake scorer handoff did not follow the exact hand choice.');
  assert((await clubSnake.locator('figure figcaption').first().innerText()).includes('Wriggly Snake'), 'Lead example did not follow the Club Wriggly Snake selection.');
  assert(await page.evaluate(() => localStorage.getItem('mahjong-reference:preferred-rules-profile')) === originalPreference, 'Browsing changed My Rules preference.');

  await page.goto(`${BASE_URL}/special-hands`);
  await page.evaluate(() => document.activeElement?.blur());
  const focusSequence = [];
  for (let i = 0; i < 100; i += 1) {
    await page.keyboard.press('Tab');
    const focus = await page.evaluate(() => {
      const element = document.activeElement;
      return { label: element?.getAttribute('aria-label') ?? element?.innerText?.trim() ?? '', tag: element?.tagName ?? '' };
    });
    focusSequence.push(focus.label);
    if (focus.label === 'Rules') break;
  }
  assert(focusSequence.includes('Rules'), 'Keyboard traversal did not reach Rules.');
  await page.keyboard.press('Space');
  await page.keyboard.press('ArrowDown');
  await page.keyboard.press('Enter');
  await page.keyboard.press('Tab');
  assert((await page.evaluate(() => document.activeElement?.innerText?.trim()))?.startsWith('Filters'), 'Focus did not advance sensibly from Rules to Filters.');
  await page.keyboard.press('Enter');
  let activeFacet;
  for (let i = 0; i < 20; i += 1) {
    await page.keyboard.press('Tab');
    activeFacet = await page.evaluate(() => ({ label: document.activeElement?.getAttribute('aria-label'), visible: !!document.activeElement?.getClientRects().length }));
    if (/^(Irregular Hand|Pairs|Honours|Terminals)/.test(activeFacet.label ?? '')) break;
  }
  assert(activeFacet.visible && /^(Irregular Hand|Pairs|Honours|Terminals)/.test(activeFacet.label ?? ''), `Keyboard did not enter the revealed facet controls: ${JSON.stringify(activeFacet)}`);
  await page.keyboard.press('Space');
  let treatmentButton;
  for (let i = 0; i < 50; i += 1) {
    await page.keyboard.press('Tab');
    treatmentButton = await page.evaluate(() => {
      const active = document.activeElement;
      return { label: active?.innerText?.trim() ?? '', group: active?.closest('[role="group"]')?.getAttribute('aria-label') ?? '' };
    });
    if (treatmentButton.group.startsWith('Choose rules for ')) break;
  }
  assert(treatmentButton?.group.startsWith('Choose rules for '), `Keyboard did not reach a rules choice: ${JSON.stringify(treatmentButton)}`);
  await page.keyboard.press('Space');
  let scorerLink;
  for (let i = 0; i < 20; i += 1) {
    await page.keyboard.press('Tab');
    scorerLink = await page.evaluate(() => ({ label: document.activeElement?.innerText?.trim() ?? '', tag: document.activeElement?.tagName ?? '' }));
    if (scorerLink.tag === 'A' && scorerLink.label.startsWith('Score this hand')) break;
  }
  assert(scorerLink?.tag === 'A' && scorerLink.label.startsWith('Score this hand'), `Keyboard did not reach the exact scorer action: ${JSON.stringify(scorerLink)}`);
  await page.keyboard.press('Tab');
  const learnMore = await page.evaluate(() => ({ label: document.activeElement?.innerText?.trim() ?? '', tag: document.activeElement?.tagName ?? '' }));
  assert(learnMore.tag === 'SUMMARY' && learnMore.label.startsWith('Learn more about'), `Focus did not continue from scorer action to Learn more: ${JSON.stringify(learnMore)}`);
  await page.keyboard.press('Enter');
  assert(await page.locator('details[open]').count() === 1, 'Keyboard did not open the learner disclosure.');
  await page.keyboard.press('Shift+Tab');
  const focusedCta = await page.evaluate(() => ({ text: document.activeElement?.textContent?.trim(), href: document.activeElement?.getAttribute('href') }));
  assert(focusedCta.href?.startsWith('/hand?'), `Focus did not return to scorer CTA after opening Learn more: ${JSON.stringify(focusedCta)}`);
  await page.keyboard.press('Enter');
  await page.waitForTimeout(250);
  assert(new URL(page.url()).pathname === '/hand', `Keyboard activation of scorer CTA did not hand off to the scorer: ${page.url()}`);

  console.log(JSON.stringify({ afterTop, viewport: geometry, searchBounds, preferenceUnchanged: true, pairHand: 'Heavenly Twins', clubSnake: 'Wriggly Snake', onlyOneDisclosure: true, keyboard: 'Rules → Filters → facet → hand choice → Learn more → scorer CTA passed', screenshot: output }, null, 2));
} finally {
  await browser?.close();
  if (server && server.exitCode === null) server.kill('SIGTERM');
}
