// @vitest-environment happy-dom
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { HandScorer } from './App';
import { createBmjaGame } from './game/game';
import { createHandScorerContext } from './game/hand-scorer-handoff';
import type { HandScorerResult } from './game';
import { BMJA_PROFILE_REF } from './game/ruleset';
import { initialiseCurrentRulesRuntimes } from './rules-platform/current-runtime-registry';

const renderScorer = async (context: ReturnType<typeof createHandScorerContext>, onClose: (result?: HandScorerResult) => void) => {
  const container = document.createElement('div');
  document.body.append(container);
  const root = createRoot(container);
  await act(async () => root.render(<HandScorer context={context} onClose={onClose} standaloneHand={false} standaloneRulesProfile={BMJA_PROFILE_REF} onStandaloneRulesProfileChange={vi.fn()} />));
  return { container, root };
};

const selectValue = async (select: HTMLSelectElement, value: string) => {
  await act(async () => {
    const setter = Object.getOwnPropertyDescriptor(HTMLSelectElement.prototype, 'value')?.set;
    setter?.call(select, value);
    select.dispatchEvent(new Event('change', { bubbles: true }));
  });
};

describe('Classical hybrid non-winner integration', () => {
  beforeAll(async () => initialiseCurrentRulesRuntimes());
  afterEach(() => vi.unstubAllGlobals());

  it('scores all-loose groups live, applies that exact hand and audit, then reopens to the same editable evidence and score', async () => {
    vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
    const game = createBmjaGame([
      { id: 'bill', name: 'Bill' }, { id: 'jenn', name: 'Jenn' }, { id: 'ben', name: 'Ben' }, { id: 'jack', name: 'Jack' },
    ], { bill: 'east', jenn: 'south', ben: 'west', jack: 'north' });
    const context = createHandScorerContext(game, 'bill', { type: 'draw' });
    const onClose = vi.fn<(result?: HandScorerResult) => void>();
    const first = await renderScorer(context, onClose);
    try {
      const addTiles = first.container.querySelector<HTMLButtonElement>('[data-testid="button-add-remaining-tiles-mode"]')!;
      await act(async () => addTiles.click());
      expect(first.container.querySelector('[data-testid="working-picker"] [data-testid="remaining-tile-picker-controls"]')).not.toBeNull();
      await selectValue(first.container.querySelector<HTMLSelectElement>('[data-testid="select-remaining-family"]')!, 'dragon');
      await selectValue(first.container.querySelector<HTMLSelectElement>('[data-testid="select-remaining-value"]')!, 'green');
      const addTile = first.container.querySelector<HTMLButtonElement>('[data-testid="button-add-remaining-tile"]')!;
      for (let index = 0; index < 3; index += 1) await act(async () => addTile.click());

      expect(first.container.querySelector('[data-testid="hybrid-inferred-score"]')?.textContent).toContain('pung Green Dragon');
      const liveScore = first.container.querySelector('[data-testid="current-score-value"]')?.textContent ?? '';
      expect(Number.parseInt(liveScore, 10)).toBeGreaterThan(0);

      await act(async () => first.container.querySelector<HTMLButtonElement>('[data-testid="button-apply-score-mobile"]')!.click());
      expect(onClose).toHaveBeenCalledTimes(1);
      const applied = onClose.mock.calls[0]?.[0];
      expect(applied?.grammar).toBe('classical-points-doubles');
      if (applied?.grammar !== 'classical-points-doubles') return;
      expect(applied.score).toBe(applied.detailedHand.breakdown.finalScore);
      expect(applied.detailedHand.hand.sets.some(({ kind, tile }) => kind === 'pung' && tile?.family === 'dragon' && tile.dragon === 'green')).toBe(true);
      expect(applied.detailedHand.interpretation?.c1.inferredGroups).toHaveLength(1);

      const reopenedContext = createHandScorerContext(game, 'bill', { type: 'draw' }, applied.detailedHand);
      const reopened = await renderScorer(reopenedContext, vi.fn());
      try {
        expect(reopened.container.querySelector('[data-testid="hybrid-inferred-score"]')?.textContent).toContain('pung Green Dragon');
        expect(reopened.container.textContent).toContain('Remaining tiles · 3 entered');
        expect(reopened.container.querySelector('[data-testid="card-set-1"]')).toBeNull();
        expect(reopened.container.querySelector('[data-testid="current-score-value"]')?.textContent).toContain(`${applied.score}pts`);
      } finally {
        await act(async () => reopened.root.unmount());
        reopened.container.remove();
      }
    } finally {
      await act(async () => first.root.unmount());
      first.container.remove();
    }
  });
});
