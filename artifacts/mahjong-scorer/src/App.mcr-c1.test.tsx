import { beforeAll, describe, expect, it, vi } from 'vitest';
import { renderToStaticMarkup } from 'react-dom/server';
import { HandScorer } from './App';
import { initialiseCurrentRulesRuntimes } from './rules-platform/current-runtime-registry';
import { RulesProfilePicker } from './game/RulesProfilePicker';
import { createGame } from './game/game';
import { createHandScorerContext } from './game/hand-scorer-handoff';
import { GameScorer } from './game/GameScorer';
import { saveGameRecoveryV2, type PersistedCurrentRoundV2 } from './game/persistence';
import { PREFERRED_RULES_PROFILE_STORAGE_KEY } from './game/preferred-rules-profile';
import { BMJA_PROFILE_REF } from './game/ruleset';

const mcrProfile = { id: 'mcr-wmo-2006', version: '0.1' };

describe('C1 shared standalone scorer workspace', () => {
  beforeAll(() => initialiseCurrentRulesRuntimes());

  it('keeps mobile picker grids, tile actions and internal tile strips shrinkable', () => {
    const html = renderToStaticMarkup(<HandScorer context={null} onClose={vi.fn()} standaloneHand standaloneRulesProfile={BMJA_PROFILE_REF} onStandaloneRulesProfileChange={vi.fn()} />);
    expect(html).toMatch(/data-testid="working-picker" class="min-w-0 /);
    expect(html).toContain('grid min-w-0 grid-cols-2 gap-2');
    expect(html).toContain('flex flex-wrap items-center justify-between gap-2');
    expect(html).toContain('mt-3 min-w-0 sm:hidden');
    expect(html).toContain('flex min-w-0 flex-1 items-center gap-2');
    expect(html).toMatch(/class="mt-3 min-w-0 max-w-full [^"]*" data-testid="mobile-tile-picker"/);
    expect(html).toContain('flex gap-2 overflow-x-auto pb-1');
  });

  it('renders the original visual hand workspace and MCR evidence/result surfaces for MCR', () => {
    const html = renderToStaticMarkup(<HandScorer context={null} onClose={vi.fn()} standaloneHand standaloneRulesProfile={mcrProfile} onStandaloneRulesProfileChange={vi.fn()} />);
    expect(html).toContain('data-testid="working-picker"');
    expect(html).toContain('data-testid="hand-so-far"');
    expect(html).toContain('data-testid="button-layout-special"');
    expect(html).toContain('data-testid="mcr-evidence-controls"');
    expect(html).toContain('data-testid="mcr-score-result"');
    expect(html).not.toContain('data-testid="button-apply-score-mobile"');
    expect(html).toContain('data-testid="mcr-win-source"');
    expect(html).toContain('data-testid="mcr-seat-wind"');
    expect(html).toContain('data-testid="mcr-prevailing-wind"');
    expect(html).not.toMatch(/\bdouble(s)?\b|table limit|fishing/i);
    const handPicker = renderToStaticMarkup(<RulesProfilePicker surface="hand" prompt="Hand rules" selectedProfile={mcrProfile} onSelect={vi.fn()} />);
    const gamePicker = renderToStaticMarkup(<RulesProfilePicker surface="game" prompt="Game rules" selectedProfile={{ id: 'bmja', version: '1.0' }} onSelect={vi.fn()} />);
    expect(handPicker.match(/data-testid="rules-card-/g)).toHaveLength(5);
    expect(handPicker).toContain('rules-card-mcr');
    expect(gamePicker.match(/data-testid="rules-card-/g)).toHaveLength(5);
    expect(gamePicker).toContain('rules-card-mcr');
  });

  it('places the standalone hand, bonuses, rules, MCR context and result in hand-first order', () => {
    const html = renderToStaticMarkup(<HandScorer context={null} onClose={vi.fn()} standaloneHand standaloneRulesProfile={mcrProfile} onStandaloneRulesProfileChange={vi.fn()} />);
    const order = ['working-picker', 'hand-so-far', 'bonus-tiles', 'rules-profile-picker', 'mobile-hand-context', 'mcr-evidence-controls', 'mobile-live-result', 'mcr-score-result'];
    const positions = order.map((testId) => html.indexOf(`data-testid="${testId}"`));
    expect(positions.every((position) => position >= 0)).toBe(true);
    expect(positions).toEqual([...positions].sort((left, right) => left - right));

    const workingPickerEnd = html.indexOf('</section>', positions[0]);
    expect(positions[6]).toBeGreaterThan(workingPickerEnd);
  });

  it('locks table-owned MCR context while preserving editable scorer evidence', () => {
    const game = createGame([{ id: 'A', name: 'A' }, { id: 'B', name: 'B' }, { id: 'C', name: 'C' }, { id: 'D', name: 'D' }], { A: 'east', B: 'south', C: 'west', D: 'north' }, undefined, 'full-game', mcrProfile);
    const context = createHandScorerContext(game, 'B', { type: 'mcr-win', winnerId: 'B', winSource: 'discard' });
    const html = renderToStaticMarkup(<HandScorer context={context} onClose={vi.fn()} standaloneHand={false} standaloneRulesProfile={BMJA_PROFILE_REF} onStandaloneRulesProfileChange={vi.fn()} />);
    expect(html).not.toContain('data-testid="mcr-win-source"');
    expect(html).not.toContain('data-testid="mcr-seat-wind"');
    expect(html).not.toContain('data-testid="mcr-prevailing-wind"');
    expect(html).toContain('data-testid="mcr-locked-table-context"');
    expect(html).toContain('Discard'); expect(html).toContain('south'); expect(html).toContain('east');
    expect(html).toContain('data-testid="mcr-win-event"');
    expect(html).toContain('Last visible copy');
    expect(html).not.toContain('button-apply-mcr-score');
  });

  it('renders a bounded internal MCR table with no manual score inputs or Classical settlement copy', () => {
    const game = createGame([{ id: 'A', name: 'A' }, { id: 'B', name: 'B' }, { id: 'C', name: 'C' }, { id: 'D', name: 'D' }], { A: 'east', B: 'south', C: 'west', D: 'north' }, undefined, 'full-game', mcrProfile);
    const data = new Map<string, string>();
    const storage = { getItem: (key: string) => data.get(key) ?? null, setItem: (key: string, value: string) => data.set(key, value), removeItem: (key: string) => data.delete(key) };
    const currentRound: PersistedCurrentRoundV2 = { grammar: 'pattern-accumulator', draft: { scores: {}, scoreRecords: {} } };
    saveGameRecoveryV2(storage, game, currentRound);
    data.set(PREFERRED_RULES_PROFILE_STORAGE_KEY, JSON.stringify(BMJA_PROFILE_REF));
    vi.stubGlobal('window', { localStorage: storage });
    try {
      const html = renderToStaticMarkup(<GameScorer initialRulesProfile={BMJA_PROFILE_REF} initialRulesProfileIsExplicit={false} onOpenHandScorer={vi.fn()} onClearReturnedScore={vi.fn()} />);
      expect(html).toContain('data-testid="mcr-outcome-win"');
      expect(html).toContain('data-testid="mcr-outcome-draw"');
      expect(html).toContain('MCR / WMO 2006');
      expect(data.get(PREFERRED_RULES_PROFILE_STORAGE_KEY)).toBe(JSON.stringify(BMJA_PROFILE_REF));
      expect(html).not.toContain('data-testid="input-score-');
      expect(html).not.toContain('Who pays whom');
      expect(html).not.toContain('Round settlement');
      expect(html).not.toContain('Records this settlement');
    } finally { vi.unstubAllGlobals(); }
  });
});
