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

  it('keeps the winner rest-tile editor hidden until deliberately invoked and resolves explicit groups with remaining tiles', async () => {
    vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
    const game = createBmjaGame([
      { id: 'bill', name: 'Bill' }, { id: 'jenn', name: 'Jenn' }, { id: 'ben', name: 'Ben' }, { id: 'jack', name: 'Jack' },
    ], { bill: 'east', jenn: 'south', ben: 'west', jack: 'north' });
    const context = createHandScorerContext(game, 'bill', { type: 'win', winnerId: 'bill' });
    const container = document.createElement('div'); document.body.append(container);
    const root = createRoot(container);
    await act(async () => root.render(<HandScorer context={context} onClose={vi.fn()} standaloneHand={false} standaloneRulesProfile={BMJA_PROFILE_REF} onStandaloneRulesProfileChange={vi.fn()} />));
    const change = async (testId: string, value: string) => act(async () => {
      const select = container.querySelector<HTMLSelectElement>(`[data-testid="${testId}"]`)!;
      select.value = value;
      select.dispatchEvent(new Event('change', { bubbles: true }));
    });
    const addGroup = async (kind: string, family: string, value: string) => {
      await change('select-working-set-type', kind);
      await change('select-working-family', family);
      await change('select-working-value', value);
      await act(async () => container.querySelector<HTMLButtonElement>('[data-testid="button-add-working-group"]')!.click());
    };
    try {
      await addGroup('pung', 'wind', 'east');
      await addGroup('pung', 'wind', 'south');
      await addGroup('pung', 'wind', 'west');
      await addGroup('pair', 'bamboo', '9');
      expect(container.querySelector('[data-testid="working-picker"]')).not.toBeNull();
      expect(container.textContent).toContain('Completed groups');
      expect(container.querySelector('[data-testid="hybrid-rest-tile-entry-start"]')).toBeNull();
      expect(container.querySelector('[data-testid="hybrid-rest-tile-entry"]')).toBeNull();
      expect(container.querySelectorAll('[data-testid="button-enter-remaining-tiles-individually"]')).toHaveLength(1);
      expect(container.querySelector('[data-testid="button-add-a-group"]')).toBeNull();
      expect(container.querySelector('[data-testid="button-add-tiles"]')).toBeNull();
      expect(container.querySelector('[data-testid="button-layout-special"]')).toBeNull();
      await act(async () => container.querySelector('[data-testid="button-enter-remaining-tiles-individually"]')!.dispatchEvent(new MouseEvent('click', { bubbles: true })));
      expect(container.querySelectorAll('[data-testid="hybrid-rest-tile-entry"]')).toHaveLength(1);
      const firstTile = container.querySelector('[data-testid="hybrid-rest-tile-entry"] button[aria-label^="Add "]');
      expect(firstTile).not.toBeNull();
      expect(firstTile?.hasAttribute('disabled')).toBe(false);
      await act(async () => container.querySelector<HTMLButtonElement>('[data-testid="mobile-button-suit-dragon"]')!.click());
      for (let count = 0; count < 3; count += 1) {
        const redDragon = container.querySelector<HTMLButtonElement>('[data-testid="hybrid-rest-tile-entry"] button[aria-label="Add Red Dragon"]');
        expect(redDragon?.hasAttribute('disabled')).toBe(false);
        await act(async () => redDragon!.click());
      }
      expect(container.querySelectorAll('[data-testid="hybrid-rest-tile-entry"]')).toHaveLength(1);
      expect(container.querySelector('[data-testid="hybrid-winner-resolution"]')).not.toBeNull();
      const resolution = container.querySelector('[data-testid="hybrid-winner-resolution"]')!;
      const candidate = resolution.querySelector<HTMLButtonElement>('button');
      if (candidate && candidate.textContent !== 'Exposed' && candidate.textContent !== 'Concealed') {
        await act(async () => candidate.click());
      }
      const concealed = Array.from(container.querySelectorAll<HTMLButtonElement>('[data-testid="hybrid-winner-resolution"] button')).find((button) => button.textContent === 'Concealed');
      if (concealed) await act(async () => concealed.click());
      expect(container.querySelector('[data-testid="hybrid-winner-resolution"]')?.textContent).toContain('How I read this hand');
      expect(container.querySelector('[data-testid="current-score-value"], [data-testid="conditional-score-result"], [data-testid="conditional-score-mobile"]')).not.toBeNull();
      expect(container.querySelector('#game-status-controls [data-testid="hybrid-rest-tile-entry"]')).toBeNull();
    } finally {
      await act(async () => root.unmount());
      container.remove();
    }
  });

  it('keeps a complete grouped winner in the normal hand flow with no rest-tile editor', async () => {
    vi.stubGlobal('IS_REACT_ACT_ENVIRONMENT', true);
    const container = document.createElement('div'); document.body.append(container);
    const root = createRoot(container);
    await act(async () => root.render(<HandScorer context={null} onClose={vi.fn()} standaloneHand standaloneRulesProfile={BMJA_PROFILE_REF} onStandaloneRulesProfileChange={vi.fn()} />));
    const change = async (testId: string, value: string) => act(async () => {
      const select = container.querySelector<HTMLSelectElement>(`[data-testid="${testId}"]`)!;
      select.value = value;
      select.dispatchEvent(new Event('change', { bubbles: true }));
    });
    const addGroup = async (kind: string, family: string, value: string) => {
      await change('select-working-set-type', kind);
      await change('select-working-family', family);
      await change('select-working-value', value);
      await act(async () => container.querySelector<HTMLButtonElement>('[data-testid="button-add-working-group"]')!.click());
    };
    try {
      await act(async () => container.querySelector<HTMLInputElement>('[data-testid="checkbox-is-winner"]')!.click());
      await addGroup('pung', 'characters', '1');
      await addGroup('pung', 'characters', '2');
      await addGroup('pung', 'characters', '3');
      await addGroup('chow', 'characters', '4');
      await addGroup('pair', 'circles', '1');

      expect(container.querySelector('[data-testid="working-picker"]')).not.toBeNull();
      expect(container.querySelector('[data-testid="hand-so-far"]')).not.toBeNull();
      expect(container.textContent).toContain('Flowers & seasons');
      expect(container.querySelector('#game-status-controls')).not.toBeNull();
      expect(container.querySelector('[data-testid="hybrid-rest-tile-entry-start"]')).toBeNull();
      expect(container.querySelector('[data-testid="hybrid-rest-tile-entry"]')).toBeNull();
      expect(container.querySelector('[data-testid="hybrid-winner-resolution"]')).toBeNull();
      expect(container.querySelector('[data-testid="button-enter-remaining-tiles-individually"]')).toBeNull();
      const groupPicker = container.querySelector('[data-testid="working-picker"] details');
      expect(groupPicker?.querySelector('summary')?.textContent).toContain('Pick visually instead');
      expect(groupPicker?.hasAttribute('open')).toBe(false);
      const status = container.querySelector('#game-status-controls')!;
      expect(status.querySelector('[data-testid="hybrid-rest-tile-entry"]')).toBeNull();
      expect(container.querySelector('[data-testid="current-score-value"], [data-testid="conditional-score-result"], [data-testid="conditional-score-mobile"]')).not.toBeNull();
    } finally {
      await act(async () => root.unmount());
      container.remove();
    }
  });
});
