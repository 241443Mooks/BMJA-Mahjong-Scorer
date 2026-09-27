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

  it('places MCR hand entry first and keeps the collapsed picker and supporting material below the task header', () => {
    const html = renderToStaticMarkup(<HandScorer context={null} onClose={vi.fn()} standaloneHand standaloneRulesProfile={mcrProfile} onStandaloneRulesProfileChange={vi.fn()} />);
    expect(html).toContain('<h1 data-testid="hand-scorer-title"');
    expect(html).toContain('Mahjong hand calculator');
    expect(html).toContain('Change rules');
    expect(html).toContain('data-testid="standalone-rules-row"');
    expect(html).toMatch(/data-testid="standalone-rules-row"[^>]*>.*?data-testid="active-rules".*?Change rules/s);
    expect(html).toContain('data-testid="mobile-tile-progress"');
    expect(html).toMatch(/data-testid="tile-entry-shell" class="[^"]*rounded-none border-0 bg-transparent p-0 shadow-none/);
    expect(html).toMatch(/class="[^"]*hidden sm:flex[^"]*"[^>]*>.*?Arrange the tiles/s);
    expect(html).toMatch(/data-testid="completed-groups-empty-state" class="[^"]*hidden sm:block/);
    expect(html).not.toContain('data-testid="detected-patterns"');
    expect(html).not.toContain('data-testid="rules-profile-picker"');
    const order = ['hand-scorer-title', 'active-rules', 'button-load-example', 'working-picker', 'hand-so-far', 'bonus-tiles', 'mcr-evidence-controls', 'mobile-live-result', 'mcr-score-result', 'calculator-supporting-info'];
    const positions = order.map((testId) => html.indexOf(`data-testid="${testId}"`));
    expect(positions.every((position) => position >= 0)).toBe(true);
    expect(positions).toEqual([...positions].sort((left, right) => left - right));

    expect(html.indexOf('Understand settlement')).toBe(-1);
    expect(html.indexOf('About this calculator / How scoring works')).toBeGreaterThan(positions[9]);
    expect(html).not.toContain('data-testid="mobile-hand-context"');
    expect(html).toContain('data-testid="bonus-tile-strip"');
    const flowerStrip = html.match(/<div data-testid="flower-tile-strip"[^>]*>([\s\S]*?)<\/div>/)?.[0] ?? '';
    const seasonStrip = html.match(/<div data-testid="season-tile-strip"[^>]*>([\s\S]*?)<\/div>/)?.[0] ?? '';
    expect(flowerStrip).toContain('overflow-x-auto');
    expect(seasonStrip).toContain('overflow-x-auto');
    expect(flowerStrip.match(/data-testid="button-flower-/g)).toHaveLength(4);
    expect(seasonStrip.match(/data-testid="button-season-/g)).toHaveLength(4);
  });

  it('opens Classical standalone on a compact task header with supporting links after the scorer', () => {
    const html = renderToStaticMarkup(<HandScorer context={null} onClose={vi.fn()} standaloneHand standaloneRulesProfile={BMJA_PROFILE_REF} onStandaloneRulesProfileChange={vi.fn()} />);
    expect(html.match(/<h1\b/g)).toHaveLength(1);
    expect(html).toContain('Mahjong hand calculator');
    expect(html).toContain('Rules:');
    expect(html).toContain('Change rules');
    expect(html).not.toContain('New hand · ready to enter');
    expect(html.indexOf('Arrange the tiles')).toBeGreaterThan(html.indexOf('Change rules'));
    const workingPicker = html.slice(html.indexOf('data-testid="working-picker"'), html.indexOf('data-testid="hand-so-far"'));
    expect(workingPicker).toContain('data-testid="mobile-tile-progress"');
    const openingHeader = html.slice(html.indexOf('data-testid="hand-scorer-title"'), html.indexOf('Arrange the tiles'));
    expect(openingHeader).not.toContain('Leave hand and go home');
    expect(openingHeader).not.toContain('Enter your tiles visually');
    expect(openingHeader).not.toContain('Need to see who pays whom');
    expect(html.indexOf('About this calculator / How scoring works')).toBeGreaterThan(html.indexOf('button-apply-score-mobile'));
    expect(html).toContain('Understand settlement');
    expect(html).toContain('track a full game');
    expect(html).toContain('Leave hand and go home');
    expect(html).toContain('data-testid="remaining-tile-preview"');
    expect(html).toContain('flex-wrap justify-end gap-x-1 gap-y-1');
    expect(html).toMatch(/data-testid="completed-groups-empty-state" class="[^"]*hidden sm:block/);
  });

  it('locks table-owned MCR context while preserving editable scorer evidence', () => {
    const game = createGame([{ id: 'A', name: 'A' }, { id: 'B', name: 'B' }, { id: 'C', name: 'C' }, { id: 'D', name: 'D' }], { A: 'east', B: 'south', C: 'west', D: 'north' }, undefined, 'full-game', mcrProfile);
    const context = createHandScorerContext(game, 'B', { type: 'mcr-win', winnerId: 'B', winSource: 'discard' });
    const html = renderToStaticMarkup(<HandScorer context={context} onClose={vi.fn()} standaloneHand={false} standaloneRulesProfile={BMJA_PROFILE_REF} onStandaloneRulesProfileChange={vi.fn()} />);
    expect(html).not.toContain('data-testid="mcr-win-source"');
    expect(html).not.toContain('data-testid="mcr-seat-wind"');
    expect(html).not.toContain('data-testid="mcr-prevailing-wind"');
    expect(html).toContain('data-testid="mcr-locked-table-context"');
    expect(html).toContain('data-testid="mobile-hand-context"');
    expect(html).toContain('data-testid="mobile-inherited-context"');
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
