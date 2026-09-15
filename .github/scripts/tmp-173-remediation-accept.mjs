import { chromium } from 'playwright';
import { createRequire } from 'node:module';
import fs from 'node:fs';
import path from 'node:path';

const require = createRequire(import.meta.url);
const axePath = require.resolve('axe-core/axe.min.js');
const base = process.env.BASE_URL ?? 'http://127.0.0.1:4173';
const repoRoot = process.env.REPO_ROOT;

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

async function contrastViolations(page) {
  await page.addScriptTag({ path: axePath });
  return page.evaluate(async () => {
    const result = await window.axe.run(document, {
      runOnly: { type: 'rule', values: ['color-contrast'] },
    });
    return result.violations.map((violation) => ({
      id: violation.id,
      nodes: violation.nodes.map((node) => node.target.join(' ')),
    }));
  });
}

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 390, height: 844 } });

// #194 mobile Escape restores the trigger.
await page.goto(`${base}/`, { waitUntil: 'networkidle' });
const mobileTrigger = page.getByRole('button', { name: 'Open site navigation' });
await mobileTrigger.focus();
await page.keyboard.press('Enter');
await page.getByRole('link', { name: 'Home', exact: true }).focus();
await page.keyboard.press('Escape');
await page.waitForTimeout(80);
assert(await mobileTrigger.getAttribute('aria-expanded') === 'false', 'mobile navigation did not close on Escape');
assert(await page.evaluate(() => document.activeElement?.getAttribute('aria-label')) === 'Open site navigation', 'mobile Escape did not restore focus to navigation trigger');

// #194 desktop Escape restores the owning group trigger.
await page.setViewportSize({ width: 1280, height: 900 });
await page.goto(`${base}/`, { waitUntil: 'networkidle' });
const playTrigger = page.getByRole('button', { name: 'Play', exact: true });
await playTrigger.focus();
await page.keyboard.press('Enter');
await page.getByRole('link', { name: 'Track a game', exact: true }).focus();
await page.keyboard.press('Escape');
await page.waitForTimeout(80);
assert(await playTrigger.getAttribute('aria-expanded') === 'false', 'desktop Play disclosure did not close on Escape');
assert(await page.evaluate(() => document.activeElement?.textContent?.trim()) === 'Play', 'desktop Escape did not restore focus to Play trigger');

// #197 setup validation is a programmatic alert without moving focus.
await page.goto(`${base}/game`, { waitUntil: 'networkidle' });
const startGame = page.getByTestId('button-start-game');
await startGame.focus();
await startGame.click();
const setupAlert = page.getByRole('alert');
assert((await setupAlert.textContent())?.includes('Enter a name for all four seats.'), 'setup validation is not exposed as an alert');
assert(await page.evaluate(() => document.activeElement?.getAttribute('data-testid')) === 'button-start-game', 'setup validation unexpectedly moved focus');

// Start a deterministic game.
for (const [wind, name] of [['east', 'Alex'], ['south', 'Beth'], ['west', 'Chris'], ['north', 'Dana']]) {
  await page.getByTestId(`input-player-${wind}`).fill(name);
}
await startGame.click();
await page.getByRole('heading', { name: 'Enter the table scores' }).waitFor();

// #198 selected outcome has programmatic state and a persistent non-colour check marker.
const win = page.getByTestId('button-outcome-win');
const draw = page.getByTestId('button-outcome-draw');
assert(await win.getAttribute('aria-pressed') === 'true', 'Mah Jong is not exposed as selected');
assert(await draw.getAttribute('aria-pressed') === 'false', 'Draw is incorrectly exposed as selected');
assert(await win.locator('svg').count() === 1, 'selected Mah Jong has no non-colour marker');
assert(await draw.locator('svg').count() === 0, 'unselected Draw unexpectedly has selected marker');
await draw.click();
assert(await win.getAttribute('aria-pressed') === 'false', 'Mah Jong state did not update after selecting Draw');
assert(await draw.getAttribute('aria-pressed') === 'true', 'Draw state did not update to selected');

// Re-open the entry details and switch back to a win for score/contrast checks.
const editCurrent = page.locator('summary').filter({ hasText: 'Edit current hand' }).first();
await editCurrent.click();
await win.click();
for (const [id, score] of [['player-1', '30'], ['player-2', '40'], ['player-3', '50'], ['player-4', '60']]) {
  await page.getByTestId(`input-score-${id}`).fill(score);
}
await page.getByTestId('section-settlement-stage').waitFor({ state: 'visible' });

// Reload to exercise the recovered-game sticky status, then sample contrast across scroll positions.
await page.reload({ waitUntil: 'networkidle' });
const recovered = page.getByTestId('recovered-game-conflict');
assert((await recovered.textContent())?.includes('Saved game recovered.'), 'recovered-game status not present after reload');
for (const target of ['top', 'settlement', 'ledger']) {
  if (target === 'top') await page.evaluate(() => window.scrollTo(0, 0));
  if (target === 'settlement') await page.getByTestId('section-settlement-stage').scrollIntoViewIfNeeded();
  if (target === 'ledger') await page.getByTestId('details-game-ledger').scrollIntoViewIfNeeded();
  await page.waitForTimeout(120);
  const violations = await contrastViolations(page);
  assert(violations.length === 0, `contrast violation at recovered-game ${target} position: ${JSON.stringify(violations)}`);
}

// #199 cancellation preserves the current game; confirmation discards it.
const tools = page.locator('summary').filter({ hasText: 'Table tools' }).first();
await tools.click();
let dismissedMessage = '';
page.once('dialog', async (dialog) => {
  dismissedMessage = dialog.message();
  await dialog.dismiss();
});
await page.getByTestId('button-start-over').click();
await page.waitForTimeout(80);
assert(dismissedMessage.includes('current saved game'), 'Start over confirmation does not explain the destructive effect');
assert(await page.getByTestId('section-settlement-stage').isVisible(), 'cancelling Start over did not preserve the active game');

let acceptedMessage = '';
page.once('dialog', async (dialog) => {
  acceptedMessage = dialog.message();
  await dialog.accept();
});
await page.getByTestId('button-start-over').click();
await page.getByRole('heading', { name: 'Seat the table.' }).waitFor();
assert(acceptedMessage.includes('current saved game'), 'confirmed Start over did not use the destructive confirmation');

// Static contract checks for #196/#197, complementary to the existing SSR HandRecord tests.
assert(repoRoot, 'REPO_ROOT was not provided');
const handSource = fs.readFileSync(path.join(repoRoot, 'artifacts/mahjong-scorer/src/game/HandRecord.tsx'), 'utf8');
assert(!handSource.includes('aria-label={winning ? `${artwork.label}, winning tile` : artwork.label}'), 'recorded tile still names a generic wrapper');
assert(handSource.includes('alt={winning ? `${artwork.label}, winning tile` : artwork.label}'), 'recorded tile image does not carry the accessible tile name');
const gameSource = fs.readFileSync(path.join(repoRoot, 'artifacts/mahjong-scorer/src/game/GameScorer.tsx'), 'utf8');
assert(gameSource.includes('role="alert" data-testid="preview-domain-error"'), 'preview domain error is not an alert');

console.log('WCAG #194-#199 rendered acceptance passed');
await browser.close();
