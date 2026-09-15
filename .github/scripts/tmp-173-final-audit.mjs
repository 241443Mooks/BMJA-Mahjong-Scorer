import { chromium } from 'playwright';
import { createRequire } from 'node:module';
import { execFileSync, execSync } from 'node:child_process';

const require = createRequire(import.meta.url);
const axePath = require.resolve('axe-core/axe.min.js');
const base = process.env.BASE_URL ?? 'http://127.0.0.1:4173';
const mode = process.argv[2] ?? 'regression';

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

const activeTestId = (page) => page.evaluate(() => document.activeElement?.getAttribute('data-testid'));
const activeLabel = (page) => page.evaluate(() => document.activeElement?.getAttribute('aria-label') ?? document.activeElement?.textContent?.trim());

async function enterCompleteScores(page, values = ['30', '40', '50', '120']) {
  for (let i = 0; i < values.length; i += 1) {
    await page.getByTestId(`input-score-player-${i + 1}`).fill(values[i]);
  }
}

async function runAxeRule(page, selector, rule, label) {
  await page.addScriptTag({ path: axePath });
  const result = await page.locator(selector).evaluate(async (element, requestedRule) => {
    return window.axe.run(element, { runOnly: { type: 'rule', values: [requestedRule] } });
  }, rule);
  assert(result.violations.length === 0, `${label}: axe ${rule} violation: ${JSON.stringify(result.violations)}`);
}

async function regressionAudit() {
  const browser = await chromium.launch({ headless: true });

  {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await context.newPage();
    await page.goto(`${base}/`, { waitUntil: 'networkidle' });
    const trigger = page.getByRole('button', { name: 'Open site navigation' });
    await trigger.click();
    const home = page.getByRole('link', { name: 'Home', exact: true });
    await home.focus();
    await page.keyboard.press('Escape');
    await page.waitForTimeout(80);
    assert(!(await home.isVisible().catch(() => false)), 'mobile navigation remained open after Escape');
    assert((await activeLabel(page)) === 'Open site navigation', `mobile navigation did not restore focus to trigger; active=${await activeLabel(page)}`);
    console.log('PASS #194 mobile Escape focus restoration');
    await context.close();
  }

  {
    const context = await browser.newContext({ viewport: { width: 1280, height: 900 } });
    const page = await context.newPage();
    await page.goto(`${base}/`, { waitUntil: 'networkidle' });
    const play = page.getByRole('button', { name: 'Play', exact: true });
    await play.click();
    const track = page.getByRole('link', { name: 'Track a game', exact: true });
    await track.focus();
    await page.keyboard.press('Escape');
    await page.waitForTimeout(80);
    assert(!(await track.isVisible().catch(() => false)), 'desktop Play menu remained open after Escape');
    assert((await activeLabel(page)) === 'Play', `desktop Play menu did not restore focus to trigger; active=${await activeLabel(page)}`);
    console.log('PASS #194 desktop Escape focus restoration');
    await context.close();
  }

  {
    const context = await browser.newContext({ viewport: { width: 390, height: 844 } });
    const page = await context.newPage();
    await page.goto(`${base}/game`, { waitUntil: 'networkidle' });

    const start = page.getByTestId('button-start-game');
    await start.focus();
    await start.click();
    const alert = page.getByRole('alert');
    await alert.waitFor();
    assert((await alert.textContent())?.includes('Enter a name for all four seats.'), 'setup validation alert text missing');
    assert((await activeTestId(page)) === 'button-start-game', `setup validation moved focus; active=${await activeTestId(page)}`);
    console.log('PASS #197 validation exposed as alert without focus move');

    for (const [wind, name] of [['east', 'Alex'], ['south', 'Beth'], ['west', 'Chris'], ['north', 'Dana']]) {
      await page.getByTestId(`input-player-${wind}`).fill(name);
    }
    await start.click();
    await page.getByRole('heading', { name: 'Enter the table scores' }).waitFor();

    const win = page.getByTestId('button-outcome-win');
    const draw = page.getByTestId('button-outcome-draw');
    assert((await win.getAttribute('aria-pressed')) === 'true', 'Mah Jong outcome not initially aria-pressed=true');
    assert((await draw.getAttribute('aria-pressed')) === 'false', 'Draw outcome not initially aria-pressed=false');
    assert((await win.locator('svg').count()) >= 1, 'selected Mah Jong outcome lacks visible non-colour check marker');
    await draw.click();
    assert((await draw.getAttribute('aria-pressed')) === 'true', 'Draw outcome did not become aria-pressed=true');
    assert((await win.getAttribute('aria-pressed')) === 'false', 'Mah Jong outcome did not become aria-pressed=false');
    assert((await draw.locator('svg').count()) >= 1, 'selected Draw outcome lacks visible non-colour check marker');
    await page.locator('summary').filter({ hasText: 'Edit current hand' }).click();
    await win.click();
    console.log('PASS #198 outcome selection exposes state and non-colour marker');

    await page.getByTestId('input-score-player-1').fill('30');
    await page.getByTestId('input-score-player-2').fill('40');
    await page.getByTestId('input-score-player-3').fill('50');
    const score4 = page.getByTestId('input-score-player-4');
    await score4.scrollIntoViewIfNeeded();
    await score4.focus();
    const before = await score4.boundingBox();
    assert(before, 'fourth score field has no initial geometry');
    for (const [digit, expected] of [['1', '1'], ['2', '12'], ['0', '120']]) {
      await page.keyboard.press(digit);
      await page.waitForTimeout(60);
      assert((await score4.inputValue()) === expected, `fourth score became ${await score4.inputValue()} instead of ${expected}`);
      assert((await activeTestId(page)) === 'input-score-player-4', `fourth score lost focus while typing ${expected}`);
      assert((await page.getByTestId('section-table-scores').getAttribute('open')) !== null, `score-entry disclosure collapsed while typing ${expected}`);
      assert(!(await page.getByTestId('section-settlement-stage').isVisible().catch(() => false)), `settlement appeared automatically while typing ${expected}`);
      const current = await score4.boundingBox();
      assert(current && Math.abs(current.y - before.y) < 8, `fourth score moved ${current ? Math.abs(current.y - before.y) : 'unknown'}px while typing ${expected}`);
    }
    const review = page.getByTestId('button-review-settlement');
    await review.waitFor();

    const score2 = page.getByTestId('input-score-player-2');
    await score2.focus();
    const editBefore = await score2.boundingBox();
    await page.keyboard.press('Control+A');
    await page.keyboard.press('7');
    await page.keyboard.press('5');
    await page.waitForTimeout(60);
    assert((await score2.inputValue()) === '75', 'editing an existing score did not preserve multi-digit entry');
    assert((await activeTestId(page)) === 'input-score-player-2', 'editing an existing score lost focus');
    const editAfter = await score2.boundingBox();
    assert(editBefore && editAfter && Math.abs(editAfter.y - editBefore.y) < 8, 'existing score field moved while editing');
    assert(await page.getByTestId('button-calculate-player-2').isVisible(), 'detailed Calculate action disappeared during manual editing');
    assert(!(await page.getByTestId('section-settlement-stage').isVisible().catch(() => false)), 'settlement appeared before deliberate Review settlement action');

    await review.click();
    await page.getByTestId('section-settlement-stage').waitFor();
    assert(await page.getByTestId('button-confirm-hand').isVisible(), 'Record hand and advance is missing after deliberate settlement review');
    console.log('PASS #201 / 3.2.2 manual score entry stays stable until deliberate review');

    const toolsSummary = page.locator('summary').filter({ hasText: 'Table tools' }).first();
    await toolsSummary.click();
    const startOver = page.getByTestId('button-start-over');
    let dismissSeen = false;
    page.once('dialog', async (dialog) => {
      dismissSeen = true;
      assert(dialog.type() === 'confirm', `Start over used ${dialog.type()} instead of confirm`);
      assert(dialog.message().includes('current saved game will be discarded'), `Unexpected Start over confirmation: ${dialog.message()}`);
      await dialog.dismiss();
    });
    await startOver.click();
    await page.waitForTimeout(80);
    assert(dismissSeen, 'Start over did not open confirmation dialog');
    assert(await page.getByTestId('section-settlement-stage').isVisible(), 'cancelling Start over discarded the active game');

    let acceptSeen = false;
    page.once('dialog', async (dialog) => {
      acceptSeen = true;
      await dialog.accept();
    });
    await startOver.click();
    await page.getByRole('heading', { name: 'Seat the table.' }).waitFor();
    assert(acceptSeen, 'accepted Start over did not use confirmation dialog');
    console.log('PASS #199 Start over confirmation preserves/cancels and discards/accepts correctly');

    for (const [wind, name] of [['east', 'Alex'], ['south', 'Beth'], ['west', 'Chris'], ['north', 'Dana']]) {
      await page.getByTestId(`input-player-${wind}`).fill(name);
    }
    await page.getByTestId('button-start-game').click();
    await page.getByRole('heading', { name: 'Enter the table scores' }).waitFor();
    await page.reload({ waitUntil: 'networkidle' });
    await page.getByTestId('recovered-game-conflict').waitFor();
    await runAxeRule(page, '[data-testid="recovered-game-conflict"]', 'color-contrast', '#195 recovered status at top');
    await page.getByTestId('details-game-ledger').scrollIntoViewIfNeeded();
    await page.waitForTimeout(80);
    await runAxeRule(page, '[data-testid="recovered-game-conflict"]', 'color-contrast', '#195 recovered status after scroll');
    console.log('PASS #195 recovered-status contrast at top and scrolled state');

    await context.close();
  }

  await browser.close();
  console.log('FINAL REGRESSION PASS: focus restoration, alerts/status, selected state, contrast, destructive confirmation and 3.2.2 are green. HandRecord tile alternatives are covered by the repository unit suite in this workflow.');
}

function shell(command) {
  return execSync(command, { encoding: 'utf8', shell: '/bin/bash', stdio: ['ignore', 'pipe', 'pipe'] }).trim();
}

function findChromiumWindow() {
  const commands = [
    "xdotool search --onlyvisible --class 'Chromium' | head -n 1",
    "xdotool search --onlyvisible --class 'chromium' | head -n 1",
    "xdotool search --onlyvisible --name 'Mahjong Reference' | head -n 1",
    "xdotool search --onlyvisible --name 'Chromium' | head -n 1",
  ];
  for (const command of commands) {
    try {
      const id = shell(command);
      if (id) return id;
    } catch {
    }
  }
  throw new Error('Could not locate the visible Chromium window for literal browser zoom');
}

async function metrics(page) {
  return page.evaluate(() => ({
    innerWidth: window.innerWidth,
    innerHeight: window.innerHeight,
    devicePixelRatio: window.devicePixelRatio,
    docClientWidth: document.documentElement.clientWidth,
    docScrollWidth: document.documentElement.scrollWidth,
    bodyScrollWidth: document.body?.scrollWidth ?? 0,
  }));
}

async function assertDocumentReflows(page, label) {
  const m = await metrics(page);
  const widest = Math.max(m.docScrollWidth, m.bodyScrollWidth);
  assert(widest <= m.docClientWidth + 4, `${label}: document horizontally overflows at 200% zoom: ${JSON.stringify(m)}`);
  const h1 = page.locator('h1').first();
  await h1.waitFor();
  const box = await h1.boundingBox();
  assert(box && box.x >= -2 && box.x + box.width <= m.innerWidth + 4, `${label}: primary heading is clipped horizontally at 200% zoom; box=${JSON.stringify(box)} metrics=${JSON.stringify(m)}`);
  console.log(`PASS 200% zoom ${label}: width=${m.innerWidth}, dpr=${m.devicePixelRatio}, no document-level horizontal overflow`);
}

async function zoomAudit() {
  const browser = await chromium.launch({
    headless: false,
    args: ['--window-size=1280,900', '--disable-features=TranslateUI'],
  });
  const context = await browser.newContext({ viewport: null });
  const page = await context.newPage();
  await page.goto(`${base}/`, { waitUntil: 'networkidle' });
  await page.waitForTimeout(250);

  const baseline = await metrics(page);
  const windowId = findChromiumWindow();
  execFileSync('xdotool', ['windowfocus', '--sync', windowId], { stdio: 'inherit' });

  let zoomed = baseline;
  let widthRatio = 1;
  for (let attempt = 0; attempt < 8 && widthRatio < 1.9; attempt += 1) {
    execFileSync('xdotool', ['key', '--window', windowId, '--clearmodifiers', 'ctrl+plus'], { stdio: 'inherit' });
    await page.waitForTimeout(180);
    zoomed = await metrics(page);
    widthRatio = baseline.innerWidth / zoomed.innerWidth;
    console.log(`browser zoom step ${attempt + 1}: baseline=${baseline.innerWidth}px current=${zoomed.innerWidth}px ratio=${widthRatio.toFixed(3)} dpr=${zoomed.devicePixelRatio}`);
  }

  assert(widthRatio >= 1.9 && widthRatio <= 2.15, `literal browser zoom did not reach approximately 200%; baseline=${JSON.stringify(baseline)} zoomed=${JSON.stringify(zoomed)} ratio=${widthRatio}`);
  console.log(`CONFIRMED literal Chromium browser zoom ≈200% by CSS viewport ratio ${widthRatio.toFixed(3)} (${baseline.innerWidth}px → ${zoomed.innerWidth}px)`);

  await assertDocumentReflows(page, '/');

  await page.goto(`${base}/help`, { waitUntil: 'networkidle' });
  await assertDocumentReflows(page, '/help');

  await page.goto(`${base}/hand`, { waitUntil: 'networkidle' });
  await assertDocumentReflows(page, '/hand');

  await page.goto(`${base}/game`, { waitUntil: 'networkidle' });
  await assertDocumentReflows(page, '/game setup');
  for (const [wind, name] of [['east', 'Alex'], ['south', 'Beth'], ['west', 'Chris'], ['north', 'Dana']]) {
    await page.getByTestId(`input-player-${wind}`).fill(name);
  }
  await page.getByTestId('button-start-game').click();
  await page.getByRole('heading', { name: 'Enter the table scores' }).waitFor();
  await assertDocumentReflows(page, '/game active score entry');
  await enterCompleteScores(page);
  assert(!(await page.getByTestId('section-settlement-stage').isVisible().catch(() => false)), '200% zoom game changed context automatically when scores became complete');
  const review = page.getByTestId('button-review-settlement');
  await review.scrollIntoViewIfNeeded();
  const reviewBox = await review.boundingBox();
  const activeMetrics = await metrics(page);
  assert(reviewBox && reviewBox.x >= -2 && reviewBox.x + reviewBox.width <= activeMetrics.innerWidth + 4, `Review settlement is clipped at 200% zoom: ${JSON.stringify(reviewBox)}`);
  await review.click();
  await page.getByTestId('section-settlement-stage').waitFor();
  await assertDocumentReflows(page, '/game settlement');
  const confirm = page.getByTestId('button-confirm-hand');
  await confirm.scrollIntoViewIfNeeded();
  const confirmBox = await confirm.boundingBox();
  const settlementMetrics = await metrics(page);
  assert(confirmBox && confirmBox.x >= -2 && confirmBox.x + confirmBox.width <= settlementMetrics.innerWidth + 4, `Record hand and advance is clipped at 200% zoom: ${JSON.stringify(confirmBox)}`);

  console.log('FINAL 200% BROWSER ZOOM SPOT-CHECK PASSED: /, /help, /hand, /game setup, active score entry and settlement retain content/function without document-level horizontal overflow.');
  await context.close();
  await browser.close();
}

if (mode === 'regression') {
  await regressionAudit();
} else if (mode === 'zoom') {
  await zoomAudit();
} else {
  throw new Error(`Unknown audit mode: ${mode}`);
}
