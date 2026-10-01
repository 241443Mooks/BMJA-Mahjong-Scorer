// @vitest-environment happy-dom
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { renderToStaticMarkup } from 'react-dom/server';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { HandScorer } from './App';
import { createBmjaGame } from './game/game';
import { applyHandScorerResult, createHandScorerContext } from './game/hand-scorer-handoff';
import { BMJA_PROFILE_REF, OUTSIDE_THE_BOX_PROFILE_REF } from './game/ruleset';
import { BUZZARD_2000_PROFILE_REF } from './game/buzzard-2000';
import { mapCurrentClassicalScoreBreakdown } from './rules-platform/current-runtime-compat';
import { getCurrentCompiledRulesRuntime, initialiseCurrentRulesRuntimes } from './rules-platform/current-runtime-registry';
import { dragon, set, suited, wind, type MahjongHand } from './scoring';
import type { DetailedHandRecord } from './game/types';
import type { HandScorerResult } from './game/types';

const players = [{ id: 'east', name: 'East' }, { id: 'south', name: 'South' }, { id: 'west', name: 'West' }, { id: 'north', name: 'North' }];
const seats = { east: 'east' as const, south: 'south' as const, west: 'west' as const, north: 'north' as const };
let game: ReturnType<typeof createBmjaGame>;
const winning = { type: 'win' as const, winnerId: 'south' };
const contextFacts = { playerWind: 'south' as const, prevailingWind: 'east' as const, limit: 1000, handMode: 'normal' as const };
const buriedSets = [
  set('one', 'pung', suited('bamboo', 2), 'exposed'),
  set('two', 'pung', suited('bamboo', 3)),
  set('three', 'pung', suited('bamboo', 4)),
  set('four', 'pung', dragon('red')),
  set('pair', 'pair', suited('bamboo', 5)),
];
const buriedHand = (origin?: 'confirmed' | 'unknown', selected = false): MahjongHand => ({
  sets: buriedSets, bonusTiles: [], isWinner: true, winningMethod: 'discard',
  ...(selected ? { winningTileProvenance: { tile: suited('bamboo', 2), target: { type: 'grouped-set' as const, setId: 'one' } }, winningTileEvidenceOrigin: origin ?? 'confirmed' as const } : origin ? { winningTileEvidenceOrigin: origin } : {}),
});
const recordFor = (hand: MahjongHand, profile = BMJA_PROFILE_REF): DetailedHandRecord => {
  const compiled = getCurrentCompiledRulesRuntime(profile);
  if (compiled.grammar !== 'classical-points-doubles') throw new Error('Expected Classical runtime');
  const result = compiled.runtime.scoreHand({ evidence: hand, context: contextFacts });
  const breakdown = mapCurrentClassicalScoreBreakdown(result);
  return { source: 'detailed-scorer', hand, context: contextFacts, breakdown, finalScore: breakdown.finalScore };
};
const scorerContext = (hand: MahjongHand, profile = BMJA_PROFILE_REF) => createHandScorerContext(game, 'south', winning, recordFor(hand, profile));
const renderScorer = (context: ReturnType<typeof scorerContext>, onClose = vi.fn()) => renderToStaticMarkup(
  <HandScorer context={context} onClose={onClose} standaloneHand={false} standaloneRulesProfile={BMJA_PROFILE_REF} onStandaloneRulesProfileChange={vi.fn()} />,
);
const MCR_PROFILE = { id: 'mcr-wmo-2006', version: '0.1' };

describe('issue 426 winning-tile evidence integration', () => {
  beforeAll(async () => { await initialiseCurrentRulesRuntimes(); game = createBmjaGame(players, seats); });

  it('omits the question for an ordinary completed hand with no tile-sensitive result', () => {
    const ordinary: MahjongHand = { sets: [set('a', 'pung', suited('characters', 2)), set('b', 'pung', suited('circles', 4)), set('c', 'pung', suited('bamboo', 7)), set('d', 'pung', dragon('red')), set('pair', 'pair', suited('characters', 9))], bonusTiles: [], isWinner: true, winningMethod: 'wall' };
    expect(renderScorer(scorerContext(ordinary))).not.toContain('data-testid="button-winning-tile-');
  });

  it('keeps inherited fields read-only and exposes material questions in mobile Hand context', () => {
    const html = renderScorer(scorerContext(buriedHand()));
    expect(html).toContain('data-testid="mobile-hand-context"');
    expect(html).toContain('data-testid="mobile-inherited-context"');
    expect(html).toContain('inherited from game');
    expect(html).toContain('data-testid="mobile-winner-evidence"');
    expect(html).toContain('How did this hand win?');
    expect(html).toContain('data-testid="select-winning-method"');
  });

  it('resolves Club Rules material winning method from mobile context and enables Apply', async () => {
    vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
    const previousGame = game;
    game = createBmjaGame(players, seats, undefined, 'full-game', OUTSIDE_THE_BOX_PROFILE_REF);
    const clubHand: MahjongHand = {
      sets: [set('pung', 'pung', suited('bamboo', 2)), set('chow', 'chow', suited('characters', 1)), set('dragon', 'pung', dragon('red')),
        set('wind', 'pung', wind('east')), set('pair', 'pair', suited('circles', 5))],
      bonusTiles: [], isWinner: true,
    };
    let applied: HandScorerResult | undefined;
    const container = document.createElement('div'); document.body.append(container);
    const root = createRoot(container);
    await act(async () => root.render(<HandScorer context={scorerContext(clubHand, OUTSIDE_THE_BOX_PROFILE_REF)} onClose={(result) => { applied = result; }} standaloneHand={false} standaloneRulesProfile={OUTSIDE_THE_BOX_PROFILE_REF} onStandaloneRulesProfileChange={vi.fn()} />));
    const click = async (element: Element | null) => { expect(element).not.toBeNull(); await act(async () => element!.dispatchEvent(new MouseEvent('click', { bubbles: true }))); };
    try {
      expect(container.querySelector('[data-testid="mobile-inherited-context"]')?.textContent).toContain('Club');
      const method = container.querySelector<HTMLSelectElement>('[data-testid="select-winning-method"]');
      expect(method).not.toBeNull();
      expect(container.querySelector('[data-testid="conservative-score-notice-mobile"]')?.textContent).toContain('Winning method');
      expect(container.querySelector('[data-testid="apply-score-evidence-needed"]')?.textContent).toContain('Winning method');
      expect(container.querySelector<HTMLButtonElement>('[data-testid="button-apply-score-mobile"]')?.disabled).toBe(true);
      await act(async () => { method!.value = 'wall'; method!.dispatchEvent(new Event('change', { bubbles: true })); });
      for (const selector of ['[data-testid="button-discard-answer-no"]', '[data-testid="button-replacement-answer-no"]', '[data-testid="original-call-no"]', '[data-testid="standing-hand-no"]', '[data-testid="only-possible-tile-no"]', '[data-testid="east-thirteenth-no"]']) {
        const answer = container.querySelector<HTMLButtonElement>(selector);
        if (answer) await click(answer);
      }
      expect(container.querySelector('[data-testid="apply-score-evidence-needed"]')).toBeNull();
      expect(container.querySelector('[data-testid="current-score-value"]')).not.toBeNull();
      const apply = container.querySelector<HTMLButtonElement>('[data-testid="button-apply-score-mobile"]');
      expect(apply?.disabled).toBe(false);
      await click(apply ?? null);
      expect(applied?.grammar).toBe('classical-points-doubles');
    } finally {
      await act(async () => root.unmount()); container.remove(); game = previousGame; vi.unstubAllGlobals();
    }
  });

  it('renders the question for a real tile-sensitive BMJA winner', () => {
    expect(renderScorer(scorerContext(buriedHand()))).toContain('Which tile completed Mah Jong?');
  });

  it('shows Original Call selection clearly and keeps its help disclosure presentation-only', async () => {
    vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
    const container = document.createElement('div'); document.body.append(container);
    const root = createRoot(container);
    await act(async () => root.render(<HandScorer context={scorerContext(buriedHand())} onClose={vi.fn()} standaloneHand={false} standaloneRulesProfile={BMJA_PROFILE_REF} onStandaloneRulesProfileChange={vi.fn()} />));
    const click = async (element: Element | null) => { expect(element).not.toBeNull(); await act(async () => element!.dispatchEvent(new MouseEvent('click', { bubbles: true }))); };
    const choices = ['yes', 'no', 'unknown'] as const;
    const scoreBeforeHelp = container.querySelector('[data-testid="current-score-value"]')?.textContent;
    const uncertaintyBeforeHelp = container.querySelector('[data-testid="conservative-score-notice"]')?.textContent;
    try {
      const help = container.querySelector<HTMLDetailsElement>('[data-testid="original-call-help"]');
      expect(help?.open).toBe(false);
      expect(help?.querySelector('summary')?.getAttribute('aria-label')).toBe('What is Original Call?');
      await click(help?.querySelector('summary') ?? null);
      expect(help?.open).toBe(true);
      expect(help?.textContent).toContain('What is Original Call?');
      expect(help?.textContent).toContain('You were already one tile away from Mahjong after your first discard, and your hand then stayed unchanged until you went Mahjong.');
      expect(container.querySelector('[data-testid="current-score-value"]')?.textContent).toBe(scoreBeforeHelp);
      expect(container.querySelector('[data-testid="conservative-score-notice"]')?.textContent).toBe(uncertaintyBeforeHelp);
      await click(help?.querySelector('summary') ?? null);
      expect(help?.open).toBe(false);
      expect(container.querySelector('[data-testid="current-score-value"]')?.textContent).toBe(scoreBeforeHelp);
      expect(container.querySelector('[data-testid="conservative-score-notice"]')?.textContent).toBe(uncertaintyBeforeHelp);
      for (const selected of choices) {
        await click(container.querySelector(`[data-testid="original-call-${selected}"]`));
        const pressed = choices.filter((value) => container.querySelector<HTMLButtonElement>(`[data-testid="original-call-${value}"]`)?.getAttribute('aria-pressed') === 'true');
        expect(pressed).toEqual([selected]);
        const selectedButton = container.querySelector<HTMLButtonElement>(`[data-testid="original-call-${selected}"]`);
        expect(selectedButton?.className).toContain('bg-[#284d45]');
        expect(selectedButton?.className).toContain('text-[#f8f4e9]');
        for (const other of choices.filter((value) => value !== selected)) {
          const unselectedButton = container.querySelector<HTMLButtonElement>(`[data-testid="original-call-${other}"]`);
          expect(unselectedButton?.className).toContain('border-[#cfc3aa]');
          expect(unselectedButton?.className).not.toContain('bg-[#284d45]');
        }
      }
    } finally {
      await act(async () => root.unmount()); container.remove(); vi.unstubAllGlobals();
    }
  });

  it('leaves MCR on its existing evidence and result path without a Classical tile question', () => {
    const html = renderToStaticMarkup(<HandScorer context={null} onClose={vi.fn()} standaloneHand standaloneRulesProfile={MCR_PROFILE} onStandaloneRulesProfileChange={vi.fn()} />);
    expect(html).toContain('data-testid="mcr-evidence-controls"');
    expect(html).toContain('data-testid="mcr-score-result"');
    expect(html).not.toContain('Which tile completed Mah Jong?');
  });

  it('keeps standalone winds concrete and defaults the prevailing wind to East', async () => {
    vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
    const container = document.createElement('div'); document.body.append(container);
    const root = createRoot(container);
    await act(async () => root.render(<HandScorer context={null} onClose={vi.fn()} standaloneHand standaloneRulesProfile={BMJA_PROFILE_REF} onStandaloneRulesProfileChange={vi.fn()} />));
    try {
      const playerWind = container.querySelector<HTMLSelectElement>('[data-testid="select-player-wind"]');
      const prevailingWind = container.querySelector<HTMLSelectElement>('[data-testid="select-prevailing-wind"]');
      expect(playerWind?.value).toBe('east');
      expect(prevailingWind?.value).toBe('east');
      for (const select of [playerWind, prevailingWind]) {
        expect(Array.from(select?.options ?? []).map(({ value }) => value)).toEqual(['east', 'south', 'west', 'north']);
      }
    } finally {
      await act(async () => root.unmount()); container.remove(); vi.unstubAllGlobals();
    }
  });

  it('keeps explicit uncertainty unknown and applies/reopens without a guessed provenance', async () => {
    vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
    let appliedResult: HandScorerResult | undefined;
    const onClose = (result?: HandScorerResult) => { appliedResult = result; };
    const container = document.createElement('div'); document.body.append(container);
    const root = createRoot(container);
    await act(async () => root.render(<HandScorer context={scorerContext(buriedHand())} onClose={onClose} standaloneHand={false} standaloneRulesProfile={BMJA_PROFILE_REF} onStandaloneRulesProfileChange={vi.fn()} />));
    const click = async (element: Element | null) => { expect(element).not.toBeNull(); await act(async () => element!.dispatchEvent(new MouseEvent('click', { bubbles: true }))); };
    try {
      await click(container.querySelector('[data-testid="button-winning-tile-unknown"]'));
      for (const selector of ['[data-testid="button-discard-answer-no"]', '[data-testid="button-replacement-answer-no"]', '[data-testid="standing-hand-no"]', '[data-testid="only-possible-tile-no"]', '[data-testid="east-thirteenth-no"]', '[data-testid="original-call-no"]']) {
        const answer = container.querySelector(selector);
        if (answer) await click(answer);
      }
      const winningMethod = container.querySelector<HTMLSelectElement>('[data-testid="select-winning-method"]');
      if (winningMethod) await act(async () => { winningMethod.value = 'wall'; winningMethod.dispatchEvent(new Event('change', { bubbles: true })); });
      await click(container.querySelector('[data-testid="button-apply-score-mobile"]'));
      const result = appliedResult;
      expect(result?.grammar).toBe('classical-points-doubles');
      if (result?.grammar !== 'classical-points-doubles') throw new Error('Expected an applied Classical hand');
      expect(result.detailedHand.hand).toMatchObject({ winningTileEvidenceOrigin: 'unknown' });
      expect(result.detailedHand.hand.winningTileProvenance).toBeUndefined();
      expect(result.detailedHand.breakdown.specialHands.find(({ id }) => id === 'buried-treasure')?.matched).toBe(false);
      const applied = applyHandScorerResult(game, { scores: {}, scoreRecords: {} }, winning, result).draft.scoreRecords.south;
      if (applied?.source !== 'detailed-scorer') throw new Error('Expected persisted detailed hand');
      const reopened = createHandScorerContext(game, 'south', winning, applied);
      expect(reopened.detailedHand?.hand.winningTileEvidenceOrigin).toBe('unknown');
      expect(reopened.detailedHand?.hand.winningTileProvenance).toBeUndefined();
    } finally {
      await act(async () => root.unmount()); container.remove(); vi.unstubAllGlobals();
    }
  });

  it('keeps a confirmed tile and material-fact answers through Apply/reopen', async () => {
    vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
    let appliedResult: HandScorerResult | undefined;
    const onClose = (result?: HandScorerResult) => { appliedResult = result; };
    const container = document.createElement('div'); document.body.append(container);
    const root = createRoot(container);
    await act(async () => root.render(<HandScorer context={scorerContext(buriedHand())} onClose={onClose} standaloneHand={false} standaloneRulesProfile={BMJA_PROFILE_REF} onStandaloneRulesProfileChange={vi.fn()} />));
    const click = async (element: Element | null) => { expect(element).not.toBeNull(); await act(async () => element!.dispatchEvent(new MouseEvent('click', { bubbles: true }))); };
    try {
      await click(container.querySelector('[data-testid="button-winning-tile-one-0"]'));
      const method = container.querySelector<HTMLSelectElement>('[data-testid="select-winning-method"]');
      if (method) await act(async () => { method.value = 'wall'; method.dispatchEvent(new Event('change', { bubbles: true })); });
      for (const selector of ['[data-testid="button-discard-answer-no"]', '[data-testid="button-replacement-answer-no"]', '[data-testid="standing-hand-no"]', '[data-testid="only-possible-tile-no"]', '[data-testid="east-thirteenth-no"]', '[data-testid="original-call-no"]']) {
        const answer = container.querySelector(selector);
        if (answer) await click(answer);
      }
      await click(container.querySelector('[data-testid="button-apply-score-mobile"]'));
      const result = appliedResult;
      expect(result?.grammar).toBe('classical-points-doubles');
      if (result?.grammar !== 'classical-points-doubles') throw new Error('Expected an applied Classical hand');
      expect(result.detailedHand.hand.winningTileEvidenceOrigin).toBe('confirmed');
      expect(result.detailedHand.hand.winningTileProvenance).toEqual({ tile: suited('bamboo', 2), target: { type: 'grouped-set', setId: 'one' } });
      const applied = applyHandScorerResult(game, { scores: {}, scoreRecords: {} }, winning, result).draft.scoreRecords.south;
      if (applied?.source !== 'detailed-scorer') throw new Error('Expected persisted detailed hand');
      expect(createHandScorerContext(game, 'south', winning, applied).detailedHand?.hand).toMatchObject({ winningTileEvidenceOrigin: 'confirmed', winningTileProvenance: { target: { setId: 'one' } } });
    } finally {
      await act(async () => root.unmount()); container.remove(); vi.unstubAllGlobals();
    }
  });

  it('shows one conservative result for unknown material facts, then accepts a confirmed No', async () => {
    vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
    let appliedResult: HandScorerResult | undefined;
    const onClose = (result?: HandScorerResult) => { appliedResult = result; };
    const container = document.createElement('div'); document.body.append(container);
    const root = createRoot(container);
    await act(async () => root.render(<HandScorer context={scorerContext(buriedHand())} onClose={onClose} standaloneHand={false} standaloneRulesProfile={BMJA_PROFILE_REF} onStandaloneRulesProfileChange={vi.fn()} />));
    const click = async (element: Element | null) => { expect(element).not.toBeNull(); await act(async () => element!.dispatchEvent(new MouseEvent('click', { bubbles: true }))); };
    const chooseAllMaterialFactsNo = async () => {
      const method = container.querySelector<HTMLSelectElement>('[data-testid="select-winning-method"]');
      if (method) await act(async () => { method.value = 'wall'; method.dispatchEvent(new Event('change', { bubbles: true })); });
      for (const selector of ['[data-testid="button-discard-answer-no"]', '[data-testid="button-replacement-answer-no"]', '[data-testid="standing-hand-no"]', '[data-testid="only-possible-tile-no"]', '[data-testid="east-thirteenth-no"]']) {
        for (let pass = 0; pass < 2; pass += 1) {
          const answer = container.querySelector(selector);
          if (answer) await click(answer);
        }
      }
    };
    try {
      expect(container.querySelector('[data-testid="current-score-value"]')).not.toBeNull();
      expect(container.querySelector('[data-testid="conservative-score-notice"]')?.textContent).toContain('conservative score');
      expect(container.querySelector('[data-testid^="button-apply-score"]')).not.toBeNull();
      expect(container.querySelector<HTMLButtonElement>('[data-testid="button-apply-score-mobile"]')?.disabled).toBe(true);
      await chooseAllMaterialFactsNo();

      const originalCallUnknown = container.querySelector('[data-testid="original-call-unknown"]');
      expect(originalCallUnknown).not.toBeNull();
      await click(originalCallUnknown);
      const methodWithTwoUnknowns = container.querySelector<HTMLSelectElement>('[data-testid="select-winning-method"]');
      if (methodWithTwoUnknowns) await act(async () => { methodWithTwoUnknowns.value = ''; methodWithTwoUnknowns.dispatchEvent(new Event('change', { bubbles: true })); });
      expect(container.querySelector('[data-testid="current-score-value"]')).not.toBeNull();
      expect(container.querySelector('[data-testid="conservative-score-notice"]')?.textContent).toContain('Winning method');
      expect(container.querySelector('[data-testid="conservative-score-notice"]')?.textContent).toContain('Original Call');
      expect(container.querySelector('[data-testid="conditional-score-result"]')).toBeNull();
      expect(container.querySelector<HTMLButtonElement>('[data-testid="button-apply-score-mobile"]')?.disabled).toBe(true);

      if (methodWithTwoUnknowns) await act(async () => { methodWithTwoUnknowns.value = 'wall'; methodWithTwoUnknowns.dispatchEvent(new Event('change', { bubbles: true })); });
      await click(container.querySelector('[data-testid="original-call-no"]'));
      expect(container.querySelector('[data-testid="current-score-value"]')).not.toBeNull();
      const applyButton = container.querySelector<HTMLButtonElement>('[data-testid="button-apply-score-mobile"]');
      expect(applyButton).not.toBeNull();
      expect(applyButton?.disabled).toBe(false);
      await click(applyButton ?? null);
      expect(appliedResult?.grammar).toBe('classical-points-doubles');
      if (appliedResult?.grammar !== 'classical-points-doubles') throw new Error('Expected an applied Classical hand');
      expect(appliedResult.detailedHand.hand.originalCall).toBe(false);
      expect(appliedResult.detailedHand.hand.classicalEvidenceOrigins?.originalCall).toBe('confirmed');
      for (const fact of ['standingHand', 'onlyPossibleWinningTile'] as const) {
        if (appliedResult.detailedHand.hand.classicalEvidenceOrigins?.[fact] === 'confirmed') {
          expect(appliedResult.detailedHand.hand.classicalEvidence?.[fact]).toBe(false);
        } else {
          expect(appliedResult.detailedHand.hand.classicalEvidence?.[fact]).toBeUndefined();
        }
      }
    } finally {
      await act(async () => root.unmount()); container.remove(); vi.unstubAllGlobals();
    }
  });

  it('keeps an absent material profile fact unresolved in a tracked game after mount', async () => {
    vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
    const previousGame = game;
    game = createBmjaGame(players, seats, undefined, 'full-game', BUZZARD_2000_PROFILE_REF);
    const handWithoutStandingEvidence: MahjongHand = {
      ...buriedHand(),
      winningMethod: 'wall',
      classicalEvidence: { onlyPossibleWinningTile: false },
      classicalEvidenceOrigins: { onlyPossibleWinningTile: 'confirmed' },
    };
    const container = document.createElement('div'); document.body.append(container);
    const root = createRoot(container);
    await act(async () => root.render(<HandScorer context={scorerContext(handWithoutStandingEvidence, BUZZARD_2000_PROFILE_REF)} onClose={vi.fn()} standaloneHand={false} standaloneRulesProfile={BUZZARD_2000_PROFILE_REF} onStandaloneRulesProfileChange={vi.fn()} />));
    const click = async (element: Element | null) => { expect(element).not.toBeNull(); await act(async () => element!.dispatchEvent(new MouseEvent('click', { bubbles: true }))); };
    try {
      expect(handWithoutStandingEvidence.classicalEvidence?.standingHand).toBeUndefined();
      expect(container.querySelector('[data-testid="standing-hand-no"]')).not.toBeNull();
      expect(container.querySelector('[data-testid="original-call-question"]')).toBeNull();
      expect(container.querySelector('[data-testid="current-score-value"]')).not.toBeNull();
      expect(container.querySelector<HTMLButtonElement>('[data-testid="button-apply-score-mobile"]')?.disabled).toBe(true);

      await click(container.querySelector('[data-testid="standing-hand-no"]'));
      expect(container.querySelector('[data-testid="current-score-value"]')).not.toBeNull();
      const applyButton = container.querySelector<HTMLButtonElement>('[data-testid="button-apply-score-mobile"]');
      expect(applyButton).not.toBeNull();
      expect(applyButton?.disabled).toBe(false);
    } finally {
      await act(async () => root.unmount()); container.remove(); game = previousGame; vi.unstubAllGlobals();
    }
  });
});
