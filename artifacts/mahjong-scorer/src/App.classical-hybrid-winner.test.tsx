// @vitest-environment happy-dom
import { afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { act } from 'react';
import { createRoot } from 'react-dom/client';
import { HandScorer } from './App';
import { createBmjaGame } from './game/game';
import { createHandScorerContext } from './game/hand-scorer-handoff';
import { BMJA_PROFILE_REF } from './game/ruleset';
import { initialiseCurrentRulesRuntimes } from './rules-platform/current-runtime-registry';

describe('Classical hybrid winner integration', () => {
  beforeAll(async () => initialiseCurrentRulesRuntimes());
  afterEach(() => vi.unstubAllGlobals());

  it('offers the rest-tile route to a game-owned winner and enters hybrid resolution on the first tile', async () => {
    vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
    const game = createBmjaGame([
      { id: 'bill', name: 'Bill' }, { id: 'jenn', name: 'Jenn' }, { id: 'ben', name: 'Ben' }, { id: 'jack', name: 'Jack' },
    ], { bill: 'east', jenn: 'south', ben: 'west', jack: 'north' });
    const context = createHandScorerContext(game, 'bill', { type: 'win', winnerId: 'bill' });
    const container = document.createElement('div'); document.body.append(container);
    const root = createRoot(container);
    await act(async () => root.render(<HandScorer context={context} onClose={vi.fn()} standaloneHand={false} standaloneRulesProfile={BMJA_PROFILE_REF} onStandaloneRulesProfileChange={vi.fn()} />));
    try {
      expect(container.querySelector('[data-testid="hybrid-rest-tile-entry-start"]')).not.toBeNull();
      const firstTile = container.querySelector('[data-testid="hybrid-rest-tile-entry-start"] button[aria-label^="Add "]');
      expect(firstTile).not.toBeNull();
      expect(firstTile?.hasAttribute('disabled')).toBe(false);
      await act(async () => firstTile!.dispatchEvent(new MouseEvent('click', { bubbles: true })));
      expect(container.querySelector('[data-testid="hybrid-rest-tile-entry"]')).not.toBeNull();
      expect(container.querySelector('[data-testid="hybrid-winner-resolution"]')).not.toBeNull();
    } finally {
      await act(async () => root.unmount());
      container.remove();
    }
  });
});
