import { chromium } from 'playwright';

const base = process.env.BASE_URL ?? 'http://127.0.0.1:4173';
const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};

async function startGame(page) {
  await page.goto(`${base}/game`, { waitUntil: 'networkidle' });
  for (const [wind, name] of [['east', 'Alex'], ['south', 'Beth'], ['west', 'Chris'], ['north', 'Dana']]) {
    await page.getByTestId(`input-player-${wind}`).fill(name);
  }
  await page.getByTestId('button-start-game').click();
  await page.getByRole('heading', { name: 'Enter the table scores' }).waitFor();
}

async function enterStableManualScores(page, label) {
  const details = page.getByTestId('section-table-scores');
  const score1 = page.getByTestId('input-score-player-1');
  const score2 = page.getByTestId('input-score-player-2');
  const score3 = page.getByTestId('input-score-player-3');
  const score4 = page.getByTestId('input-score-player-4');

  await score1.fill('30');
  await score2.fill('40');
  await score3.fill('50');
  await score4.scrollIntoViewIfNeeded();
  await score4.focus();
  const beforeScroll = await page.evaluate(() => window.scrollY);
  const beforeRect = await score4.boundingBox();
  assert(beforeRect, `${label}: final score had no bounding box before typing`);

  for (const [digit, expected] of [['1', '1'], ['2', '12'], ['0', '120']]) {
    await page.keyboard.press(digit);
    await page.waitForTimeout(80);
    assert(await score4.inputValue() === expected, `${label}: final score value after ${digit} was not ${expected}`);
    assert(await details.getAttribute('open') !== null, `${label}: score-entry details collapsed while typing ${expected}`);
    assert(await page.evaluate(() => document.activeElement?.getAttribute('data-testid')) === 'input-score-player-4', `${label}: final score lost focus while typing ${expected}`);
    const rect = await score4.boundingBox();
    const viewport = await page.viewportSize();
    if (!(rect && viewport && rect.y + rect.height > 0 && rect.y < viewport.height)) {
      const diagnostics = await page.evaluate(() => ({
        scrollY: window.scrollY,
        active: document.activeElement?.getAttribute('data-testid'),
        innerHeight: window.innerHeight,
        visualViewportHeight: window.visualViewport?.height ?? null,
      }));
      throw new Error(`${label}: final score left viewport while typing ${expected}; rect=${JSON.stringify(rect)} diagnostics=${JSON.stringify(diagnostics)}`);
    }
    assert(Math.abs(rect.y - beforeRect.y) < 8, `${label}: final score moved ${Math.abs(rect.y - beforeRect.y)}px while typing ${expected}`);
  }

  const afterScroll = await page.evaluate(() => window.scrollY);
  const scrollDelta = Math.abs(afterScroll - beforeScroll);
  assert(scrollDelta < 20, `${label}: viewport jumped ${scrollDelta}px while entering final score`);

  // Completing the fourth score must not itself change context.
  assert(!(await page.getByTestId('section-settlement-stage').isVisible().catch(() => false)), `${label}: settlement appeared before deliberate review`);
  const review = page.getByTestId('button-review-settlement');
  assert(await review.isVisible(), `${label}: Review settlement action did not appear after scores became complete`);

  // Editing an existing score before review must stay equally calm.
  await score2.scrollIntoViewIfNeeded();
  await score2.focus();
  const editBefore = await score2.boundingBox();
  await page.keyboard.press(process.platform === 'darwin' ? 'Meta+A' : 'Control+A');
  await page.keyboard.press('7');
  await page.waitForTimeout(60);
  assert(await score2.inputValue() === '7', `${label}: first replacement digit was not retained`);
  assert(await details.getAttribute('open') !== null, `${label}: score-entry details collapsed while editing an existing score`);
  assert(await page.evaluate(() => document.activeElement?.getAttribute('data-testid')) === 'input-score-player-2', `${label}: edited score lost focus on first replacement digit`);
  await page.keyboard.press('5');
  await page.waitForTimeout(60);
  assert(await score2.inputValue() === '75', `${label}: edited multi-digit score was not completed`);
  const editAfter = await score2.boundingBox();
  assert(editBefore && editAfter && Math.abs(editAfter.y - editBefore.y) < 8, `${label}: edited score moved while typing`);
  assert(!(await page.getByTestId('section-settlement-stage').isVisible().catch(() => false)), `${label}: editing a score triggered settlement without review`);

  // Detailed scorer affordance remains present for each player.
  assert(await page.getByTestId('button-calculate-player-2').isVisible(), `${label}: detailed Calculate action disappeared`);

  // Settlement is shown only at a deliberate boundary.
  await review.scrollIntoViewIfNeeded();
  await review.click();
  await page.waitForTimeout(100);
  assert(await page.getByTestId('section-settlement-stage').isVisible(), `${label}: settlement did not appear after Review settlement`);

  // Progression remains a second explicit action.
  const confirm = page.getByTestId('button-confirm-hand');
  await confirm.scrollIntoViewIfNeeded();
  await confirm.click();
  await page.waitForTimeout(120);
  assert(await page.getByTestId('section-table-scores').getAttribute('open') !== null, `${label}: next hand score-entry workspace is not open`);
  assert(await page.getByTestId('input-score-player-1').inputValue() === '', `${label}: scores were not reset after explicit confirmation`);
  assert(!(await page.getByTestId('section-settlement-stage').isVisible().catch(() => false)), `${label}: settlement remained active after explicit confirmation advanced the hand`);

  console.log(`${label}: stable manual entry passed; scroll delta ${scrollDelta}px`);
}

const browser = await chromium.launch({ headless: true });

for (const [label, viewport] of [
  ['mobile 390x844', { width: 390, height: 844 }],
  ['tablet 768x900', { width: 768, height: 900 }],
  ['desktop 1280x900', { width: 1280, height: 900 }],
]) {
  const context = await browser.newContext({ viewport });
  const page = await context.newPage();
  await startGame(page);
  await enterStableManualScores(page, label);
  await context.close();
}

await browser.close();
console.log('#191 rendered acceptance passed');
